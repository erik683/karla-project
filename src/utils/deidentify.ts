import type { PatientProfile } from '../types/patient'
import { formatDate } from './formatters'

export function generateProfileSummary(profile: PatientProfile): string {
  const lines: string[] = []

  lines.push(`PATIENT RESEARCH PROFILE`)
  lines.push(`Patient: ${profile.initials || '[Initials not set]'} (initials only)`)
  lines.push(`Generated: ${formatDate(new Date())}`)
  lines.push(``)

  lines.push(`--- DIAGNOSIS ---`)
  lines.push(`Primary: ${profile.diagnosis || 'Not specified'}`)
  if (profile.secondaryConditions) {
    lines.push(`Secondary conditions: ${profile.secondaryConditions}`)
  }
  if (profile.stage) lines.push(`Stage/Grade: ${profile.stage}`)
  if (profile.progressionTimeline) {
    lines.push(`Progression timeline: ${profile.progressionTimeline}`)
  }
  lines.push(``)

  if (profile.biomarkers.length > 0) {
    lines.push(`--- BIOMARKERS & MOLECULAR PROFILE ---`)
    for (const b of profile.biomarkers) {
      const datePart = b.date ? ` (${formatDate(b.date)})` : ''
      lines.push(`• ${b.name}: ${b.value}${datePart}${b.notes ? ` — ${b.notes}` : ''}`)
    }
    lines.push(``)
  }

  if (profile.treatmentsTried.length > 0) {
    lines.push(`--- TREATMENTS TRIED ---`)
    for (const t of profile.treatmentsTried) {
      const dates =
        t.startDate || t.endDate ? ` (${t.startDate || '?'} to ${t.endDate || 'ongoing'})` : ''
      lines.push(`• ${t.name}${dates}`)
      if (t.outcome) lines.push(`  Outcome: ${t.outcome}`)
      if (t.reasonStopped) lines.push(`  Reason stopped: ${t.reasonStopped}`)
    }
    lines.push(``)
  }

  if (profile.currentMedications.length > 0) {
    lines.push(`--- CURRENT MEDICATIONS ---`)
    for (const m of profile.currentMedications) {
      const details = [m.dosage, m.frequency].filter(Boolean).join(', ')
      lines.push(`• ${m.name}${details ? ` — ${details}` : ''}`)
    }
    lines.push(``)
  }

  if (profile.allergies) {
    lines.push(`--- ALLERGIES ---`)
    lines.push(profile.allergies)
    lines.push(``)
  }

  if (profile.contraindications) {
    lines.push(`--- CONTRAINDICATIONS ---`)
    lines.push(profile.contraindications)
    lines.push(``)
  }

  if (profile.functionalStatus) {
    lines.push(`--- FUNCTIONAL STATUS ---`)
    lines.push(profile.functionalStatus)
    lines.push(``)
  }

  if (profile.labValues.length > 0) {
    lines.push(`--- RECENT LAB VALUES ---`)
    for (const l of profile.labValues) {
      const datePart = l.date ? ` (${formatDate(l.date)})` : ''
      const trendPart = l.trend ? ` [${l.trend}]` : ''
      lines.push(`• ${l.name}: ${l.value} ${l.unit}${datePart}${trendPart}`)
    }
    lines.push(``)
  }

  const { preferences } = profile
  if (
    preferences.travelAbility ||
    preferences.sideEffectTolerance ||
    preferences.qualityOfLifePriorities
  ) {
    lines.push(`--- PATIENT PREFERENCES ---`)
    if (preferences.travelAbility) lines.push(`Travel ability: ${preferences.travelAbility}`)
    if (preferences.sideEffectTolerance) lines.push(`Side effect tolerance: ${preferences.sideEffectTolerance}`)
    if (preferences.qualityOfLifePriorities) lines.push(`Quality of life priorities: ${preferences.qualityOfLifePriorities}`)
    lines.push(``)
  }

  // Care team names are intentionally EXCLUDED from this output
  // to reduce privacy risk in AI prompts
  if (profile.careTeam.length > 0) {
    lines.push(`--- CARE TEAM (specialties only) ---`)
    for (const c of profile.careTeam) {
      lines.push(`• ${c.specialty}${c.role ? ` (${c.role})` : ''}`)
    }
    lines.push(``)
  }

  if (profile.additionalNotes) {
    lines.push(`--- ADDITIONAL NOTES ---`)
    lines.push(profile.additionalNotes)
    lines.push(``)
  }

  return lines.join('\n')
}
