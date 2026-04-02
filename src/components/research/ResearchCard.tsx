import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ResearchItem } from '../../types/research'
import { PriorityBadge } from '../shared/PriorityBadge'
import { truncate } from '../../utils/formatters'

interface Props {
  item: ResearchItem
  onOpen: (id: number) => void
}

export function ResearchCard({ item, onOpen }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id!,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style} /* dnd-kit requires inline style for live CSS transform/transition — cannot use class */
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onOpen(item.id!)}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <PriorityBadge priority={item.priority} />
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">
            {item.category}
          </span>
        </div>
        <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>

      {/* Question */}
      <p className="text-sm text-gray-800 font-medium leading-snug mb-2">
        {truncate(item.question, 120)}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          {item.agentNotes && (
            <span className="text-xs text-gray-400 flex items-center gap-0.5" title="Has research notes">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Notes
            </span>
          )}
          {item.sources.length > 0 && (
            <span className="text-xs text-gray-400" title="Has sources">
              {item.sources.length} source{item.sources.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}
