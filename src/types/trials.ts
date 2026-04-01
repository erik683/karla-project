export type EligibilityFlagStatus = 'match' | 'conflict' | 'unknown'

export interface EligibilityFlag {
  field: string
  status: EligibilityFlagStatus
  detail: string
}

export interface TrialLocation {
  facility: string
  city: string
  state: string
  country: string
}

export interface TrialContact {
  name: string
  phone: string
  email: string
}

export type LocalTrialStatus =
  | 'New'
  | 'Reviewing'
  | 'Eligible?'
  | 'Ineligible'
  | 'Discuss with Doctor'
  | 'Contacted'

export interface SavedTrial {
  id?: number
  nctId: string
  title: string
  phase: string
  overallStatus: string
  conditions: string[]
  interventionSummary: string
  eligibilityCriteria: string
  eligibilityFlags: EligibilityFlag[]
  locations: TrialLocation[]
  contacts: TrialContact[]
  advocateNotes: string
  localStatus: LocalTrialStatus
  watching: boolean
  lastChecked: Date
  savedAt: Date
}

// Shape returned directly from ClinicalTrials.gov API v2
export interface ClinicalTrialSearchResult {
  nctId: string
  title: string
  phase: string
  overallStatus: string
  conditions: string[]
  interventionSummary: string
  eligibilityCriteria: string
  locations: TrialLocation[]
  contacts: TrialContact[]
}

export interface SavedSearch {
  id?: number
  name: string
  params: TrialSearchParams
  createdAt: Date
}

export interface TrialSearchParams {
  condition: string
  interventionType: string
  phases: string[]
  statuses: string[]
  location: string
  radius: string
  age: string
  sex: string
}
