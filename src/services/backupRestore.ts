import { db } from '../db/database'

export interface BackupData {
  version: number
  exportedAt: string
  patientProfiles: unknown[]
  patientVersions: unknown[]
  researchItems: unknown[]
  trials: unknown[]
  savedSearches: unknown[]
  analyses: unknown[]
  briefs: unknown[]
  briefVersions: unknown[]
  settings: unknown[]
}

export async function exportBackup(): Promise<void> {
  const data: BackupData = {
    version: 1,
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

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `medical-research-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importBackup(file: File): Promise<void> {
  const text = await file.text()
  const data = JSON.parse(text) as Partial<BackupData>

  if (!data.version || !data.exportedAt) {
    throw new Error('Invalid backup file — missing version or export date.')
  }

  // Clear and reimport all tables
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

      if (data.patientProfiles?.length) await db.patientProfiles.bulkAdd(data.patientProfiles as never[])
      if (data.patientVersions?.length) await db.patientVersions.bulkAdd(data.patientVersions as never[])
      if (data.researchItems?.length) await db.researchItems.bulkAdd(data.researchItems as never[])
      if (data.trials?.length) await db.trials.bulkAdd(data.trials as never[])
      if (data.savedSearches?.length) await db.savedSearches.bulkAdd(data.savedSearches as never[])
      if (data.analyses?.length) await db.analyses.bulkAdd(data.analyses as never[])
      if (data.briefs?.length) await db.briefs.bulkAdd(data.briefs as never[])
      if (data.briefVersions?.length) await db.briefVersions.bulkAdd(data.briefVersions as never[])
      if (data.settings?.length) await db.settings.bulkAdd(data.settings as never[])
    },
  )
}
