import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import type { TrialSearchParams } from '../../types/trials'
import { useAppStore } from '../../stores/useAppStore'
import { formatDate } from '../../utils/formatters'

interface Props {
  onRunSearch: (params: TrialSearchParams) => void
}

export function SavedSearchesList({ onRunSearch }: Props) {
  const { addToast } = useAppStore()
  const searches = useLiveQuery(() => db.savedSearches.orderBy('createdAt').reverse().toArray())

  const handleDelete = async (id: number) => {
    await db.savedSearches.delete(id)
    addToast('Search deleted')
  }

  if (!searches || searches.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic px-1">No saved searches yet. Run a search and click "Save Search" to save it here.</p>
    )
  }

  return (
    <div className="space-y-2">
      {searches.map((s) => (
        <div key={s.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
            <p className="text-xs text-gray-400">
              {s.params.condition}
              {s.params.interventionType ? ` · ${s.params.interventionType}` : ''}
              {' · '}Saved {formatDate(s.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRunSearch(s.params)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
          >
            Re-run
          </button>
          <button
            type="button"
            onClick={() => handleDelete(s.id!)}
            className="text-gray-300 hover:text-red-400 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
