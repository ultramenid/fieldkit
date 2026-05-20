import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useStore } from '../store'
import { syncAll } from '../sync/engine'

export function useSync() {
  const isOnline = useStore((s) => s.isOnline)
  const isSyncing = useStore((s) => s.isSyncing)
  const setSyncing = useStore((s) => s.setSyncing)
  const setLastSynced = useStore((s) => s.setLastSynced)
  const appState = useRef<AppStateStatus>('active')

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (isOnline && !isSyncing) runSync()
      }
      appState.current = nextState
    })
    return () => sub.remove()
  }, [isOnline, isSyncing])

  useEffect(() => {
    if (isOnline && !isSyncing) {
      runSync()
    }
  }, [isOnline])

  const runSync = async () => {
    setSyncing(true)
    try {
      const result = await syncAll()
      if (result.synced > 0) {
        setLastSynced(Date.now())
      }
    } catch {} finally {
      setSyncing(false)
    }
  }
}
