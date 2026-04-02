import { create } from 'zustand'
import type { ClinicalTrialSearchResult, TrialSearchParams } from '../types/trials'

interface TrialsStoreState {
  searchResults: ClinicalTrialSearchResult[]
  isSearching: boolean
  searchError: string | null
  selectedTrialNctId: string | null
  isDetailOpen: boolean
  currentParams: TrialSearchParams
  nextPageToken: string | null
  setSearchResults: (results: ClinicalTrialSearchResult[], nextPageToken: string | null) => void
  appendSearchResults: (results: ClinicalTrialSearchResult[], nextPageToken: string | null) => void
  setSearching: (loading: boolean) => void
  setSearchError: (error: string | null) => void
  openDetail: (nctId: string) => void
  closeDetail: () => void
  setParams: (params: TrialSearchParams) => void
}

const defaultParams: TrialSearchParams = {
  condition: '',
  interventionType: '',
  phases: [],
  statuses: ['RECRUITING'],
  location: '',
  age: '',
  sex: '',
}

export const useTrialsStore = create<TrialsStoreState>((set) => ({
  searchResults: [],
  isSearching: false,
  searchError: null,
  selectedTrialNctId: null,
  isDetailOpen: false,
  currentParams: defaultParams,
  nextPageToken: null,

  setSearchResults: (results, nextPageToken) =>
    set({ searchResults: results, nextPageToken }),
  appendSearchResults: (results, nextPageToken) =>
    set((s) => ({ searchResults: [...s.searchResults, ...results], nextPageToken })),
  setSearching: (loading) => set({ isSearching: loading }),
  setSearchError: (error) => set({ searchError: error }),
  openDetail: (nctId) => set({ selectedTrialNctId: nctId, isDetailOpen: true }),
  closeDetail: () => set({ isDetailOpen: false, selectedTrialNctId: null }),
  setParams: (params) => set({ currentParams: params }),
}))
