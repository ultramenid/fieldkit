import { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { useStore } from '../store'

const PROBE_URL = 'https://www.gstatic.com/generate_204'
const PROBE_TIMEOUT_MS = 5000

async function hasInternetAccess(): Promise<boolean> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)

  try {
    const res = await fetch(PROBE_URL, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    })

    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

export function useConnectivity() {
  const setOnline = useStore((s) => s.setOnline)

  useEffect(() => {
    let active = true
    let seq = 0

    const unsub = NetInfo.addEventListener((state) => {
      seq += 1
      const currentSeq = seq

      // No link means definitely offline.
      if (!state.isConnected) {
        setOnline(false)
        return
      }

      // OS-level reachability can short-circuit dead/captive connections.
      if (state.isInternetReachable === false) {
        setOnline(false)
        return
      }

      void (async () => {
        const online = await hasInternetAccess()
        if (!active || currentSeq !== seq) return
        setOnline(online)
      })()
    })

    return () => {
      active = false
      unsub()
    }
  }, [setOnline])
}
