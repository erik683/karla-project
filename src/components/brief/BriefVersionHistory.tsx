import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '../../db/database'
import type { Brief } from '../../types/brief'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { formatDateTime } from '../../utils/formatters'
import { useAppStore } from '../../stores/useAppStore'

interface Props {
  briefId: number
  onRestore: (snapshot: Brief) => void
}

export function BriefVersionHistory({ briefId, onRestore }: Props) {
  const { addToast } = useAppStore()
  const [confirmVersion, setConfirmVersion] = useState<number | null>(null)
  const [selectedSnapshot, setSelectedSnapshot] = useState<Brief | null>(null)

  const versions = useLiveQuery(() =>
    db.briefVersions
      .where('briefId')
      .equals(briefId)
      .reverse()
      .toArray()
  , [briefId])

  const handleRestoreClick = (snapshot: Brief, versionId: number) => {
    setSelectedSnapshot(snapshot)
    setConfirmVersion(versionId)
  }

  const handleConfirmRestore = () => {
    if (selectedSnapshot) {
      onRestore(selectedSnapshot)
      addToast('Version restored')
    }
    setConfirmVersion(null)
    setSelectedSnapshot(null)
  }

  if (!versions || versions.length === 0) {
    return <p className="text-sm text-gray-400 italic">No saved versions yet. Versions are created each time you save the brief.</p>
  }

  return (
    <>
      <div className="space-y-2">
        {versions.map((v) => (
          <div key={v.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Version {v.versionNumber}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(v.createdAt)}</p>
            </div>
            <button
              type="button"
              onClick={() => handleRestoreClick(v.snapshot, v.id!)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Restore
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={confirmVersion !== null}
        onClose={() => { setConfirmVersion(null); setSelectedSnapshot(null) }}
        onConfirm={handleConfirmRestore}
        title="Restore this version?"
        message="This will replace your current brief content with this saved version. Your current content will still be accessible as the most recent version in history."
        confirmLabel="Restore"
        confirmVariant="primary"
      />
    </>
  )
}
