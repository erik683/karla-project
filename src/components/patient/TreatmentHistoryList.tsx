import type { Treatment } from '../../types/patient'

interface Props {
  value: Treatment[]
  onChange: (treatments: Treatment[]) => void
}

const empty: Treatment = { name: '', startDate: '', endDate: '', outcome: '', reasonStopped: '' }

export function TreatmentHistoryList({ value, onChange }: Props) {
  const add = () => onChange([...value, { ...empty }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, field: keyof Treatment, v: string) =>
    onChange(value.map((t, idx) => (idx === i ? { ...t, [field]: v } : t)))

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-gray-400 italic">No treatments added yet.</p>
      )}
      {value.map((t, i) => (
        <div key={i} className="border border-gray-200 rounded-md p-3 bg-gray-50 space-y-2">
          <div className="flex justify-between items-start gap-2">
            <input
              type="text"
              placeholder="Treatment name (e.g., Pembrolizumab)"
              value={t.name}
              onChange={(e) => update(i, 'name', e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-red-400 hover:text-red-600 p-1"
              aria-label="Remove treatment"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Start date</label>
              <input
                type="text"
                placeholder="e.g., Jan 2023"
                value={t.startDate}
                onChange={(e) => update(i, 'startDate', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">End date</label>
              <input
                type="text"
                placeholder="e.g., Mar 2023 or ongoing"
                value={t.endDate}
                onChange={(e) => update(i, 'endDate', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Outcome (e.g., partial response, stable disease)"
            value={t.outcome}
            onChange={(e) => update(i, 'outcome', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Reason stopped (e.g., progression, toxicity, completed)"
            value={t.reasonStopped}
            onChange={(e) => update(i, 'reasonStopped', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add treatment
      </button>
    </div>
  )
}
