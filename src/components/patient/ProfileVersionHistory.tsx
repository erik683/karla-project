import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '../../db/database'
import { formatDateTime } from '../../utils/formatters'
import type { PatientVersion } from '../../types/patient'
import { generateProfileSummary } from '../../utils/deidentify'
import { CopyButton } from '../shared/CopyButton'

interface Props {
  profileId: number
  onClose: () => void
}

export function ProfileVersionHistory({ profileId, onClose }: Props) {
  const [selectedVersion, setSelectedVersion] = useState<PatientVersion | null>(null)

  const versions = useLiveQuery(
    () =>
      db.patientVersions
        .where('profileId')
        .equals(profileId)
        .reverse()
        .sortBy('createdAt'),
    [profileId],
  )

  if (selectedVersion) {
    const summary = generateProfileSummary(selectedVersion.snapshot)
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedVersion(null)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to history
        </button>
        <p className="text-sm text-gray-500">
          Saved {formatDateTime(selectedVersion.createdAt)} — read only
        </p>
        <pre className="bg-gray-50 border border-gray-200 rounded-md p-4 text-xs text-gray-700 whitespace-pre-wrap font-mono overflow-y-auto max-h-80">
          {summary}
        </pre>
        <div className="flex justify-between">
          <CopyButton text={summary} label="Copy this version" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        A snapshot is saved each time you save the patient profile. Click any version to view it.
      </p>
      {!versions || versions.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No versions saved yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {versions.map((v) => (
            <li key={v.id}>
              <button
                onClick={() => setSelectedVersion(v)}
                className="w-full text-left py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDateTime(v.createdAt)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {v.snapshot.initials} · {v.snapshot.diagnosis || 'No diagnosis entered'}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex justify-end pt-2">
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
