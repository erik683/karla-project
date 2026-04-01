export type AnalysisType =
  | 'Treatment Gap'
  | 'Mechanism Mapping'
  | 'Similar Case Pattern'
  | 'Combination Hypothesis'
  | 'Palliative Optimization'
  | 'Custom Query'

export interface AnalysisEntry {
  id?: number
  type: AnalysisType
  customQuery: string
  promptUsed: string
  result: string
  informingResearchItemIds: number[]
  informingTrialIds: number[]
  createdAt: Date
}
