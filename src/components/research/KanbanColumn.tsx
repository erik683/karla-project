import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ResearchItem, ResearchStatus } from '../../types/research'
import { ResearchCard } from './ResearchCard'

interface Props {
  status: ResearchStatus
  items: ResearchItem[]
  onOpenItem: (id: number) => void
}

const columnColors: Record<ResearchStatus, string> = {
  'Queued': 'bg-gray-100 border-gray-200',
  'In Progress': 'bg-blue-50 border-blue-200',
  'Reviewed': 'bg-green-50 border-green-200',
  'Dismissed': 'bg-gray-50 border-gray-200',
  'Flagged for Doctor': 'bg-amber-50 border-amber-200',
}

const headerColors: Record<ResearchStatus, string> = {
  'Queued': 'text-gray-600',
  'In Progress': 'text-blue-700',
  'Reviewed': 'text-green-700',
  'Dismissed': 'text-gray-400',
  'Flagged for Doctor': 'text-amber-700',
}

export function KanbanColumn({ status, items, onOpenItem }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      className={`flex flex-col rounded-lg border ${columnColors[status]} min-w-[220px] w-[220px] shrink-0`}
    >
      {/* Column header */}
      <div className="px-3 py-2.5 border-b border-inherit">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-semibold uppercase tracking-wider ${headerColors[status]}`}>
            {status}
          </h3>
          <span className="text-xs font-medium text-gray-400 bg-white/60 px-1.5 py-0.5 rounded">
            {items.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 space-y-2 min-h-[120px] transition-colors rounded-b-lg ${
          isOver ? 'bg-blue-100/50' : ''
        }`}
      >
        <SortableContext
          items={items.map((i) => i.id!)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <ResearchCard key={item.id} item={item} onOpen={onOpenItem} />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className={`flex items-center justify-center h-20 rounded border-2 border-dashed transition-colors ${
            isOver ? 'border-blue-300' : 'border-gray-200'
          }`}>
            <p className="text-xs text-gray-300">Drop here</p>
          </div>
        )}
      </div>
    </div>
  )
}
