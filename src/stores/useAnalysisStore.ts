import { create } from 'zustand'
import type { AnalysisType } from '../types/analysis'

interface AnalysisStoreState {
  selectedType: AnalysisType
  customQuery: string
  isRunning: boolean
  streamingResult: string
  selectedHistoryId: number | null
  setType: (type: AnalysisType) => void
  setCustomQuery: (query: string) => void
  setRunning: (running: boolean) => void
  appendStreamChunk: (chunk: string) => void
  clearStreamingResult: () => void
  selectHistory: (id: number | null) => void
}

export const useAnalysisStore = create<AnalysisStoreState>((set) => ({
  selectedType: 'Treatment Gap',
  customQuery: '',
  isRunning: false,
  streamingResult: '',
  selectedHistoryId: null,

  setType: (type) => set({ selectedType: type }),
  setCustomQuery: (query) => set({ customQuery: query }),
  setRunning: (running) => set({ isRunning: running }),
  appendStreamChunk: (chunk) =>
    set((state) => ({ streamingResult: state.streamingResult + chunk })),
  clearStreamingResult: () => set({ streamingResult: '' }),
  selectHistory: (id) => set({ selectedHistoryId: id }),
}))
