import { randomBytes } from 'crypto'
import { networkInterfaces } from 'os'
import dgram from 'dgram'
import { NextResponse } from 'next/server'
import { lookup } from 'node:dns/promises'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const IMG_SRC_RE = /<img\s+[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi
const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10MB

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
]

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((r) => r.test(ip))
}

function isLoopbackHost(hostname: string): boolean {
  const lower = hostname.toLowerCase()
  return lower === 'localhost' || lower === '::1' || lower === '[::1]' || lower === '0.0.0.0' || lower.startsWith('127.')
}

function parsePort(rawHost: string): string {
  const idx = rawHost.lastIndexOf(':')
  if (idx === -1) return ''
  const after = rawHost.slice(idx + 1)
  // IPv6 addresses contain colons; only treat as port if numeric
  return /^\d+$/.test(after) ? rawHost.slice(idx) : ''
}

function parseHostname(rawHost: string): string {
  // Bracketed IPv6 host: [::1]:3000
  if (rawHost.startsWith('[')) {
    const end = rawHost.indexOf(']')
    if (end !== -1) return rawHost.slice(1, end)
    return rawHost
  }

  const idx = rawHost.indexOf(':')
  return idx === -1 ? rawHost : rawHost.slice(0, idx)
}

function getOutboundIp(): Promise<string | null> {
  return new Promise((resolve) => {
    const socket = dgram.createSocket('udp4')
    const timeout = setTimeout(() => {
      socket.close()
      resolve(null)
    }, 2000)

    socket.on('error', () => {
      clearTimeout(timeout)
      socket.close()
      resolve(null)
    })

    // Connect to a public IP to determine local address (no data is sent)
    socket.connect(80, '1.1.1.1', () => {
      const addr = socket.address()
      clearTimeout(timeout)
      socket.close()
      if (addr && typeof addr.address === 'string') {
        resolve(addr.address)
      } else {
        resolve(null)
      }
    })
  })
}

async function resolveServerUrl(
  hostHeader: string | null,
  forwardedHost: string | undefined,
  forwardedProto: string | undefined,
  defaultProto: string,
  defaultHost: string
): Promise<string> {
  // Use forwarded headers if present (reverse proxy), unless they point to loopback.
  if (forwardedHost) {
    const protocol = forwardedProto || defaultProto
    const forwardedHostname = parseHostname(forwardedHost)
    if (!isLoopbackHost(forwardedHostname)) {
      return `${protocol}://${forwardedHost}`
    }
    console.log('[export] Ignoring loopback x-forwarded-host:', forwardedHost)
  }

  // Determine the host the client is using
  const rawHost = hostHeader || defaultHost
  const port = parsePort(rawHost)
  const hostname = parseHostname(rawHost)

  // If client is accessing via localhost/loopback, replace with LAN IP so mobile can reach it
  if (isLoopbackHost(hostname)) {
    // 1. Env var override (explicit always wins)
    const envUrl = process.env.FIELDKIT_SERVER_URL
    if (envUrl) {
      console.log('[export] Using FIELDKIT_SERVER_URL:', envUrl)
      return envUrl
    }

    // 2. Try scanning network interfaces
    const ifaceIp = getLanIp()
    if (ifaceIp) {
      console.log('[export] LAN IP (iface):', ifaceIp)
      return `http://${ifaceIp}${port}`
    }

    // 3. Try socket connect to determine outbound IP
    const outboundIp = await getOutboundIp()
    if (outboundIp) {
      console.log('[export] LAN IP (socket):', outboundIp)
      return `http://${outboundIp}${port}`
    }

    console.warn('[export] Could not detect LAN IP — using localhost (mobile will not reach this)')
  }

  return `${defaultProto}://${rawHost}`
}


function getStorageHostname(): string | null {
  const endpoint = process.env.S3_ENDPOINT
  if (!endpoint) return null
  try {
    return new URL(endpoint).hostname
  } catch {
    return null
  }
}

// Deprioritized interface name patterns (virtual, tunnel, VM, Docker, etc.)
const VIRTUAL_IFACE_RE = /^(utun|llw|awdl|bridge|veth|docker|tun|tap|vmnet|vboxnet|lo|gif|stf|anpi|ap|fw|pdp_ip)/i

// Preferred LAN subnets (sorted: most common first)
const LAN_SUBNETS = [
  /^192\.168\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
]

