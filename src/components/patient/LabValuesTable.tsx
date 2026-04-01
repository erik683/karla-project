import type { LabValue } from '../../types/patient'

interface Props {
  value: LabValue[]
  onChange: (labs: LabValue[]) => void
}

const empty: LabValue = { name: '', value: '', unit: '', date: '', trend: '' }

export function LabValuesTable({ value, onChange }: Props) {
  const add = () => onChange([...value, { ...empty }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, field: keyof LabValue, v: string) =>
    onChange(value.map((l, idx) => (idx === i ? { ...l, [field]: v } : l)))

  const trendIcon = (trend: LabValue['trend']) => {
    if (trend === 'up') return '↑'
    if (trend === 'down') return '↓'
    if (trend === 'stable') return '→'
    return ''
  }

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-sm text-gray-400 italic">No lab values added yet.</p>
      )}
      {value.map((l, i) => (
        <div key={i} className="flex gap-2 items-start border border-gray-200 rounded-md p-2 bg-gray-50">
          <div className="flex-1 grid grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Lab name"
              value={l.name}
              onChange={(e) => update(i, 'name', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Value"
              value={l.value}
              onChange={(e) => update(i, 'value', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Unit (e.g., mg/dL)"
              value={l.unit}
              onChange={(e) => update(i, 'unit', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Date"
              value={l.date}
              onChange={(e) => update(i, 'date', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={l.trend}
            onChange={(e) => update(i, 'trend', e.target.value)}
            className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Trend"
          >
            <option value="">Trend</option>
            <option value="up">↑ Up</option>
            <option value="down">↓ Down</option>
            <option value="stable">→ Stable</option>
          </select>
          {l.trend && (
            <span className="text-lg leading-8 w-6 text-center text-gray-500">
              {trendIcon(l.trend)}
            </span>
          )}
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-red-400 hover:text-red-600 p-1 mt-0.5"
            aria-label="Remove"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
        Add lab value
      </button>
    </div>
  )
}
