import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import type { ClinicalTrialSearchResult, LocalTrialStatus, SavedTrial } from '../../types/trials'
import { PhaseStatusBadge } from '../shared/PhaseStatusBadge'
import { EligibilityFlags } from './EligibilityFlags'
import { matchEligibility } from '../../utils/eligibilityMatcher'
import { useAppStore } from '../../stores/useAppStore'
import { formatDate } from '../../utils/formatters'

const LOCAL_STATUSES: LocalTrialStatus[] = ['New', 'Reviewing', 'Eligible?', 'Ineligible', 'Discuss with Doctor', 'Contacted']

interface Props {
  trial: ClinicalTrialSearchResult
  onClose: () => void
}

export function TrialDetailModal({ trial, onClose }: Props) {
  const { addToast } = useAppStore()
  const [advocateNotes, setAdvocateNotes] = useState('')
  const [localStatus, setLocalStatus] = useState<LocalTrialStatus>('New')
  const [watching, setWatching] = useState(false)
  const [showFullEligibility, setShowFullEligibility] = useState(false)

  const profile = useLiveQuery(() => db.patientProfiles.toCollection().first())
  const savedTrial = useLiveQuery(
    () => db.trials.where('nctId').equals(trial.nctId).first(),
    [trial.nctId]
  )

  useEffect(() => {
    if (savedTrial) {
      setAdvocateNotes(savedTrial.advocateNotes)
      setLocalStatus(savedTrial.localStatus)
      setWatching(savedTrial.watching)
    } else {
      setAdvocateNotes('')
      setLocalStatus('New')
      setWatching(false)
    }
  }, [savedTrial, trial.nctId])

  const eligibilityFlags = profile ? matchEligibility(trial.eligibilityCriteria, profile) : []

  const handleSave = async () => {
    if (savedTrial?.id) {
      await db.trials.update(savedTrial.id, {
        advocateNotes,
        localStatus,
        watching,
        lastChecked: new Date(),
      })
      addToast('Trial updated')
    } else {
      const newTrial: SavedTrial = {
        nctId: trial.nctId,
        title: trial.title,
        phase: trial.phase,
        overallStatus: trial.overallStatus,
        conditions: trial.conditions,
        interventionSummary: trial.interventionSummary,
        eligibilityCriteria: trial.eligibilityCriteria,
        eligibilityFlags,
        locations: trial.locations,
        contacts: trial.contacts,
        advocateNotes,
        localStatus,
        watching,
        lastChecked: new Date(),
        savedAt: new Date(),
      }
      await db.trials.add(newTrial)
      addToast('Trial saved')
    }
  }

  const handleDelete = async () => {
    if (!savedTrial?.id) return
    await db.trials.delete(savedTrial.id)
    addToast('Trial removed from saved list')
    onClose()
  }

  const fieldClass = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-200">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 leading-snug mb-2">{trial.title}</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={`https://clinicaltrials.gov/study/${trial.nctId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline font-mono"
              >
                {trial.nctId} ↗
              </a>
              <PhaseStatusBadge phase={trial.phase} overallStatus={trial.overallStatus} />
              {savedTrial && (
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-medium">
                  Saved {formatDate(savedTrial.savedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {/* Conditions */}
        {trial.conditions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Conditions</p>
            <p className="text-sm text-gray-700">{trial.conditions.join(', ')}</p>
          </div>
        )}

        {/* Interventions */}
        {trial.interventionSummary && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Interventions</p>
            <p className="text-sm text-gray-700">{trial.interventionSummary}</p>
          </div>
        )}

        {/* Eligibility */}
        {trial.eligibilityCriteria && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Eligibility Criteria</p>
            {eligibilityFlags.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1.5">
                  Automatic flags based on patient profile — always verify manually:
                </p>
                <EligibilityFlags flags={eligibilityFlags} />
              </div>
            )}
            <div className={`text-xs text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded p-3 border border-gray-200 ${!showFullEligibility ? 'max-h-40 overflow-hidden' : ''}`}>
              {trial.eligibilityCriteria}
            </div>
            <button
              type="button"
              onClick={() => setShowFullEligibility((v) => !v)}
              className="mt-1.5 text-xs text-blue-600 hover:text-blue-800"
            >
              {showFullEligibility ? 'Show less' : 'Show full eligibility criteria'}
            </button>
          </div>
        )}

        {/* Locations */}
        {trial.locations.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Locations ({trial.locations.length})
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {trial.locations.map((loc, i) => (
                <div key={i} className="text-xs text-gray-600">
                  📍 {[loc.facility, loc.city, loc.state, loc.country].filter(Boolean).join(', ')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts */}
        {trial.contacts.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Study Contacts</p>
            <div className="space-y-2">
              {trial.contacts.map((c, i) => (
                <div key={i} className="text-xs text-gray-600 space-y-0.5">
                  {c.name && <p className="font-medium text-gray-800">{c.name}</p>}
                  {c.phone && <p>📞 {c.phone}</p>}
                  {c.email && (
                    <p>
                      ✉️{' '}
                      <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline">
                        {c.email}
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Tracking</p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Your status for this trial</label>
              <select
                value={localStatus}
                onChange={(e) => setLocalStatus(e.target.value as LocalTrialStatus)}
                className={fieldClass}
              >
                {LOCAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={watching}
                  onChange={(e) => setWatching(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">Watch for status changes</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Your notes</label>
            <textarea
              value={advocateNotes}
              onChange={(e) => setAdvocateNotes(e.target.value)}
              placeholder="Eligibility notes, questions for the doctor, contact attempts…"
              className={`${fieldClass} resize-y min-h-[80px]`}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
        <div>
          {savedTrial ? (
            <button type="button" onClick={handleDelete} className="text-sm text-red-500 hover:text-red-700">
              Remove from saved
            </button>
          ) : (
            <span className="text-xs text-gray-400">Not yet saved to your list</span>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            {savedTrial ? 'Save Changes' : 'Save Trial'}
          </button>
        </div>
      </div>
    </div>
  )
}
