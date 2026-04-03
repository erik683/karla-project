import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DataBackupSection } from './DataBackupSection'
import {
  downloadBackup,
  readBackupFile,
  restoreBackupData,
  type BackupData,
  type BackupSummary,
} from '../../services/backupRestore'

vi.mock('../../services/backupRestore', async () => {
  const actual = await vi.importActual<typeof import('../../services/backupRestore')>(
    '../../services/backupRestore',
  )

  return {
    ...actual,
    downloadBackup: vi.fn(),
    readBackupFile: vi.fn(),
    restoreBackupData: vi.fn(),
  }
})

const backupSummary: BackupSummary = {
  exportedAt: new Date('2026-04-03T12:00:00.000Z'),
  counts: {
    patientProfiles: 1,
    patientVersions: 0,
    researchItems: 1,
    trials: 1,
    savedSearches: 0,
    analyses: 0,
    briefs: 0,
    briefVersions: 0,
    settings: 1,
  },
  totalRecords: 4,
}

const backupData: BackupData = {
  version: 1,
  exportedAt: '2026-04-03T12:00:00.000Z',
  patientProfiles: [
    {
      initials: 'KP',
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
      preferences: {
        travelAbility: '',
        sideEffectTolerance: '',
        qualityOfLifePriorities: '',
      },
      careTeam: [],
      additionalNotes: '',
      createdAt: new Date('2026-04-01T10:00:00.000Z'),
      updatedAt: new Date('2026-04-02T11:00:00.000Z'),
    },
  ],
  patientVersions: [],
  researchItems: [
    {
      question: 'Question',
      category: 'Treatment',
      priority: 'High',
      status: 'Queued',
      agentNotes: '',
      sources: [],
      advocateNotes: '',
      linkedTrialIds: [],
      linkedAnalysisIds: [],
      sortOrder: 0,
      createdAt: new Date('2026-04-02T11:10:00.000Z'),
      updatedAt: new Date('2026-04-02T11:11:00.000Z'),
    },
  ],
  trials: [
    {
      nctId: 'NCT00000001',
      title: 'Example Trial',
      phase: 'Phase 2',
      overallStatus: 'RECRUITING',
      conditions: ['Example'],
      interventionSummary: 'Drug: Example',
      eligibilityCriteria: '',
      eligibilityFlags: [],
      locations: [],
      contacts: [],
      advocateNotes: '',
      localStatus: 'New',
      watching: false,
      lastChecked: new Date('2026-04-02T11:12:00.000Z'),
      savedAt: new Date('2026-04-02T11:13:00.000Z'),
    },
  ],
  savedSearches: [],
  analyses: [],
  briefs: [],
  briefVersions: [],
  settings: [{ key: 'claudeApiKey', value: 'secret' }],
}

describe('DataBackupSection', () => {
  beforeEach(() => {
    vi.mocked(downloadBackup).mockReset()
    vi.mocked(readBackupFile).mockReset()
    vi.mocked(restoreBackupData).mockReset()
  })

  it('downloads data and reports success', async () => {
    vi.mocked(downloadBackup).mockResolvedValue(backupSummary)
    const onToast = vi.fn()
    const user = userEvent.setup()

    render(<DataBackupSection onToast={onToast} />)

    await user.click(screen.getByRole('button', { name: 'Download Data' }))

    await waitFor(() =>
      expect(onToast).toHaveBeenCalledWith('Data backup downloaded (4 records)'),
    )
  })

  it('shows a restore preview before replacing local data', async () => {
    vi.mocked(readBackupFile).mockResolvedValue(backupData)
    vi.mocked(restoreBackupData).mockResolvedValue(backupSummary)
    const onToast = vi.fn()
    const user = userEvent.setup()

    const { container } = render(<DataBackupSection onToast={onToast} />)

    const fileInput = container.querySelector('input[type="file"]')
    if (!(fileInput instanceof HTMLInputElement)) {
      throw new Error('Expected backup file input to exist')
    }

    const file = new File(['{}'], 'workspace-backup.json', { type: 'application/json' })
    await user.upload(fileInput, file)

    expect(await screen.findByText('Restore this backup?')).toBeInTheDocument()
    expect(screen.getByText('workspace-backup.json')).toBeInTheDocument()
    expect(screen.getByText('Contains 4 total records.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Restore Backup' }))

    await waitFor(() => expect(restoreBackupData).toHaveBeenCalledWith(backupData))
    await waitFor(() => expect(onToast).toHaveBeenCalledWith('Data restored (4 records)'))
  })
})
