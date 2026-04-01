import { create } from 'zustand'

interface BriefStoreState {
  activeBriefId: number | null
  isPreviewOpen: boolean
  isVersionHistoryOpen: boolean
  isGeneratingSummary: boolean
  isGeneratingQuestions: boolean
  setActiveBrief: (id: number | null) => void
  openPreview: () => void
  closePreview: () => void
  openVersionHistory: () => void
  closeVersionHistory: () => void
  setGeneratingSummary: (v: boolean) => void
  setGeneratingQuestions: (v: boolean) => void
}

export const useBriefStore = create<BriefStoreState>((set) => ({
  activeBriefId: null,
  isPreviewOpen: false,
  isVersionHistoryOpen: false,
  isGeneratingSummary: false,
  isGeneratingQuestions: false,

  setActiveBrief: (id) => set({ activeBriefId: id }),
  openPreview: () => set({ isPreviewOpen: true }),
  closePreview: () => set({ isPreviewOpen: false }),
  openVersionHistory: () => set({ isVersionHistoryOpen: true }),
  closeVersionHistory: () => set({ isVersionHistoryOpen: false }),
  setGeneratingSummary: (v) => set({ isGeneratingSummary: v }),
  setGeneratingQuestions: (v) => set({ isGeneratingQuestions: v }),
}))
