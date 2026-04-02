import { CopyButton } from '../shared/CopyButton'

interface Props {
  result: string
  isStreaming: boolean
}

export function AnalysisResultView({ result, isStreaming }: Props) {
  if (!result && !isStreaming) return null

  // Very simple markdown-ish rendering: bold **text**, headings ## text, bullet •/-
  const renderLine = (line: string, i: number) => {
    if (line.startsWith('## ') || line.startsWith('### ')) {
      const text = line.replace(/^#{2,3}\s/, '')
      return <p key={i} className="text-sm font-bold text-gray-900 mt-4 mb-1">{text}</p>
    }
    if (line.startsWith('# ')) {
      const text = line.replace(/^#\s/, '')
      return <p key={i} className="text-base font-bold text-gray-900 mt-4 mb-2">{text}</p>
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const text = line.replace(/^[-•]\s/, '')
      return (
        <div key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
          <span>{renderInline(text)}</span>
        </div>
      )
    }
    if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)/)
      if (match) {
        return (
          <div key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-gray-400 font-medium shrink-0 w-5 text-right">{match[1]}.</span>
            <span>{renderInline(match[2])}</span>
          </div>
        )
      }
    }
    if (line.trim() === '') return <div key={i} className="h-2" />
    return <p key={i} className="text-sm text-gray-700 leading-relaxed">{renderInline(line)}</p>
  }

  const renderInline = (text: string) => {
    // Bold: **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Analysis Result</span>
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-blue-600">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Generating…
            </span>
          )}
        </div>
        {result && !isStreaming && <CopyButton text={result} />}
      </div>
      <div className="px-4 py-4 space-y-0.5 max-h-[60vh] overflow-y-auto">
        {result.split('\n').map((line, i) => renderLine(line, i))}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-0.5 rounded-sm" />
        )}
      </div>
    </div>
  )
}
