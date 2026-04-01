import type { PatientProfile } from '../types/patient'
import type { ResearchItem } from '../types/research'
import type { SavedTrial } from '../types/trials'
import type { AnalysisType } from '../types/analysis'
import { generateProfileSummary } from '../utils/deidentify'

export function buildResearchPrompt(
  profile: PatientProfile,
  question: string,
): string {
  const profileSummary = generateProfileSummary(profile)

  return `You are helping a patient advocate research options for a patient. Below is the patient's de-identified medical profile, followed by a research question. Please provide a thorough, well-organized response with relevant information, mechanisms, potential benefits and risks, and any important caveats. Include the types of sources that would support this information (e.g., clinical trials, published studies, case reports).

PATIENT PROFILE:
${profileSummary}

RESEARCH QUESTION:
${question}

Please organize your response with clear headings. Remember: this information is for research purposes only and will be reviewed by a medical professional before any decisions are made.`
}

export function buildAnalysisPrompt(
  profile: PatientProfile,
  researchItems: ResearchItem[],
  trials: SavedTrial[],
  analysisType: AnalysisType,
  customQuery?: string,
): string {
  const profileSummary = generateProfileSummary(profile)

  const researchSummary = researchItems.length > 0
    ? researchItems
        .map(
          (item, i) =>
            `[${i + 1}] ${item.question}\nStatus: ${item.status}\nCategory: ${item.category}${item.agentNotes ? `\nNotes: ${item.agentNotes}` : ''}`,
        )
        .join('\n\n')
    : 'No research items flagged yet.'

  const trialsSummary = trials.length > 0
    ? trials
        .map(
          (t, i) =>
            `[${i + 1}] ${t.title} (${t.nctId})\nPhase: ${t.phase} | Status: ${t.overallStatus}\nLocal status: ${t.localStatus}${t.advocateNotes ? `\nNotes: ${t.advocateNotes}` : ''}`,
        )
        .join('\n\n')
    : 'No trials saved yet.'

  const analysisInstructions: Record<AnalysisType, string> = {
    'Treatment Gap': `Analyze the treatments already tried and identify potential gaps in the treatment approach. What treatment modalities, drug classes, or combinations have NOT been tried that might be worth exploring given this patient's profile and current research? Are there emerging approaches or trial-stage treatments that address gaps in the current approach?`,

    'Mechanism Mapping': `Map the biological mechanisms involved in this patient's condition. Given the biomarkers, treatments tried, and current research, identify: (1) which molecular pathways are likely driving disease progression, (2) which tried treatments target which pathways, (3) which pathways may be under-targeted, and (4) what treatment approaches target those pathways.`,

    'Similar Case Pattern': `Based on the patient's profile (diagnosis, stage, biomarkers, treatments tried), identify patterns in available research about similar patient profiles. What does the literature suggest about outcomes for patients with similar characteristics? Are there specific biomarker combinations or prior treatment histories associated with better or worse responses to particular approaches?`,

    'Combination Hypothesis': `Based on this patient's profile and the research gathered, generate hypotheses about potentially synergistic treatment combinations worth investigating. Consider: (1) mechanistic rationale for combinations, (2) combinations currently being studied in trials, (3) combinations that have shown promise in similar cases. Note any potential interactions or concerns.`,

    'Palliative Optimization': `Analyze the research and patient profile with a focus on quality of life and symptom management. What supportive care options, palliative approaches, or symptom management strategies are supported by the research? How might these be integrated with active treatment approaches?`,

    'Custom Query': customQuery ?? 'Please analyze the patient profile and research gathered and provide insights relevant to the advocate.',
  }

  return `You are helping a patient advocate perform a structured analysis of gathered research for a patient. Below is the patient's de-identified medical profile, a summary of research items that have been gathered and flagged, and a list of relevant clinical trials.

PATIENT PROFILE:
${profileSummary}

FLAGGED RESEARCH ITEMS:
${researchSummary}

SAVED CLINICAL TRIALS:
${trialsSummary}

ANALYSIS REQUESTED — ${analysisType.toUpperCase()}:
${analysisInstructions[analysisType]}

Please provide a structured, thorough response with clear headings. This analysis is for research purposes only and will be reviewed by the patient's medical team. Frame all findings as options and questions to explore, not as recommendations.`
}

export function buildBriefSummaryPrompt(
  profile: PatientProfile,
  researchItems: ResearchItem[],
  trials: SavedTrial[],
): string {
  const profileSummary = generateProfileSummary(profile)

  const itemsSummary = researchItems
    .map((item) => `• ${item.question} (${item.category})${item.agentNotes ? `: ${item.agentNotes.slice(0, 200)}...` : ''}`)
    .join('\n')

  const trialsSummary = trials
    .map((t) => `• ${t.title} (${t.nctId}, Phase ${t.phase}, ${t.overallStatus})`)
    .join('\n')

  return `Write a concise executive summary (3-5 paragraphs) for a doctor's brief about treatment options for the following patient. The summary should be written for a medical professional audience and cover: (1) the patient's current situation, (2) the main research areas explored, (3) the most promising options identified, and (4) a note that all options require physician evaluation.

PATIENT PROFILE:
${profileSummary}

RESEARCH AREAS COVERED:
${itemsSummary}

CLINICAL TRIALS REVIEWED:
${trialsSummary}

Write a clear, professional summary suitable for presenting to the patient's medical team. Do not make specific treatment recommendations — frame everything as options to discuss.`
}

export function buildBriefQuestionsPrompt(
  profile: PatientProfile,
  researchItems: ResearchItem[],
  trials: SavedTrial[],
): string {
  const profileSummary = generateProfileSummary(profile)

  const topics = [
    ...researchItems.map((i) => i.question),
    ...trials.map((t) => `Clinical trial: ${t.title}`),
  ].slice(0, 20)

  return `Based on the patient profile and research gathered below, generate 8-12 specific, thoughtful questions that a patient advocate should raise with the patient's medical team. Questions should be clinically informed and cover: eligibility for options identified, potential interactions with current treatments, timing considerations, and quality of life factors.

PATIENT PROFILE:
${profileSummary}

RESEARCH TOPICS EXPLORED:
${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Return a numbered list of specific questions. Each question should be clear, specific, and actionable in a medical appointment setting.`
}
