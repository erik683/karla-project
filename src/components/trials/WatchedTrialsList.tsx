import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { getStudy } from '../../services/clinicalTrialsApi'
import { useAppStore } from '../../stores/useAppStore'
import { PhaseStatusBadge } from '../shared/PhaseStatusBadge'
import { formatDate } from '../../utils/formatters'

interface Props {
  onOpenTrial: (nctId: string) => void
}

export function WatchedTrialsList({ onOpenTrial }: Props) {
  const { addToast } = useAppStore()
  const [checking, setChecking] = useState(false)

  const watchedTrials = useLiveQuery(() =>
    db.trials.filter((trial) => trial.watching).toArray()
  )

  const checkForUpdates = async () => {
    if (!watchedTrials || watchedTrials.length === 0) return
    setChecking(true)

    let changesFound = 0
    for (const trial of watchedTrials) {
      try {
        const fresh = await getStudy(trial.nctId)
        if (fresh && fresh.overallStatus !== trial.overallStatus) {
          await db.trials.update(trial.id!, {
            overallStatus: fresh.overallStatus,
            lastChecked: new Date(),
          })
          changesFound++
        } else {
          await db.trials.update(trial.id!, { lastChecked: new Date() })
        }
      } catch {
        // skip on network error
      }
    }

    setChecking(false)
    if (changesFound > 0) {
      addToast(`${changesFound} trial${changesFound > 1 ? 's' : ''} updated with new status`)
    } else {
      addToast('All watched trials checked — no status changes')
    }
  }

  if (!watchedTrials || watchedTrials.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic px-1">
        No trials being watched. Open a saved trial and check "Watch for status changes" to track it here.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={checkForUpdates}
          disabled={checking}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          <svg className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {checking ? 'Checking…' : 'Check for updates'}
        </button>
      </div>

      {watchedTrials.map((trial) => (
        <div
          key={trial.id}
          className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow"
          onClick={() => onOpenTrial(trial.nctId)}
        >
          <p className="text-sm font-medium text-gray-800 leading-snug mb-1.5">{trial.title}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={`https://clinicaltrials.gov/study/${trial.nctId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-600 hover:underline font-mono"
            >
              {trial.nctId}
            </a>
            <PhaseStatusBadge phase={trial.phase} overallStatus={trial.overallStatus} />
          </div>
          {trial.lastChecked && (
            <p className="text-xs text-gray-400 mt-1.5">Last checked: {formatDate(trial.lastChecked)}</p>
          )}
        </div>
      ))}
    </div>
  )
}
