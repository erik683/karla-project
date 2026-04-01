import type { ClinicalTrialSearchResult, TrialLocation, TrialContact, TrialSearchParams } from '../types/trials'

const BASE_URL = 'https://clinicaltrials.gov/api/v2/studies'

// Fields we request from the API to keep response size reasonable
const FIELDS = [
  'NCTId',
  'BriefTitle',
  'OverallStatus',
  'Phase',
  'Condition',
  'InterventionName',
  'InterventionType',
  'EligibilityCriteria',
  'LocationFacility',
  'LocationCity',
  'LocationState',
  'LocationCountry',
  'CentralContactName',
  'CentralContactPhone',
  'CentralContactEMail',
].join(',')

export interface TrialSearchResponse {
  results: ClinicalTrialSearchResult[]
  nextPageToken: string | null
  totalCount: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractLocations(study: any): TrialLocation[] {
  const locations: TrialLocation[] = []
  const locationsModule = study.protocolSection?.contactsLocationsModule
  if (!locationsModule?.locations) return locations

  for (const loc of locationsModule.locations) {
    locations.push({
      facility: loc.facility ?? '',
      city: loc.city ?? '',
      state: loc.state ?? '',
      country: loc.country ?? '',
    })
  }
  return locations
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractContacts(study: any): TrialContact[] {
  const contacts: TrialContact[] = []
  const module = study.protocolSection?.contactsLocationsModule
  if (!module?.centralContacts) return contacts

  for (const c of module.centralContacts) {
    contacts.push({
      name: c.name ?? '',
      phone: c.phone ?? '',
      email: c.eMail ?? '',
    })
  }
  return contacts
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStudy(study: any): ClinicalTrialSearchResult {
  const id = study.protocolSection?.identificationModule
  const status = study.protocolSection?.statusModule
  const design = study.protocolSection?.designModule
  const conditions = study.protocolSection?.conditionsModule?.conditions ?? []
  const interventions = study.protocolSection?.armsInterventionsModule?.interventions ?? []
  const eligibility = study.protocolSection?.eligibilityModule

  const interventionSummary = interventions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((i: any) => `${i.type ?? ''}: ${i.name ?? ''}`)
    .join('; ')

  return {
    nctId: id?.nctId ?? '',
    title: id?.briefTitle ?? '',
    phase: design?.phases?.join(', ') ?? 'N/A',
    overallStatus: status?.overallStatus ?? '',
    conditions: conditions as string[],
    interventionSummary,
    eligibilityCriteria: eligibility?.eligibilityCriteria ?? '',
    locations: extractLocations(study),
    contacts: extractContacts(study),
  }
}

export async function searchStudies(
  params: TrialSearchParams,
  pageToken?: string,
): Promise<TrialSearchResponse> {
  const query = new URLSearchParams()

  if (params.condition) query.set('query.cond', params.condition)
  if (params.interventionType) query.set('query.intr', params.interventionType)
  if (params.statuses.length > 0) query.set('filter.overallStatus', params.statuses.join(','))
  if (params.phases.length > 0) query.set('filter.phase', params.phases.join(','))
  if (params.age) query.set('filter.age', params.age)
  if (params.sex) query.set('filter.sex', params.sex)
  if (pageToken) query.set('pageToken', pageToken)
  query.set('fields', FIELDS)
  query.set('pageSize', '20')
  query.set('format', 'json')

  const response = await fetch(`${BASE_URL}?${query.toString()}`)
  if (!response.ok) {
    throw new Error(`ClinicalTrials.gov API error: ${response.status}`)
  }

  const data = await response.json() as {
    studies: unknown[]
    nextPageToken?: string
    totalCount?: number
  }

  return {
    results: (data.studies ?? []).map(mapStudy),
    nextPageToken: data.nextPageToken ?? null,
    totalCount: data.totalCount ?? 0,
  }
}

export async function getStudy(nctId: string): Promise<ClinicalTrialSearchResult | null> {
  const query = new URLSearchParams({
    'filter.ids': nctId,
    fields: FIELDS,
    format: 'json',
  })

  const response = await fetch(`${BASE_URL}?${query.toString()}`)
  if (!response.ok) return null

  const data = await response.json() as { studies: unknown[] }
  const study = data.studies?.[0]
  if (!study) return null

  return mapStudy(study)
}
