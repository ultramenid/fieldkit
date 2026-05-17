#!/usr/bin/env node
import { createServer } from './server'
import path from 'path'
import os from 'os'

const args = process.argv.slice(2)
const portArg = args.find((a) => a.startsWith('--port='))
const port = portArg ? parseInt(portArg.split('=')[1]) : 3001
const dataDir = path.join(os.homedir(), '.fieldkit', 'data')

const app = createServer(dataDir, port)

app.listen(port, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces()
  let lanIp = 'unknown'
  for (const iface of Object.values(interfaces)) {
    for (const addr of iface ?? []) {
      if (addr.family === 'IPv4' && !addr.internal) {
        lanIp = addr.address
        break
      }
    }
  }

  console.log(`
┌─────────────────────────────────────────┐
│  FieldKit Local Server v0.1.0           │
│                                         │
│  Admin:   http://localhost:${port}         │
│  Network: http://${lanIp}:${port}    │
│                                         │
│  Open the admin panel to import forms   │
└─────────────────────────────────────────┘
`)
})
