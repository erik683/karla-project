import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import type { ResearchItem } from '../../types/research'
import { buildResearchPrompt } from '../../services/promptBuilder'
import { CopyButton } from '../shared/CopyButton'

interface Props {
  item: ResearchItem
}

export function PromptGeneratorPanel({ item }: Props) {
  const profile = useLiveQuery(() => db.patientProfiles.orderBy('updatedAt').last())

  const prompt = useMemo(() => {
    if (!profile) return null
    return buildResearchPrompt(profile, item.question)
  }, [profile, item.question])

  if (!profile) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
        <p className="text-sm text-amber-800">
          <strong>No patient profile found.</strong> Go to Patient Profile and save a profile first — the prompt generator uses it to provide context for AI research.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Generated AI Prompt</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Copy this and paste it into Claude, ChatGPT, or another AI tool to research this question.
          </p>
        </div>
        {prompt && <CopyButton text={prompt} label="Copy Prompt" />}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 max-h-72 overflow-y-auto">
        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
          {prompt}
        </pre>
      </div>

      <p className="text-xs text-gray-400">
        The prompt includes the de-identified patient profile (initials only, no care team names) and your research question, formatted to guide the AI to give thorough, appropriately caveated responses.
      </p>
    </div>
  )
}
