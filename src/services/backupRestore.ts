import { db, type AppSettings } from '../db/database'
import type { AnalysisEntry } from '../types/analysis'
import type { Brief, BriefVersion } from '../types/brief'
import type { PatientProfile, PatientVersion } from '../types/patient'
import type { ResearchItem } from '../types/research'
import type { SavedSearch, SavedTrial } from '../types/trials'

export const BACKUP_VERSION = 1

export const BACKUP_COLLECTION_KEYS = [
  'patientProfiles',
  'patientVersions',
  'researchItems',
  'trials',
  'savedSearches',
  'analyses',
  'briefs',
  'briefVersions',
  'settings',
] as const

export type BackupCollectionKey = (typeof BACKUP_COLLECTION_KEYS)[number]

export type BackupRecordCounts = Record<BackupCollectionKey, number>

export interface BackupData {
  version: number
  exportedAt: string
  patientProfiles: PatientProfile[]
  patientVersions: PatientVersion[]
  researchItems: ResearchItem[]
  trials: SavedTrial[]
  savedSearches: SavedSearch[]
  analyses: AnalysisEntry[]
  briefs: Brief[]
  briefVersions: BriefVersion[]
  settings: AppSettings[]
}

export interface BackupSummary {
  exportedAt: Date
  counts: BackupRecordCounts
  totalRecords: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`Invalid backup file — ${label} is missing or malformed.`)
  }
  return value
}

function requireDate(value: unknown, label: string): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  throw new Error(`Invalid backup file — ${label} is missing or invalid.`)
}

function readRecordArray(
  value: unknown,
  label: BackupCollectionKey,
): Record<string, unknown>[] {
  if (value === undefined) return []
  if (!Array.isArray(value)) {
    throw new Error(`Invalid backup file — ${label} must be an array.`)
  }

  return value.map((entry, index) => requireRecord(entry, `${label}[${index}]`))
}

function revivePatientProfile(record: Record<string, unknown>): PatientProfile {
  return {
    ...(record as unknown as Omit<PatientProfile, 'createdAt' | 'updatedAt'>),
    createdAt: requireDate(record.createdAt, 'patientProfiles.createdAt'),
    updatedAt: requireDate(record.updatedAt, 'patientProfiles.updatedAt'),
  }
}

function revivePatientVersion(record: Record<string, unknown>): PatientVersion {
  return {
    ...(record as unknown as Omit<PatientVersion, 'createdAt' | 'snapshot'>),
    createdAt: requireDate(record.createdAt, 'patientVersions.createdAt'),
    snapshot: revivePatientProfile(requireRecord(record.snapshot, 'patientVersions.snapshot')),
  }
}

function reviveResearchItem(record: Record<string, unknown>): ResearchItem {
  return {
    ...(record as unknown as Omit<ResearchItem, 'createdAt' | 'updatedAt'>),
    createdAt: requireDate(record.createdAt, 'researchItems.createdAt'),
    updatedAt: requireDate(record.updatedAt, 'researchItems.updatedAt'),
  }
}

function reviveSavedTrial(record: Record<string, unknown>): SavedTrial {
  return {
    ...(record as unknown as Omit<SavedTrial, 'lastChecked' | 'savedAt'>),
    lastChecked: requireDate(record.lastChecked, 'trials.lastChecked'),
    savedAt: requireDate(record.savedAt, 'trials.savedAt'),
  }
}

function reviveSavedSearch(record: Record<string, unknown>): SavedSearch {
  return {
    ...(record as unknown as Omit<SavedSearch, 'createdAt'>),
    createdAt: requireDate(record.createdAt, 'savedSearches.createdAt'),
  }
}

function reviveAnalysisEntry(record: Record<string, unknown>): AnalysisEntry {
  return {
    ...(record as unknown as Omit<AnalysisEntry, 'createdAt'>),
    createdAt: requireDate(record.createdAt, 'analyses.createdAt'),
  }
}

function reviveBrief(record: Record<string, unknown>): Brief {
  return {
    ...(record as unknown as Omit<Brief, 'createdAt' | 'updatedAt'>),
    createdAt: requireDate(record.createdAt, 'briefs.createdAt'),
    updatedAt: requireDate(record.updatedAt, 'briefs.updatedAt'),
  }
}

function reviveBriefVersion(record: Record<string, unknown>): BriefVersion {
  return {
    ...(record as unknown as Omit<BriefVersion, 'createdAt' | 'snapshot'>),
    createdAt: requireDate(record.createdAt, 'briefVersions.createdAt'),
    snapshot: reviveBrief(requireRecord(record.snapshot, 'briefVersions.snapshot')),
  }
}

