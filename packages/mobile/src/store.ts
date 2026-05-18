import { create } from 'zustand'
import { FormRecord } from './types'

interface AppState {
  forms: FormRecord[]
  isOnline: boolean
  isSyncing: boolean
  lastSynced: number | null
  serverUrl: string

  setForms: (forms: FormRecord[]) => void
  addForm: (form: FormRecord) => void
  setOnline: (online: boolean) => void
  setSyncing: (syncing: boolean) => void
  setLastSynced: (ts: number) => void
  setServerUrl: (url: string) => void
}

export const useStore = create<AppState>((set) => ({
  forms: [],
  isOnline: true,
  isSyncing: false,
  lastSynced: null,
  serverUrl: '',

  setForms: (forms) => set({ forms }),
  addForm: (form) => set((s) => ({ forms: [...s.forms, form] })),
  setOnline: (isOnline) => set({ isOnline }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSynced: (lastSynced) => set({ lastSynced }),
  setServerUrl: (serverUrl) => set({ serverUrl }),
}))
