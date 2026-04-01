import { create } from 'zustand'

export type AppModule =
  | 'patient'
  | 'research'
  | 'trials'
  | 'analysis'
  | 'brief'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface AppState {
  activeModule: AppModule
  toasts: Toast[]
  setActiveModule: (module: AppModule) => void
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'patient',
  toasts: [],

  setActiveModule: (module) => set({ activeModule: module }),

  addToast: (message, type = 'success') => {
    const id = crypto.randomUUID()
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }))
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
