import { useEffect } from 'react'
import { AppState } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import { useStore } from '../store'
import { getServerUrl } from '../api/server'

const PROBE_TIMEOUT_MS = 5000

async function ping(url: string, signal?: AbortSignal): Promise<boolean> {
  try {
    await fetch(url, { method: 'GET', cache: 'no-store', signal })
    return true
  } catch {
    return false
  }
}

export function useConnectivity() {
  const setOnline = useStore((s) => s.setOnline)
  const isSyncing = useStore((s) => s.isSyncing)

  useEffect(() => {
    let active = true

    const check = async () => {
      // Don't probe while sync is running — avoids AbortController
      // races in the whatwg-fetch polyfill.
      if (isSyncing) return

      const state = await NetInfo.fetch()
      if (!state.isConnected) {
        setOnline(false)
        return
      }

      const serverUrl = await getServerUrl()
      if (!serverUrl) {
        setOnline(false)
        return
      }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)

      try {
        const ok = await ping(serverUrl, controller.signal)
        if (active) setOnline(ok)
      } catch {
        if (active) setOnline(false)
      } finally {
        clearTimeout(timeout)
      }
    }

    check()

    const unsub = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        check()
      } else {
        setOnline(false)
      }
    })

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        check()
      }
    })

    return () => {
      active = false
      unsub()
      appStateSub.remove()
    }
  }, [setOnline, isSyncing])
}
