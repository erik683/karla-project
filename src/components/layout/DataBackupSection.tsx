import { useRef, useState } from 'react'
import type { Toast } from '../../stores/useAppStore'
import {
  BACKUP_COLLECTION_KEYS,
  downloadBackup,
  readBackupFile,
  restoreBackupData,
  summarizeBackupData,
  type BackupData,
  type BackupSummary,
} from '../../services/backupRestore'
import { formatDateTime } from '../../utils/formatters'
import { ConfirmDialog } from '../shared/ConfirmDialog'

interface DataBackupSectionProps {
  onToast: (message: string, type?: Toast['type']) => void
}

interface PendingRestore {
  fileName: string
  data: BackupData
  summary: BackupSummary
}

const collectionLabels: Record<(typeof BACKUP_COLLECTION_KEYS)[number], string> = {
  patientProfiles: 'Patient profiles',
  patientVersions: 'Profile history',
  researchItems: 'Research items',
  trials: 'Saved trials',
  savedSearches: 'Saved searches',
  analyses: 'Analyses',
  briefs: 'Briefs',
  briefVersions: 'Brief history',
  settings: 'Settings',
}

export function DataBackupSection({ onToast }: DataBackupSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pendingRestore, setPendingRestore] = useState<PendingRestore | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      const summary = await downloadBackup()
      onToast(`Data backup downloaded (${summary.totalRecords} records)`)
    } catch (error) {
      onToast(
        `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const handleChooseFile = () => {
    inputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    try {
      const data = await readBackupFile(file)
      setPendingRestore({
        fileName: file.name,
        summary: summarizeBackupData(data),
        data,
      })
    } catch (error) {
      onToast(
        `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
      )
    }
  }

  const handleRestore = async () => {
    if (!pendingRestore) return

    setIsRestoring(true)

    try {
      const summary = await restoreBackupData(pendingRestore.data)
      onToast(`Data restored (${summary.totalRecords} records)`)
      setPendingRestore(null)
    } catch (error) {
      onToast(
        `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
      )
    } finally {
      setIsRestoring(false)
    }
  }

  const populatedSections = pendingRestore
    ? BACKUP_COLLECTION_KEYS.filter((key) => pendingRestore.summary.counts[key] > 0)
    : []

  return (
    <>
      <div className="border-t border-gray-200 pt-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Data Backup</h3>
        <p className="text-xs text-gray-500 mb-3">
          Download a full JSON copy of your local workspace, then restore it later on this browser
          or another device.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {isDownloading ? 'Preparing backup…' : 'Download Data'}
          </button>
          <button
            type="button"
            onClick={handleChooseFile}
            disabled={isRestoring}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Restore Data
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Restoring a backup replaces all current local data on this device after you confirm the
          file contents.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <ConfirmDialog
        isOpen={pendingRestore !== null}
        onClose={() => setPendingRestore(null)}
        onConfirm={handleRestore}
        title="Restore this backup?"
        message="Restoring will overwrite the current local workspace data on this browser."
        confirmLabel={isRestoring ? 'Restoring…' : 'Restore Backup'}
        confirmVariant="danger"
      >
        {pendingRestore && (
          <div className="space-y-4">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">{pendingRestore.fileName}</p>
              <p className="text-xs text-amber-800 mt-1">
                Exported {formatDateTime(pendingRestore.summary.exportedAt)}
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Contains {pendingRestore.summary.totalRecords} total records.
              </p>
            </div>

            {populatedSections.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Included data</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  {populatedSections.map((key) => (
                    <li key={key}>
                      {collectionLabels[key]}: {pendingRestore.summary.counts[key]}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </ConfirmDialog>
    </>
  )
}
