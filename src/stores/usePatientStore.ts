import { create } from 'zustand'

interface PatientStoreState {
  isVersionHistoryOpen: boolean
  isSummaryOpen: boolean
  openVersionHistory: () => void
  closeVersionHistory: () => void
  openSummary: () => void
  closeSummary: () => void
}

export const usePatientStore = create<PatientStoreState>((set) => ({
  isVersionHistoryOpen: false,
  isSummaryOpen: false,
  openVersionHistory: () => set({ isVersionHistoryOpen: true }),
  closeVersionHistory: () => set({ isVersionHistoryOpen: false }),
  openSummary: () => set({ isSummaryOpen: true }),
  closeSummary: () => set({ isSummaryOpen: false }),
}))