function reviveSettingsRecord(record: Record<string, unknown>): AppSettings {
  return record as unknown as AppSettings
}

export function createBackupFilename(date = new Date()): string {
  return `medical-research-backup-${date.toISOString().slice(0, 10)}.json`
}

export async function collectBackupData(): Promise<BackupData> {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    patientProfiles: await db.patientProfiles.toArray(),
    patientVersions: await db.patientVersions.toArray(),
    researchItems: await db.researchItems.toArray(),
    trials: await db.trials.toArray(),
    savedSearches: await db.savedSearches.toArray(),
    analyses: await db.analyses.toArray(),
    briefs: await db.briefs.toArray(),
    briefVersions: await db.briefVersions.toArray(),
    settings: await db.settings.toArray(),
  }
}

export function parseBackupText(text: string): BackupData {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Backup file is not valid JSON.')
  }

  const root = requireRecord(parsed, 'backup')
  const version = root.version
  if (typeof version !== 'number') {
    throw new Error('Invalid backup file — missing backup version.')
  }

  const exportedAt = requireDate(root.exportedAt, 'backup export date').toISOString()

  return {
    version,
    exportedAt,
    patientProfiles: readRecordArray(root.patientProfiles, 'patientProfiles').map(revivePatientProfile),
    patientVersions: readRecordArray(root.patientVersions, 'patientVersions').map(revivePatientVersion),
    researchItems: readRecordArray(root.researchItems, 'researchItems').map(reviveResearchItem),
    trials: readRecordArray(root.trials, 'trials').map(reviveSavedTrial),
    savedSearches: readRecordArray(root.savedSearches, 'savedSearches').map(reviveSavedSearch),
    analyses: readRecordArray(root.analyses, 'analyses').map(reviveAnalysisEntry),
    briefs: readRecordArray(root.briefs, 'briefs').map(reviveBrief),
    briefVersions: readRecordArray(root.briefVersions, 'briefVersions').map(reviveBriefVersion),
    settings: readRecordArray(root.settings, 'settings').map(reviveSettingsRecord),
  }
}

export function summarizeBackupData(data: BackupData): BackupSummary {
  const counts = BACKUP_COLLECTION_KEYS.reduce<BackupRecordCounts>((acc, key) => {
    acc[key] = data[key].length
    return acc
  }, {} as BackupRecordCounts)

  const totalRecords = Object.values(counts).reduce((sum, value) => sum + value, 0)

  return {
    exportedAt: requireDate(data.exportedAt, 'backup export date'),
    counts,
    totalRecords,
  }
}

export function downloadBackupFile(
  data: BackupData,
  filename = createBackupFilename(),
): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function downloadBackup(): Promise<BackupSummary> {
  const data = await collectBackupData()
  downloadBackupFile(data)
  return summarizeBackupData(data)
}

export async function readBackupFile(file: File): Promise<BackupData> {
  return parseBackupText(await file.text())
}

export async function restoreBackupData(data: BackupData): Promise<BackupSummary> {
  await db.transaction(
    'rw',
    [
      db.patientProfiles,
      db.patientVersions,
      db.researchItems,
      db.trials,
      db.savedSearches,
      db.analyses,
      db.briefs,
      db.briefVersions,
      db.settings,
    ],
    async () => {
      await db.patientProfiles.clear()
      await db.patientVersions.clear()
      await db.researchItems.clear()
      await db.trials.clear()
      await db.savedSearches.clear()
      await db.analyses.clear()
      await db.briefs.clear()
      await db.briefVersions.clear()
      await db.settings.clear()

      if (data.patientProfiles.length > 0) await db.patientProfiles.bulkPut(data.patientProfiles as never[])
      if (data.patientVersions.length > 0) await db.patientVersions.bulkPut(data.patientVersions as never[])
      if (data.researchItems.length > 0) await db.researchItems.bulkPut(data.researchItems as never[])
      if (data.trials.length > 0) await db.trials.bulkPut(data.trials as never[])
      if (data.savedSearches.length > 0) await db.savedSearches.bulkPut(data.savedSearches as never[])
      if (data.analyses.length > 0) await db.analyses.bulkPut(data.analyses as never[])
      if (data.briefs.length > 0) await db.briefs.bulkPut(data.briefs as never[])
      if (data.briefVersions.length > 0) await db.briefVersions.bulkPut(data.briefVersions as never[])
      if (data.settings.length > 0) await db.settings.bulkPut(data.settings as never[])
    },
  )

  return summarizeBackupData(data)
}

export async function exportBackup(): Promise<void> {
  await downloadBackup()
}

export async function importBackup(file: File): Promise<void> {
  const data = await readBackupFile(file)
  await restoreBackupData(data)
}
