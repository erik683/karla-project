import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import type { ClinicalTrialSearchResult } from '../../types/trials'
import type { LocalTrialStatus } from '../../types/trials'
import { PhaseStatusBadge } from '../shared/PhaseStatusBadge'
import { EligibilityFlags } from './EligibilityFlags'
import { matchEligibility } from '../../utils/eligibilityMatcher'

interface Props {
  trial: ClinicalTrialSearchResult
  onOpen: (nctId: string) => void
  profileDiagnosis?: string
}

const LOCAL_STATUSES: LocalTrialStatus[] = ['New', 'Reviewing', 'Eligible?', 'Ineligible', 'Discuss with Doctor', 'Contacted']

export function TrialCard({ trial, onOpen }: Props) {
  const profile = useLiveQuery(() => db.patientProfiles.toCollection().first())
  const savedTrial = useLiveQuery(
    () => db.trials.where('nctId').equals(trial.nctId).first(),
    [trial.nctId]
  )

  const eligibilityFlags = profile ? matchEligibility(trial.eligibilityCriteria, profile) : []

  const updateLocalStatus = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation()
    if (!savedTrial?.id) return
    await db.trials.update(savedTrial.id, { localStatus: e.target.value as LocalTrialStatus })
  }

  const nearestLocation = trial.locations[0]

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onOpen(trial.nctId)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 leading-snug mb-1">{trial.title}</p>
          <div className="flex items-center gap-2 flex-wrap">
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
        </div>
        {savedTrial && (
          <span className="shrink-0 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-medium">
            Saved
          </span>
        )}
      </div>

      {/* Intervention */}
      {trial.interventionSummary && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
          <span className="font-medium text-gray-600">Interventions: </span>
          {trial.interventionSummary}
        </p>
      )}

      {/* Location */}
      {nearestLocation && (
        <p className="text-xs text-gray-400 mb-2">
          📍 {[nearestLocation.facility, nearestLocation.city, nearestLocation.state, nearestLocation.country].filter(Boolean).join(', ')}
          {trial.locations.length > 1 && ` + ${trial.locations.length - 1} more`}
        </p>
      )}

      {/* Eligibility flags */}
      {eligibilityFlags.length > 0 && (
        <div className="mb-2" onClick={(e) => e.stopPropagation()}>
          <EligibilityFlags flags={eligibilityFlags.slice(0, 2)} />
          {eligibilityFlags.length > 2 && (
            <p className="text-xs text-gray-400 mt-1">+{eligibilityFlags.length - 2} more flags — click to view all</p>
          )}
        </div>
      )}

      {/* Footer: local status if saved */}
      {savedTrial && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <span className="text-xs text-gray-500">Your status:</span>
          <select
            value={savedTrial.localStatus}
            onChange={updateLocalStatus}
            className="text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {LOCAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}