function getLanIp(): string | null {
  const ifaces = networkInterfaces()
  const all: { addr: string; name: string; priority: number }[] = []

  for (const name of Object.keys(ifaces)) {
    const net = ifaces[name]
    if (!net) continue
    for (const addr of net) {
      if (addr.family !== 'IPv4' || addr.internal) continue

      let priority = 0

      // Boost common physical interfaces
      if (/^en\d|^eth\d|^wlan\d|^wl\w/i.test(name)) priority -= 100

      // Penalize virtual/tunnel interfaces
      if (VIRTUAL_IFACE_RE.test(name)) priority += 100

      // Boost preferred subnets
      const subnetIdx = LAN_SUBNETS.findIndex((re) => re.test(addr.address))
      if (subnetIdx !== -1) priority -= 50 + subnetIdx * 10

      all.push({ addr: addr.address, name, priority })
    }
  }

  all.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name))

  if (all.length > 0) {
    console.log('[export] LAN IP detected:', all[0].addr, `(interface: ${all[0].name}, candidates: ${all.length})`)
  } else {
    console.warn('[export] No LAN IP found! Set FIELDKIT_SERVER_URL in .env.local')
    console.warn('[export] All interfaces:', JSON.stringify(
      Object.entries(ifaces).map(([name, addrs]) => ({
        name,
        addrs: addrs?.map((a) => ({ family: a.family, internal: a.internal, address: a.address }))
      }))
    ))
  }

  return all.length > 0 ? all[0].addr : null
}

async function validateUrl(url: string): Promise<void> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('Invalid URL')
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Blocked protocol: ' + parsed.protocol)
  }

  const hostname = parsed.hostname
  const storageHost = getStorageHostname()
  if (storageHost && hostname === storageHost) return

  if (hostname === 'localhost' || isPrivateIp(hostname)) {
    throw new Error('Blocked internal host')
  }

  const resolved = await lookup(hostname, { all: true })
  for (const addr of resolved) {
    if (isPrivateIp(addr.address)) {
      throw new Error('Blocked private IP: ' + addr.address)
    }
  }
}

async function fetchImageAsBase64(url: string): Promise<string> {
  await validateUrl(url)

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })

  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)

  const contentLength = res.headers.get('content-length')
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    if (isNaN(size) || size > MAX_IMAGE_BYTES) {
      throw new Error('Image too large')
    }
  }

  const rawContentType = res.headers.get('content-type') ?? ''
  if (!rawContentType.startsWith('image/')) {
    throw new Error('Not an image: ' + rawContentType)
  }
  const contentType = rawContentType.split(';')[0].trim()

  const buffer = Buffer.from(await res.arrayBuffer())
  const b64 = buffer.toString('base64')
  return `data:${contentType};base64,${b64}`
}

async function inlineImages(html: string): Promise<string> {
  const matches = [...html.matchAll(IMG_SRC_RE)]

  const results = await Promise.allSettled(
    matches.map(async (m) => {
      const src = m[1]
      if (src.startsWith('data:')) return { src, replacement: src }
      const b64 = await fetchImageAsBase64(src)
      return { src, replacement: b64 }
    })
  )

  const map = new Map<string, string>()
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      map.set(matches[i][1], r.value.replacement)
    } else {
      console.error('Image fetch failed for form export:', matches[i][1], r.reason)
    }
  })

  return html.replace(IMG_SRC_RE, (full, src) => {
    const replacement = map.get(src)
    return replacement ? full.replace(src, replacement) : full
  })
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await db.form.findFirst({
    where: { id: id, userId: session.user.id },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let secret = form.mobileSecret
  if (!secret) {
    secret = randomBytes(24).toString('base64url')
    await db.form.update({
      where: { id: form.id },
      data: { mobileSecret: secret },
    })
  }

  const description = await inlineImages(form.description ?? '')

  const requestUrl = new URL(req.url)
  const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const hostHeader = req.headers.get('host')
  const defaultProto = requestUrl.protocol.replace(':', '') || 'https'

  const serverUrl = await resolveServerUrl(hostHeader, forwardedHost, forwardedProto, defaultProto, requestUrl.host)

  console.log('[export] _serverUrl =', serverUrl)

  const schema = form.schema as Record<string, unknown>
  const config = {
    formId: form.id,
    ...(schema.fields !== undefined ? { fields: schema.fields } : {}),
    ...(schema.settings !== undefined ? { settings: schema.settings } : {}),
    title: form.title,
    description,
    version: form.version,
    secret,
    exportedAt: new Date().toISOString(),
    _serverUrl: serverUrl,
  }

  return NextResponse.json(config)
}
