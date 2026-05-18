import { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { useStore } from '../store'

export function useConnectivity() {
  const setOnline = useStore((s) => s.setOnline)

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected)
    })
    return () => unsub()
  }, [setOnline])
}
