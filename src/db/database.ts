import Dexie, { type EntityTable } from 'dexie'
import type { PatientProfile, PatientVersion } from '../types/patient'
import type { ResearchItem } from '../types/research'
import type { SavedTrial, SavedSearch } from '../types/trials'
import type { AnalysisEntry } from '../types/analysis'
import type { Brief, BriefVersion } from '../types/brief'

export interface AppSettings {
  key: string
  value: string
}

class MedicalResearchDB extends Dexie {
  patientProfiles!: EntityTable<PatientProfile, 'id'>
  patientVersions!: EntityTable<PatientVersion, 'id'>
  researchItems!: EntityTable<ResearchItem, 'id'>
  trials!: EntityTable<SavedTrial, 'id'>
  savedSearches!: EntityTable<SavedSearch, 'id'>
  analyses!: EntityTable<AnalysisEntry, 'id'>
  briefs!: EntityTable<Brief, 'id'>
  briefVersions!: EntityTable<BriefVersion, 'id'>
  settings!: EntityTable<AppSettings, 'key'>

  constructor() {
    super('MedicalResearchWorkspace')

    this.version(1).stores({
      patientProfiles: '++id, updatedAt',
      patientVersions: '++id, profileId, createdAt',
      researchItems: '++id, status, category, priority, sortOrder, createdAt, updatedAt',
      trials: '++id, nctId, localStatus, watching, savedAt',
      savedSearches: '++id, name, createdAt',
      analyses: '++id, type, createdAt',
      briefs: '++id, title, createdAt, updatedAt',
      briefVersions: '++id, briefId, versionNumber, createdAt',
      settings: 'key',
    })
  }
}

export const db = new MedicalResearchDB()
