import type { ResearchStatus } from '../../types/research'

const statusStyles: Record<ResearchStatus, string> = {
  'Queued': 'bg-gray-100 text-gray-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Reviewed': 'bg-green-100 text-green-700',
  'Dismissed': 'bg-gray-100 text-gray-400 line-through',
  'Flagged for Doctor': 'bg-amber-100 text-amber-800',
}

interface StatusBadgeProps {
  status: ResearchStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  )
}
