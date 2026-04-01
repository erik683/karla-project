import { create } from 'zustand'

interface ResearchStoreState {
  selectedItemId: number | null
  isFormOpen: boolean
  isDetailOpen: boolean
  filterCategory: string | null
  filterPriority: string | null
  selectItem: (id: number | null) => void
  openForm: () => void
  closeForm: () => void
  openDetail: (id: number) => void
  closeDetail: () => void
  setFilterCategory: (category: string | null) => void
  setFilterPriority: (priority: string | null) => void
}

export const useResearchStore = create<ResearchStoreState>((set) => ({
  selectedItemId: null,
  isFormOpen: false,
  isDetailOpen: false,
  filterCategory: null,
  filterPriority: null,

  selectItem: (id) => set({ selectedItemId: id }),
  openForm: () => set({ isFormOpen: true }),
  closeForm: () => set({ isFormOpen: false }),
  openDetail: (id) => set({ selectedItemId: id, isDetailOpen: true }),
  closeDetail: () => set({ isDetailOpen: false, selectedItemId: null }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
}))
