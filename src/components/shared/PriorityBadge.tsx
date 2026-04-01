import type { ResearchPriority } from '../../types/research'

const priorityStyles: Record<ResearchPriority, string> = {
  'High': 'bg-red-100 text-red-700',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'Low': 'bg-gray-100 text-gray-600',
}

interface PriorityBadgeProps {
  priority: ResearchPriority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityStyles[priority]}`}>
      {priority}
    </span>
  )
}
