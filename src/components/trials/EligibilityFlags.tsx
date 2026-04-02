import type { EligibilityFlag } from '../../types/trials'

interface Props {
  flags: EligibilityFlag[]
}

const flagStyles = {
  match: { dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
  conflict: { dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
  unknown: { dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50' },
}

export function EligibilityFlags({ flags }: Props) {
  if (flags.length === 0) return null

  return (
    <div className="space-y-1">
      {flags.map((flag, i) => {
        const style = flagStyles[flag.status]
        return (
          <div key={i} className={`flex items-start gap-2 rounded px-2 py-1 ${style.bg}`}>
            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
            <div>
              <span className={`text-xs font-semibold ${style.text}`}>{flag.field}: </span>
              <span className={`text-xs ${style.text}`}>{flag.detail}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
