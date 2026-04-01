import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import type { PatientProfile } from '../../types/patient'
import { usePatientStore } from '../../stores/usePatientStore'
import { useAppStore } from '../../stores/useAppStore'
import { ProfileForm } from './ProfileForm'
import { ProfileSummaryView } from './ProfileSummaryView'
import { ProfileVersionHistory } from './ProfileVersionHistory'
import { Modal } from '../shared/Modal'

const emptyProfile: PatientProfile = {
  initials: '',
  diagnosis: '',
  secondaryConditions: '',
  stage: '',
  progressionTimeline: '',
  biomarkers: [],
  treatmentsTried: [],
  currentMedications: [],
  allergies: '',
  contraindications: '',
  functionalStatus: '',
  labValues: [],
  preferences: { travelAbility: '', sideEffectTolerance: '', qualityOfLifePriorities: '' },
  careTeam: [],
  additionalNotes: '',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export function PatientProfilePage() {
  const { isVersionHistoryOpen, isSummaryOpen, openVersionHistory, closeVersionHistory, openSummary, closeSummary } =
    usePatientStore()
  const { addToast } = useAppStore()

  const savedProfile = useLiveQuery(() => db.patientProfiles.orderBy('updatedAt').last())

  const [form, setForm] = useState<PatientProfile>(emptyProfile)
  const [isDirty, setIsDirty] = useState(false)

  // Sync form when saved profile loads
  useEffect(() => {
    if (savedProfile) setForm(savedProfile)
  }, [savedProfile])

  const handleChange = (updated: PatientProfile) => {
    setForm(updated)
    setIsDirty(true)
  }

  const handleSave = async () => {
    const now = new Date()
    let profileId: number

    if (savedProfile?.id) {
      await db.patientProfiles.update(savedProfile.id, { ...form, updatedAt: now })
      profileId = savedProfile.id
    } else {
      profileId = (await db.patientProfiles.add({ ...form, createdAt: now, updatedAt: now })) as number
    }

    // Save version snapshot
    await db.patientVersions.add({
      profileId: profileId as number,
      snapshot: { ...form, id: profileId as number, updatedAt: now },
      createdAt: now,
    })

    setIsDirty(false)
    addToast('Patient profile saved')
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Patient Profile</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            This profile is used to generate AI research prompts and check trial eligibility.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openVersionHistory}
            disabled={!savedProfile?.id}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Version History
          </button>
          <button
            type="button"
            onClick={openSummary}
            disabled={!savedProfile}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            View Summary
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDirty && (
              <span className="w-2 h-2 rounded-full bg-yellow-300" title="Unsaved changes" />
            )}
            Save Profile
          </button>
        </div>
      </div>

      {isDirty && (
        <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-800 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          You have unsaved changes. Click "Save Profile" to save them.
        </div>
      )}

      <ProfileForm value={form} onChange={handleChange} />

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty}
          className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Profile
        </button>
      </div>

      {/* Profile Summary Modal */}
      <Modal isOpen={isSummaryOpen} onClose={closeSummary} title="De-identified Profile Summary" size="lg">
        {savedProfile && <ProfileSummaryView profile={savedProfile} onClose={closeSummary} />}
      </Modal>

      {/* Version History Modal */}
      <Modal isOpen={isVersionHistoryOpen} onClose={closeVersionHistory} title="Profile Version History" size="md">
        {savedProfile?.id && (
          <ProfileVersionHistory profileId={savedProfile.id} onClose={closeVersionHistory} />
        )}
      </Modal>
    </div>
  )
}
