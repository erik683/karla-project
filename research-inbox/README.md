# Research Inbox

This folder is the intake lane for external AI agents that are gathering research leads before the full in-app Research Queue is implemented.

Agents can add leads here through the GitHub connector by creating:

- One Markdown lead file per idea in `research-inbox/leads/`
- Optional saved documents or exported notes in `research-inbox/documents/`

The goal is to keep incoming research structured enough that we can later import it into the app's `ResearchItem` model with minimal cleanup.

## What Belongs Here

- Peer-reviewed study leads
- Case reports
- Review articles
- Clinical trial leads
- Mechanism hypotheses worth checking
- Supportive care or palliative evidence to discuss with the medical team

## What Does Not Belong Here

- Treatment recommendations stated as medical advice
- PHI or directly identifying patient details
- Unstructured chat dumps with no source list
- Duplicate leads unless the new entry materially improves the prior one

## Folder Structure

```text
research-inbox/
  README.md
  agent-instructions.md
  leads/
    TEMPLATE.md
  documents/
    .gitkeep
```

## File Naming

Use a date plus a short slug:

```text
YYYY-MM-DD-topic-slug.md
```

Example:

```text
2026-04-01-egfr-case-report-osimertinib-after-progression.md
```

## Minimum Standard For A Lead

Each lead should include:

- Research question
- Category
- Priority
- Status
- Short finding summary
- Relevance to this patient context
- At least one source with title, URL, and source type
- Important cautions or limitations

## Status Values

Use the same status language the app already expects:

- `Queued`
- `In Progress`
- `Reviewed`
- `Dismissed`
- `Flagged for Doctor`

## Category Values

Use the same category language the app already expects:

- `Treatment`
- `Mechanism`
- `Supportive Care`
- `Palliative`
- `Diagnostic`
- `Other`

## Import Mapping

These lead files are designed to map cleanly into the app:

- `Research question` -> `question`
- `Category` -> `category`
- `Priority` -> `priority`
- `Status` -> `status`
- `Key findings` and `Relevance` -> `agentNotes`
- `Sources` -> `sources[]`
- `Advocate notes` -> `advocateNotes`

## Working Rule

When in doubt, favor structured evidence over polished prose. A concise, source-backed lead is more useful than a long narrative with weak traceability.
