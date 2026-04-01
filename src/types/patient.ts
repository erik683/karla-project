export interface Biomarker {
  name: string
  value: string
  date: string
  notes: string
}

export interface Treatment {
  name: string
  startDate: string
  endDate: string
  outcome: string
  reasonStopped: string
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
}

export interface LabValue {
  name: string
  value: string
  unit: string
  date: string
  trend: 'up' | 'down' | 'stable' | ''
}

export interface CareTeamMember {
  name: string
  specialty: string
  role: string
}

export interface PatientPreferences {
  travelAbility: string
  sideEffectTolerance: string
  qualityOfLifePriorities: string
}

export interface PatientProfile {
  id?: number
  initials: string
  diagnosis: string
  secondaryConditions: string
  stage: string
  progressionTimeline: string
  biomarkers: Biomarker[]
  treatmentsTried: Treatment[]
  currentMedications: Medication[]
  allergies: string
  contraindications: string
  functionalStatus: string
  labValues: LabValue[]
  preferences: PatientPreferences
  careTeam: CareTeamMember[]
  additionalNotes: string
  createdAt: Date
  updatedAt: Date
}

export interface PatientVersion {
  id?: number
  profileId: number
  snapshot: PatientProfile
  createdAt: Date
}
