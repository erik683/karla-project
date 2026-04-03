import { describe, expect, it } from 'vitest'
import { parseBackupText, summarizeBackupData } from './backupRestore'

describe('backupRestore', () => {
  it('revives date fields when parsing a backup file', () => {
    const backupJson = JSON.stringify({
      version: 1,
      exportedAt: '2026-04-03T12:00:00.000Z',
      patientProfiles: [
        {
          id: 1,
          initials: 'KP',
          diagnosis: 'Example diagnosis',
          secondaryConditions: '',
          stage: 'IV',
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
          createdAt: '2026-04-01T10:00:00.000Z',
          updatedAt: '2026-04-02T11:00:00.000Z',
        },
      ],
      patientVersions: [
        {
          id: 7,
          profileId: 1,
          snapshot: {
            id: 1,
            initials: 'KP',
            diagnosis: 'Example diagnosis',
            secondaryConditions: '',
            stage: 'IV',
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
            createdAt: '2026-04-01T10:00:00.000Z',
            updatedAt: '2026-04-02T11:00:00.000Z',
          },
          createdAt: '2026-04-02T11:05:00.000Z',
        },
      ],
      researchItems: [
        {
          id: 2,
          question: 'What options remain?',
          category: 'Treatment',
          priority: 'High',
          status: 'Queued',
          agentNotes: '',
          sources: [],
          advocateNotes: '',
          linkedTrialIds: [],
          linkedAnalysisIds: [],
          sortOrder: 0,
          createdAt: '2026-04-02T11:10:00.000Z',
          updatedAt: '2026-04-02T11:11:00.000Z',
        },
      ],
      trials: [
        {
          id: 3,
          nctId: 'NCT00000001',
          title: 'Example Trial',
          phase: 'Phase 2',
          overallStatus: 'RECRUITING',
          conditions: ['Example condition'],
          interventionSummary: 'Drug: Example',
          eligibilityCriteria: 'Adults 18+',
          eligibilityFlags: [],
          locations: [],
          contacts: [],
          advocateNotes: '',
          localStatus: 'New',
          watching: true,
          lastChecked: '2026-04-02T11:12:00.000Z',
          savedAt: '2026-04-02T11:13:00.000Z',
        },
      ],
      savedSearches: [
        {
          id: 4,
          name: 'Example search',
          params: {
            condition: 'Example condition',
            interventionType: '',
            phases: [],
            statuses: ['RECRUITING'],
            location: '',
            age: '',
            sex: '',
          },
          createdAt: '2026-04-02T11:14:00.000Z',
        },
      ],
      analyses: [
        {
          id: 5,
          type: 'Treatment Gap',
          customQuery: '',
          promptUsed: 'prompt',
          result: 'result',
          informingResearchItemIds: [2],
          informingTrialIds: [3],
          createdAt: '2026-04-02T11:15:00.000Z',
        },
      ],
      briefs: [
        {
          id: 6,
          title: 'Brief',
          advocateName: 'Advocate',
          executiveSummary: '',
          options: [],
          trialsNarrative: '',
          questions: [],
          appendixLinks: [],
          includedResearchItemIds: [2],
          includedTrialIds: [3],
          createdAt: '2026-04-02T11:16:00.000Z',
          updatedAt: '2026-04-02T11:17:00.000Z',
        },
      ],
      briefVersions: [
        {
          id: 8,
          briefId: 6,
          versionNumber: 1,
          snapshot: {
            id: 6,
            title: 'Brief',
            advocateName: 'Advocate',
            executiveSummary: '',
            options: [],
            trialsNarrative: '',
            questions: [],
            appendixLinks: [],
            includedResearchItemIds: [2],
            includedTrialIds: [3],
            createdAt: '2026-04-02T11:16:00.000Z',
            updatedAt: '2026-04-02T11:17:00.000Z',
          },
          createdAt: '2026-04-02T11:18:00.000Z',
        },
      ],
      settings: [{ key: 'claudeApiKey', value: 'secret' }],
    })

    const data = parseBackupText(backupJson)

    expect(data.patientProfiles[0].createdAt).toBeInstanceOf(Date)
    expect(data.patientProfiles[0].updatedAt).toBeInstanceOf(Date)
    expect(data.patientVersions[0].createdAt).toBeInstanceOf(Date)
    expect(data.patientVersions[0].snapshot.updatedAt).toBeInstanceOf(Date)
    expect(data.researchItems[0].updatedAt).toBeInstanceOf(Date)
    expect(data.trials[0].savedAt).toBeInstanceOf(Date)
    expect(data.savedSearches[0].createdAt).toBeInstanceOf(Date)
    expect(data.analyses[0].createdAt).toBeInstanceOf(Date)
    expect(data.briefs[0].updatedAt).toBeInstanceOf(Date)
    expect(data.briefVersions[0].snapshot.createdAt).toBeInstanceOf(Date)
  })

  it('accepts older backups that omit empty collections', () => {
    const data = parseBackupText(
      JSON.stringify({
        version: 1,
        exportedAt: '2026-04-03T12:00:00.000Z',
      }),
    )

    expect(data.patientProfiles).toEqual([])
    expect(data.trials).toEqual([])
    expect(data.settings).toEqual([])
  })

  it('summarizes record counts for the restore preview', () => {
    const data = parseBackupText(
      JSON.stringify({
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
            createdAt: '2026-04-01T10:00:00.000Z',
            updatedAt: '2026-04-02T11:00:00.000Z',
          },
        ],
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
            createdAt: '2026-04-02T11:10:00.000Z',
            updatedAt: '2026-04-02T11:11:00.000Z',
          },
        ],
      }),
    )

    const summary = summarizeBackupData(data)

    expect(summary.totalRecords).toBe(2)
    expect(summary.counts.patientProfiles).toBe(1)
    expect(summary.counts.researchItems).toBe(1)
    expect(summary.exportedAt).toBeInstanceOf(Date)
  })
})
