import { useMemo } from 'react'
import type { PatientProfile } from '../../types/patient'
import { generateProfileSummary } from '../../utils/deidentify'
import { CopyButton } from '../shared/CopyButton'

interface Props {
  profile: PatientProfile
  onClose: () => void
}

export function ProfileSummaryView({ profile, onClose }: Props) {
  const summary = useMemo(() => generateProfileSummary(profile), [profile])

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-800">
        <strong>Privacy note:</strong> This summary uses initials only and excludes care team names.
        It is designed to be pasted into AI prompts. Review before sharing anywhere else.
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Copy this text and paste it into your AI tool of choice when doing research.
        </p>
        <CopyButton text={summary} label="Copy Summary" />
      </div>
      <pre className="bg-gray-50 border border-gray-200 rounded-md p-4 text-xs text-gray-700 whitespace-pre-wrap font-mono overflow-y-auto max-h-96">
        {summary}
      </pre>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  )
}
