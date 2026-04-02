import { CopyButton } from '../shared/CopyButton'

interface Props {
  prompt: string
  onPromptChange: (prompt: string) => void
}

export function AnalysisPromptPreview({ prompt, onPromptChange }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          Assembled prompt
          <span className="ml-1 text-xs text-gray-400 font-normal">(you can edit before running)</span>
        </label>
        <CopyButton text={prompt} />
      </div>
      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        className="w-full px-3 py-2 text-xs text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono leading-relaxed"
        rows={12}
      />
      <p className="text-xs text-gray-400 mt-1">
        This prompt includes the patient profile (de-identified), flagged research items, and saved trials. Edit as needed before running.
      </p>
    </div>
  )
}
