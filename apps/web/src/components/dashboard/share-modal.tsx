'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'

interface ShareModalProps {
  formId: string
  formTitle: string
  onClose: () => void
}

const MAX_QR_BYTES = 3000
const DESC_PLACEHOLDER_PREFIX = 'Full description available at '

function safeFilename(title: string, suffix: string): string {
  return `${title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-${suffix}`
}

function DownloadSvg({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

export function ShareModal({ formId, formTitle, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [configJson, setConfigJson] = useState<Record<string, unknown> | null>(null)
  const [configQrDataUrl, setConfigQrDataUrl] = useState<string | null>(null)
  const [qrPopup, setQrPopup] = useState<{ type: 'share' | 'config'; title: string } | null>(null)
  const [hdQrDataUrl, setHdQrDataUrl] = useState<string | null>(null)
  const [serverOrigin, setServerOrigin] = useState(window.location.origin)
  const shareUrl = `${serverOrigin}/f/${formId}`

  function openQrPopup(type: 'share' | 'config') {
    const title = type === 'share' ? 'Scan to open form' : 'Scan to import offline'
    setQrPopup({ type, title })
    setHdQrDataUrl(type === 'share' ? qrDataUrl : configQrDataUrl)
  }

  function closeQrPopup() {
    setQrPopup(null)
    setHdQrDataUrl(null)
  }

  useEffect(() => {
    QRCode.toDataURL(shareUrl, { width: 1024, margin: 2 }).then(setQrDataUrl)
  }, [shareUrl])

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/forms/${formId}/export`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Export failed')
        return r.json()
      })
      .then((config) => {
        if (typeof config._serverUrl === 'string') {
          setServerOrigin(config._serverUrl)
        }
        setConfigJson(config)
        const lean = { ...config }
        const json = JSON.stringify(lean)
        const prefix = 'fieldkit://config/'
        if (new Blob([prefix + json]).size <= MAX_QR_BYTES) {
          return QRCode.toDataURL(prefix + json, { width: 1024, margin: 2 })
        }
        lean.description = `${DESC_PLACEHOLDER_PREFIX}${shareUrl}`
        return QRCode.toDataURL(prefix + JSON.stringify(lean), { width: 1024, margin: 2 })
      })
      .then(setConfigQrDataUrl)
      .catch((err) => {
        if ((err as Error).name !== 'AbortError') {
          console.error('Config QR failed:', err)
        }
      })
    return () => controller.abort()
  }, [formId])

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function exportConfig() {
    if (!configJson) return
    const blob = new Blob([JSON.stringify(configJson, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = safeFilename(formTitle, 'config.json')
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadQR() {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = safeFilename(formTitle, 'qr.png')
    a.click()
  }

  function downloadConfigQR() {
    if (!configQrDataUrl) return
    const a = document.createElement('a')
    a.href = configQrDataUrl
    a.download = safeFilename(formTitle, 'mobile-qr.png')
    a.click()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative max-h-[90dvh] w-full max-w-[480px] overflow-y-auto rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-8 max-sm:p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[20px] text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ×
        </button>

        {/* Online share section */}
        <h3 className="mb-2 font-sans text-[20px] font-medium text-[var(--foreground)]">
          Share online
        </h3>
        <p className="mb-4 text-[14px] text-[var(--muted)]">
          Anyone with the link can submit responses.
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[13px] text-[var(--foreground)]"
          />
          <button
            onClick={copyLink}
            className="whitespace-nowrap rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-4 py-2 text-[13px] font-medium text-[var(--background)] transition-opacity hover:opacity-80"
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>

        {/* Online QR Code */}
        {qrDataUrl && (
          <div className="mt-5 flex items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={qrDataUrl}
                alt="Online form QR"
                className="h-[100px] w-[100px] cursor-pointer rounded-[8px] border-[2px] border-[#2563eb] transition-opacity hover:opacity-80"
                onClick={() => openQrPopup('share')}
              />
              <span className="absolute -top-2 -right-2 rounded-full bg-[#2563eb] px-2 py-0.5 text-[9px] font-semibold text-white">ONLINE</span>
              <p className="mt-1.5 text-center text-[11px] text-[var(--muted)]">Click to enlarge</p>
            </div>
            <div>
              <p className="mb-2 text-[13px] text-[var(--muted)]">Scan to open the form</p>
              <button
                onClick={downloadQR}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 py-1.5 text-[12px] font-medium text-[var(--foreground)] transition-colors hover:border-[var(--foreground)]"
              >
                <DownloadSvg />
                Download QR
              </button>
            </div>
          </div>
        )}

        {/* Mobile import section */}
        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <h4 className="mb-1 text-[14px] font-medium text-[var(--foreground)]">Mobile import</h4>
          <p className="mb-3 text-[13px] text-[var(--muted)]">
            Scan with the FieldKit mobile app to import this form for offline use.
          </p>
          {configQrDataUrl ? (
            <>
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
              <img
                src={configQrDataUrl}
                alt="Mobile config QR"
                className="h-[100px] w-[100px] cursor-pointer rounded-[8px] border-[2px] border-[var(--accent)] transition-opacity hover:opacity-80"
                onClick={() => openQrPopup('config')}
              />
              <span className="absolute -top-2 -right-2 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[9px] font-semibold text-white">OFFLINE</span>
              <p className="mt-1.5 text-center text-[11px] text-[var(--muted)]">Click to enlarge</p>
            </div>
              <div>
                <p className="mb-2 text-[13px] text-[var(--muted)]">Scan to import offline</p>
                <button
                  onClick={downloadConfigQR}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 py-1.5 text-[12px] font-medium text-[var(--foreground)] transition-colors hover:border-[var(--foreground)]"
                >
                  <DownloadSvg />
                  Download QR
                </button>
              </div>
            </div>
            <p className="mt-2 text-[11px] font-mono text-[var(--muted)]">
              Server: {serverOrigin}
            </p>
            </>
          ) : (
            <p className="text-[13px] text-[var(--muted)]">Loading config QR…</p>
          )}
        </div>

        {/* Local server section */}
        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <h4 className="mb-1 text-[14px] font-medium text-[var(--foreground)]">Local server</h4>
          <p className="mb-3 text-[13px] text-[var(--muted)]">
            Export config to use this form on a local network with the FieldKit local server.
          </p>
          <button
            onClick={exportConfig}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[13px] font-medium text-[var(--foreground)] transition-colors hover:border-[var(--foreground)]"
          >
            <DownloadSvg size={14} />
            Export for local server (.json)
          </button>
        </div>
      </div>

      {/* QR popup overlay */}
      {qrPopup && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-2"
          onClick={closeQrPopup}
        >
          <div
            className="flex w-full max-w-[480px] flex-col items-center rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeQrPopup}
              className="mb-3 self-end flex h-8 w-8 items-center justify-center rounded-full text-[22px] leading-none text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              ×
            </button>
            {hdQrDataUrl ? (
              <img
                src={hdQrDataUrl}
                alt={qrPopup.title}
                className="w-full max-w-[420px] aspect-square rounded-[8px] border border-[var(--border)]"
              />
            ) : (
              <div className="flex w-full max-w-[420px] aspect-square items-center justify-center rounded-[8px] border border-[var(--border)]">
                <span className="text-[14px] text-[var(--muted)]">Loading…</span>
              </div>
            )}
            <p className="mt-4 w-full text-center text-[16px] font-medium text-[var(--foreground)] break-words">{qrPopup.title}</p>
            <p className="mt-1 w-full max-w-full text-center text-[13px] text-[var(--muted)] break-all">
              {qrPopup.type === 'share' ? shareUrl : 'Open the FieldKit mobile app to scan'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
