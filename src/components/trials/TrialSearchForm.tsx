import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import type { TrialSearchParams } from '../../types/trials'
import { useTrialsStore } from '../../stores/useTrialsStore'

const PHASES = ['EARLY_PHASE1', 'PHASE1', 'PHASE2', 'PHASE3', 'PHASE4']
const PHASE_LABELS: Record<string, string> = {
  EARLY_PHASE1: 'Early Phase 1',
  PHASE1: 'Phase 1',
  PHASE2: 'Phase 2',
  PHASE3: 'Phase 3',
  PHASE4: 'Phase 4',
}
const STATUSES = [
  { value: 'RECRUITING', label: 'Recruiting' },
  { value: 'NOT_YET_RECRUITING', label: 'Not Yet Recruiting' },
  { value: 'ACTIVE_NOT_RECRUITING', label: 'Active, Not Recruiting' },
  { value: 'COMPLETED', label: 'Completed' },
]

interface Props {
  onSearch: (params: TrialSearchParams) => void
  isSearching: boolean
}

export function TrialSearchForm({ onSearch, isSearching }: Props) {
  const { currentParams, setParams } = useTrialsStore()
  const [form, setForm] = useState<TrialSearchParams>(currentParams)
  const [showFilters, setShowFilters] = useState(false)

  const profile = useLiveQuery(() => db.patientProfiles.toCollection().first())

  // Pre-fill condition from patient profile if form is empty
  useEffect(() => {
    if (profile?.diagnosis && !form.condition) {
      setForm((f) => ({ ...f, condition: profile.diagnosis }))
    }
  }, [profile])

  const update = <K extends keyof TrialSearchParams>(key: K, val: TrialSearchParams[K]) => {
    setForm((f) => ({ ...f, [key]: val }))
  }

  const toggleMulti = (key: 'phases' | 'statuses', value: string) => {
    setForm((f) => {
      const arr = f[key]
      return { ...f, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setParams(form)
    onSearch(form)
  }

  const fieldClass = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Main search row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Condition / Disease</label>
          <input
            type="text"
            placeholder="e.g., anaplastic thyroid cancer"
            value={form.condition}
            onChange={(e) => update('condition', e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="w-52">
          <label className="block text-xs font-medium text-gray-600 mb-1">Intervention / Drug</label>
          <input
            type="text"
            placeholder="e.g., pembrolizumab"
            value={form.interventionType}
            onChange={(e) => update('interventionType', e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={!form.condition.trim() || isSearching}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
          >
            {isSearching ? 'Searching…' : 'Search'}
          </button>
        </div>
      </div>

      {/* Filters toggle */}
      <button
        type="button"
        onClick={() => setShowFilters((v) => !v)}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
      >
        <svg className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {showFilters ? 'Hide filters' : 'Show filters'}
      </button>

      {showFilters && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
          {/* Phase multi-select */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Trial Phase</p>
            <div className="flex flex-wrap gap-2">
              {PHASES.map((p) => (
                <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.phases.includes(p)}
                    onChange={() => toggleMulti('phases', p)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700">{PHASE_LABELS[p]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status multi-select */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Recruitment Status</p>
            <div className="flex flex-wrap gap-3">
              {STATUSES.map((s) => (
                <label key={s.value} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.statuses.includes(s.value)}
                    onChange={() => toggleMulti('statuses', s.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location + Age + Sex */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location (city, state, or country)</label>
              <input
                type="text"
                placeholder="e.g., Boston, MA"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Age category</label>
              <select value={form.age} onChange={(e) => update('age', e.target.value)} className={fieldClass}>
                <option value="">Any age</option>
                <option value="CHILD">Child (birth–17)</option>
                <option value="ADULT">Adult (18–64)</option>
                <option value="OLDER_ADULT">Older Adult (65+)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sex</label>
              <select value={form.sex} onChange={(e) => update('sex', e.target.value)} className={fieldClass}>
                <option value="">Any</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
