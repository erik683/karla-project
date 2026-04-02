import type { AnalysisType } from '../../types/analysis'

const ANALYSIS_TYPES: { type: AnalysisType; label: string; description: string; icon: string }[] = [
  {
    type: 'Treatment Gap',
    label: 'Treatment Gap',
    description: "What has been tried, what hasn't, and what might be worth exploring next.",
    icon: '🔍',
  },
  {
    type: 'Mechanism Mapping',
    label: 'Mechanism Mapping',
    description: 'Map molecular pathways and identify which treatments target which pathways.',
    icon: '🧬',
  },
  {
    type: 'Similar Case Pattern',
    label: 'Similar Case Pattern',
    description: 'What does research show about outcomes for patients with similar profiles?',
    icon: '📊',
  },
  {
    type: 'Combination Hypothesis',
    label: 'Combination Hypothesis',
    description: 'Generate hypotheses about potentially synergistic treatment combinations.',
    icon: '⚗️',
  },
  {
    type: 'Palliative Optimization',
    label: 'Palliative Optimization',
    description: 'Quality of life, symptom management, and supportive care options.',
    icon: '🌿',
  },
  {
    type: 'Custom Query',
    label: 'Custom Query',
    description: 'Ask anything about the gathered research in your own words.',
    icon: '✏️',
  },
]

interface Props {
  selected: AnalysisType
  onSelect: (type: AnalysisType) => void
}

export function AnalysisTypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ANALYSIS_TYPES.map(({ type, label, description, icon }) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          className={`text-left p-3 rounded-lg border-2 transition-all ${
            selected === type
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base">{icon}</span>
            <span className={`text-sm font-semibold ${selected === type ? 'text-blue-700' : 'text-gray-800'}`}>
              {label}
            </span>
          </div>
          <p className={`text-xs leading-snug ${selected === type ? 'text-blue-600' : 'text-gray-500'}`}>
            {description}
          </p>
        </button>
      ))}
    </div>
  )
}
