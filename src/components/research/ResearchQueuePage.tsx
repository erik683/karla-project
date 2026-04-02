import { useState } from 'react'
import { useResearchStore } from '../../stores/useResearchStore'
import { KanbanBoard } from './KanbanBoard'
import { ResearchItemForm } from './ResearchItemForm'
import { ResearchDetailModal } from './ResearchDetailModal'
import { Modal } from '../shared/Modal'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import type { ResearchCategory, ResearchPriority } from '../../types/research'

export function ResearchQueuePage() {
  const { isFormOpen, isDetailOpen, selectedItemId, openForm, closeForm, openDetail, closeDetail } =
    useResearchStore()

  const [filterPriority, setFilterPriority] = useState<ResearchPriority | ''>('')
  const [filterCategory, setFilterCategory] = useState<ResearchCategory | ''>('')

  const selectedItem = useLiveQuery(
    () => (selectedItemId ? db.researchItems.get(selectedItemId) : undefined),
    [selectedItemId],
  )

  const totalCount = useLiveQuery(() => db.researchItems.count())
  const flaggedCount = useLiveQuery(() =>
    db.researchItems.where('status').equals('Flagged for Doctor').count()
  )

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Research Queue</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Track research questions as you investigate them. Drag cards between columns as you make progress.
            </p>
          </div>
          <button
            type="button"
            onClick={openForm}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Research Item
          </button>
        </div>

        {/* Stats + filters row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>
              <strong className="text-gray-900">{totalCount ?? 0}</strong> total items
            </span>
            {(flaggedCount ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                {flaggedCount} flagged for doctor
              </span>
            )}
          </div>

          {/* Quick filters */}
          <div className="flex items-center gap-2 ml-auto">
            <select
              aria-label="Filter by priority"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as ResearchPriority | '')}
              className="px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              aria-label="Filter by category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as ResearchCategory | '')}
              className="px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All categories</option>
              <option value="Treatment">Treatment</option>
              <option value="Mechanism">Mechanism</option>
              <option value="Supportive Care">Supportive Care</option>
              <option value="Palliative">Palliative</option>
              <option value="Diagnostic">Diagnostic</option>
              <option value="Other">Other</option>
            </select>
            {(filterPriority || filterCategory) && (
              <button
                type="button"
                onClick={() => { setFilterPriority(''); setFilterCategory('') }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tips banner — shown once until user has items */}
      {(totalCount ?? 0) === 0 && (
        <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 shrink-0">
          <strong>How to use the Research Queue:</strong>
          <ol className="mt-2 space-y-1 list-decimal list-inside text-blue-700">
            <li>Click <strong>New Research Item</strong> and write a specific question you want to research.</li>
            <li>Click a card to open it, then use the <strong>Generate AI Prompt</strong> tab to get a ready-to-paste prompt for Claude or another AI tool.</li>
            <li>Paste the AI's response back into the <strong>Research notes</strong> field.</li>
            <li>Drag cards to <strong>Flagged for Doctor</strong> when you find something worth discussing at the next appointment.</li>
          </ol>
        </div>
      )}

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto px-6 pt-4">
        <KanbanBoard
          onOpenItem={openDetail}
          filterPriority={filterPriority}
          filterCategory={filterCategory}
        />
      </div>

      {/* New item modal */}
      <Modal isOpen={isFormOpen} onClose={closeForm} title="New Research Item" size="md">
        <ResearchItemForm onClose={closeForm} />
      </Modal>

      {/* Detail modal */}
      <Modal
        isOpen={isDetailOpen && !!selectedItem}
        onClose={closeDetail}
        title="Research Item"
        size="xl"
      >
        {selectedItem && (
          <ResearchDetailModal item={selectedItem} onClose={closeDetail} />
        )}
      </Modal>
    </div>
  )
}
