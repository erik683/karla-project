import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { useAnalysisStore } from '../../stores/useAnalysisStore'
import { useAppStore } from '../../stores/useAppStore'
import type { AnalysisEntry } from '../../types/analysis'
import { formatDateTime } from '../../utils/formatters'

interface Props {
  onSelectEntry: (entry: AnalysisEntry) => void
  disabled?: boolean
}

export function AnalysisHistoryList({ onSelectEntry, disabled = false }: Props) {
  const { addToast } = useAppStore()
  const { selectedHistoryId, selectHistory } = useAnalysisStore()

  const entries = useLiveQuery(() =>
    db.analyses.orderBy('createdAt').reverse().toArray()
  )

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    await db.analyses.delete(id)
    if (selectedHistoryId === id) selectHistory(null)
    addToast('Analysis deleted')
  }

  if (!entries || entries.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic">No analyses run yet. Run your first analysis above.</p>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          onClick={() => {
            if (disabled) return
            onSelectEntry(entry)
          }}
          className={`rounded-lg border p-3 transition-all ${
            selectedHistoryId === entry.id
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-200 bg-white'
          } ${
            disabled
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer hover:shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-700">{entry.type}</p>
              {entry.customQuery && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{entry.customQuery}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{formatDateTime(entry.createdAt)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => handleDelete(e, entry.id!)}
              disabled={disabled}
              className="text-gray-300 hover:text-red-400 shrink-0 p-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
