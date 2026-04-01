export type ResearchCategory =
  | 'Treatment'
  | 'Mechanism'
  | 'Supportive Care'
  | 'Palliative'
  | 'Diagnostic'
  | 'Other'

export type ResearchPriority = 'High' | 'Medium' | 'Low'

export type ResearchStatus =
  | 'Queued'
  | 'In Progress'
  | 'Reviewed'
  | 'Dismissed'
  | 'Flagged for Doctor'

export interface ResearchSource {
  title: string
  url: string
  type: string
}

export interface ResearchItem {
  id?: number
  question: string
  category: ResearchCategory
  priority: ResearchPriority
  status: ResearchStatus
  agentNotes: string
  sources: ResearchSource[]
  advocateNotes: string
  linkedTrialIds: number[]
  linkedAnalysisIds: number[]
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}
