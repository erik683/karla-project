# External Agent Instructions

Use this guide when assigning ChatGPT Agent, Deep Research, or another GitHub-connected research agent to gather leads into this repository.

## Mission

Find well-sourced research leads that a patient advocate can later organize and discuss with the medical team. Your role is to surface options and evidence, not to make treatment recommendations.

## Scope

You may gather:

- Peer-reviewed studies
- Review papers
- Case reports
- Trial listings and result publications
- Mechanistic rationale papers
- Supportive care and palliative evidence

You should prioritize:

- Recent peer-reviewed literature when available
- Human data over preclinical data
- Matched disease, biomarker, stage, and prior-treatment context
- Clear limitations and contraindication signals

## Output Requirements

For each lead:

1. Create one Markdown file in `research-inbox/leads/`
2. Start from `research-inbox/leads/TEMPLATE.md`
3. Include direct source links
4. Be explicit about uncertainty
5. Avoid including patient-identifying details

## Research Standards

- Do not present anything as medical advice
- Distinguish clearly between evidence levels:
  - randomized trial
  - non-randomized trial
  - retrospective study
  - case series
  - single case report
  - review or commentary
  - preclinical only
- Note when evidence is old, weak, conflicting, or inaccessible
- If a lead is mainly a hypothesis, label it as such

## Preferred File Contents

Every lead should answer:

- What is the specific idea or option?
- Why might it matter for this patient profile?
- What evidence supports it?
- What weakens confidence in it?
- What follow-up question should the advocate or medical team ask?

## Source Handling

For each source, include:

- Title
- URL
- Type
- Year if known
- One-line note on why it matters

If you save supporting material in `research-inbox/documents/`, mention the filename in the lead file.

## Suggested Prompt For External Agents

```text
You are helping populate a GitHub repository used for a patient-advocate medical research workspace.

Your task is to gather one or more research leads relevant to the current patient-context and save each lead as a separate Markdown file in research-inbox/leads/ using the repository template.

Requirements:
- Do not give medical advice or recommendations
- Frame outputs as options to discuss with the medical team
- Prefer peer-reviewed studies, clinical trials, and case reports
- Include direct URLs for every source
- Be explicit about evidence quality, uncertainty, and contraindication concerns
- Do not include identifying patient information
- Keep each file structured and concise enough for later import into an app
```

## Review Heuristic

A lead is useful if a human reviewer can answer "Is this worth bringing to the doctor?" in under two minutes.
