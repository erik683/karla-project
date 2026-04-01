export interface BriefOption {
  title: string
  summary: string
  sourceResearchItemId?: number
}

export interface AppendixLink {
  title: string
  url: string
}

export interface Brief {
  id?: number
  title: string
  advocateName: string
  executiveSummary: string
  options: BriefOption[]
  trialsNarrative: string
  questions: string[]
  appendixLinks: AppendixLink[]
  includedResearchItemIds: number[]
  includedTrialIds: number[]
  createdAt: Date
  updatedAt: Date
}

export interface BriefVersion {
  id?: number
  briefId: number
  versionNumber: number
  snapshot: Brief
  createdAt: Date
}
