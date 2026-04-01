import { create } from 'zustand'
import { db } from '../db/database'

interface SettingsState {
  claudeApiKey: string
  isSettingsOpen: boolean
  isLoaded: boolean
  loadSettings: () => Promise<void>
  saveApiKey: (key: string) => Promise<void>
  openSettings: () => void
  closeSettings: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  claudeApiKey: '',
  isSettingsOpen: false,
  isLoaded: false,

  loadSettings: async () => {
    const record = await db.settings.get('claudeApiKey')
    set({ claudeApiKey: record?.value ?? '', isLoaded: true })
  },

  saveApiKey: async (key) => {
    await db.settings.put({ key: 'claudeApiKey', value: key })
    set({ claudeApiKey: key })
  },

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
}))
