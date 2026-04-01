import type { PatientProfile } from '../types/patient'
import type { EligibilityFlag } from '../types/trials'

/**
 * Keyword-based heuristic matcher.
 * Compares trial eligibility criteria text against the patient profile
 * and returns flags for potential matches, conflicts, or unknowns.
 * This is NOT AI-driven — it's a fast first-pass filter.
 */
export function matchEligibility(
  eligibilityCriteria: string,
  profile: PatientProfile,
): EligibilityFlag[] {
  const flags: EligibilityFlag[] = []
  const criteria = eligibilityCriteria.toLowerCase()

  // Check diagnosis match
  if (profile.diagnosis) {
    const diagWords = profile.diagnosis.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    const diagMatch = diagWords.some((word) => criteria.includes(word))
    if (diagMatch) {
      flags.push({
        field: 'Diagnosis',
        status: 'match',
        detail: `Criteria may mention condition related to: ${profile.diagnosis}`,
      })
    }
  }

  // Check for conflicting prior treatments
  for (const treatment of profile.treatmentsTried) {
    const treatName = treatment.name.toLowerCase()
    if (treatName.length < 3) continue
    // Look for "prior [treatment]" or "[treatment] naive" style exclusions
    const exclusionPatterns = [
      `prior ${treatName}`,
      `previous ${treatName}`,
      `${treatName} naive`,
      `no prior ${treatName}`,
    ]
    const hasExclusion = exclusionPatterns.some((p) => criteria.includes(p))
    if (hasExclusion) {
      flags.push({
        field: 'Prior Treatment',
        status: 'conflict',
        detail: `Eligibility may conflict with prior use of ${treatment.name}`,
      })
    }
  }

  // Check biomarker requirements
  for (const biomarker of profile.biomarkers) {
    const bName = biomarker.name.toLowerCase()
    if (bName.length < 2) continue
    if (criteria.includes(bName)) {
      flags.push({
        field: 'Biomarker',
        status: 'match',
        detail: `Criteria mentions ${biomarker.name} (patient value: ${biomarker.value})`,
      })
    }
  }

  // Check for age mentions (rough)
  const ageMatch = criteria.match(/(\d+)\s*(?:years?|yr)?\s*(?:of age|old|or older|or younger|minimum|maximum|≥|≤|>|<)/i)
  if (ageMatch) {
    flags.push({
      field: 'Age',
      status: 'unknown',
      detail: `Trial mentions age criteria — verify patient meets requirement`,
    })
  }

  // Check allergy / contraindication conflicts
  if (profile.allergies) {
    const allergyWords = profile.allergies.toLowerCase().split(/[\s,;]+/).filter((w) => w.length > 3)
    for (const word of allergyWords) {
      if (criteria.includes(word)) {
        flags.push({
          field: 'Allergy/Contraindication',
          status: 'conflict',
          detail: `Criteria may mention substance patient is allergic to: ${word}`,
        })
        break
      }
    }
  }

  return flags
}
