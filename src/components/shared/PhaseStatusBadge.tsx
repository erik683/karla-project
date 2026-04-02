interface Props {
  phase: string
  overallStatus: string
}

const statusColors: Record<string, string> = {
  RECRUITING: 'bg-green-100 text-green-700',
  ACTIVE_NOT_RECRUITING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  TERMINATED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-red-100 text-red-600',
  SUSPENDED: 'bg-yellow-100 text-yellow-700',
  NOT_YET_RECRUITING: 'bg-amber-100 text-amber-700',
  ENROLLING_BY_INVITATION: 'bg-purple-100 text-purple-700',
}

const statusLabels: Record<string, string> = {
  RECRUITING: 'Recruiting',
  ACTIVE_NOT_RECRUITING: 'Active, Not Recruiting',
  COMPLETED: 'Completed',
  TERMINATED: 'Terminated',
  WITHDRAWN: 'Withdrawn',
  SUSPENDED: 'Suspended',
  NOT_YET_RECRUITING: 'Not Yet Recruiting',
  ENROLLING_BY_INVITATION: 'By Invitation',
}

export function PhaseStatusBadge({ phase, overallStatus }: Props) {
  const statusClass = statusColors[overallStatus] ?? 'bg-gray-100 text-gray-500'
  const statusLabel = statusLabels[overallStatus] ?? overallStatus.replace(/_/g, ' ')

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {phase && phase !== 'N/A' && (
        <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
          {phase}
        </span>
      )}
      <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusClass}`}>
        {statusLabel}
      </span>
    </div>
  )
}
