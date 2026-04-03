# Medical Research Workspace — Project Framework

## Purpose

Build an interactive research workspace that helps a patient advocate (non-medical professional) systematically gather, organize, and present treatment options, clinical trials, and emerging research to a patient's medical team. The patient's condition is advanced/terminal, with hospice already discussed — the goal is to surface options the care team may not have considered, presented as suggestions for their professional evaluation.

**This tool does NOT replace medical judgment. Every output is framed as "options to discuss with her doctors," never as recommendations.**

---

## Architecture Overview

The workspace is a single-page React application with a persistent data layer, organized into modules. Each module serves a distinct research function. The AI agents (Claude API, Codex) are the primary research engines — the UI is for organizing their findings, tracking what's been explored, and preparing summaries for medical conversations.

### Core Modules

```
┌─────────────────────────────────────────────────────────┐
│                    WORKSPACE SHELL                       │
│  Navigation / Patient Profile Header / Export Controls   │
├──────────┬──────────┬──────────┬────────────┬───────────┤
│ Patient  │ Research │ Clinical │ Pattern    │ Doctor    │
│ Profile  │ Queue    │ Trials   │ Analysis   │ Brief     │
│          │          │ Finder   │            │ Builder   │
└──────────┴──────────┴──────────┴────────────┴───────────┘
```

---

## Module 1: Patient Profile

### Purpose
Central record of the patient's condition, history, and current treatment status. This is the context payload that gets injected into every AI research query so results are relevant.

### Data Fields
```
- Diagnosis (primary + any secondary/comorbid conditions)
- Disease stage / progression timeline
- Biomarkers / genetic markers (if known)
- Treatments tried (with dates, duration, outcome, reason stopped)
- Current medications
- Allergies / contraindications
- Functional status (ambulatory, bedridden, etc.)
- Key lab values (most recent + trend direction)
- Patient preferences / constraints (travel ability, tolerance
  for side effects, quality-of-life priorities)
- Care team members (names, specialties — for reference only)
```

### Behavior
- All fields are manually entered by the advocate
- Profile data is stored locally in IndexedDB via Dexie
- Full workspace data can be backed up to JSON and restored later
- A "Profile Summary" button generates a de-identified text block
  suitable for pasting into AI research prompts
- Version history so you can track how the profile changes over time

---

## Module 2: Research Queue

### Purpose
A structured task board for organizing research questions. Instead of ad-hoc searching, this gives you a systematic way to define what you're looking for, track what's been explored, and log what was found.

### Structure
```
Research Item:
  - Question: (plain language, e.g., "Are there any off-label uses
    of [Drug X] for [her specific condition]?")
  - Category: [Treatment | Mechanism | Supportive Care | Palliative
    | Diagnostic | Other]
  - Priority: [High | Medium | Low]
  - Status: [Queued | In Progress | Reviewed | Dismissed | Flagged
    for Doctor]
  - Agent Notes: (AI-generated research summary, pasted in)
  - Sources: (links to papers, trials, articles)
  - Advocate Notes: (your own observations or context)
  - Date Created / Date Updated
```

### Behavior
- Kanban-style board (columns = status)
- Drag items between columns
- Click to expand full detail view
- "Generate Prompt" button: takes the research question + patient
  profile summary and formats a ready-to-paste prompt for Claude
  or Codex, structured like:

  ```
  Given the following patient profile:
  [auto-inserted profile summary]

  Research question:
  [auto-inserted question]

  Please search for:
  1. Relevant peer-reviewed studies (prioritize last 5 years)
  2. Off-label or emerging uses of existing treatments
  3. Case reports with similar patient profiles
  4. Mechanisms of action that might apply
  5. Known contraindications given the patient's history

  Format your response as:
  - Summary (2-3 sentences)
  - Key findings (bulleted, with source references)
  - Relevance assessment (how closely this matches the patient)
  - Suggested follow-up questions
  ```

---

## Module 3: Clinical Trials Finder

### Purpose
Systematic search and tracking of clinical trials that might be relevant. This module helps you search, filter, and organize trial information.

### Data Sources to Query
```
- ClinicalTrials.gov API (primary — free, comprehensive)
  endpoint: https://clinicaltrials.gov/api/v2/studies
- Additional registries or literature sources can be layered in later, for example:
  - WHO ICTRP (international trials)
  - EU Clinical Trials Register
  - PubMed (for completed trial results)
  But are not part of the current implementation at this point.
```

### Search Parameters
```
- Condition/disease terms (from patient profile)
- Intervention type filter: [Drug | Biological | Device |
  Procedure | Behavioral | Combination]
- Phase filter: [I | II | III | IV | Expanded Access]
- Status filter: [Recruiting | Not Yet Recruiting |
  Expanded Access Available]
- Location radius: (from patient's location or "remote/virtual")
- Age/sex eligibility match
- Exclusion criteria check (flag trials the patient likely
  wouldn't qualify for based on profile)
```

### Trial Card Display
```
Each result shows:
  - Trial title + NCT number (linked to ClinicalTrials.gov)
  - Phase and status
  - Intervention summary
  - Key eligibility criteria (with auto-flagged matches/conflicts
    against patient profile)
  - Nearest participating site + distance
  - Contact information
  - Advocate notes field
  - Status tag: [New | Reviewing | Eligible? | Ineligible |
    Discuss with Doctor | Contacted]
```

### Behavior
- Saved searches that can be re-run periodically
- "Watch" a trial for status changes
- Export current search results as CSV for doctor visits or offline review

---

## Module 4: Pattern Analysis

### Purpose
When you've accumulated research findings, this module helps you look across everything to find patterns, connections, or angles that might not be obvious from any single finding.

### How It Works
This is primarily an AI-driven analysis module. The workflow:

1. **Collect**: Pull in all "Flagged for Doctor" and "Reviewed"
   items from the Research Queue, plus any saved trial data
2. **Prompt Construction**: Automatically build a comprehensive
   prompt that includes:
   - Patient profile summary
   - All accumulated research findings
   - Trial eligibility assessments
   - The specific analysis request
3. **Analysis Types** (selectable):
   - **Treatment Gap Analysis**: "Given everything tried and
     everything found, what categories of treatment have NOT been
     explored?"
   - **Mechanism Mapping**: "What biological mechanisms are
     targeted by treatments that showed some efficacy? Are there
     other drugs/interventions targeting the same mechanisms?"
   - **Similar Case Pattern**: "Based on the patient profile and
     disease progression, what published case reports show the
     most similar trajectories? What interventions were tried in
     those cases?"
   - **Combination Hypothesis**: "Are there any documented cases
     of synergistic effects between treatments the patient has
     already tolerated and newer interventions?"
   - **Palliative Optimization**: "Given current symptoms and
     medications, are there evidence-based approaches to improve
     quality of life that may not have been tried?"
   - **Custom Query**: Free-text analysis request with all
     context auto-injected

4. **Output**: Structured analysis saved as a dated entry,
   tagged with which research items informed it

### Current Implementation Notes
- Runs against Anthropic's Messages API using a user-provided Claude API key
- Supports prompt preview/editing before execution
- Streams results into the UI while the analysis is running
- Saves completed analyses to local history for later review

---

## Module 5: Doctor Brief Builder

### Purpose
Compile research findings into a clean, professional, one-page (or multi-page) summary designed to be handed to or discussed with a physician. Doctors are time-constrained — this needs to be scannable, well-sourced, and respectful of their expertise.

### Brief Structure
```
PATIENT RESEARCH BRIEF
Prepared by: [Advocate Name]
Date: [auto]
Re: [Patient Initials] — [Primary Diagnosis]

EXECUTIVE SUMMARY
[2-3 sentences: what was researched and the single most
 promising finding]

OPTIONS IDENTIFIED FOR DISCUSSION
[Numbered list, each item containing:]
  1. [Treatment/Trial Name]
     - What it is: [1 sentence]
     - Evidence: [key study or trial reference]
     - Relevance: [why it might apply to this patient]
     - Considerations: [contraindications, access, cost]
     - Source: [link]

CLINICAL TRIALS OF POTENTIAL INTEREST
[Table format: Trial Name | Phase | Status | Location | NCT#]

QUESTIONS FOR THE CARE TEAM
[Generated list of informed questions based on research,
 e.g., "Has [Drug X] been considered given [biomarker Y]?"]

APPENDIX
[Links to full studies, trial pages, detailed notes]
```

### Behavior
- Add flagged research items and relevant trials from the side panel
  into the brief editor
- Auto-generates the summary and questions using AI
  (with full context injection)
- Preview the brief, then export as PDF or use browser print
- Version history (Brief v1, v2, etc. as research evolves)

---

## Technical Implementation Notes

### Current Stack
```
Frontend:    React (single-page app)
State:       Zustand
Storage:     IndexedDB via Dexie.js (structured local storage,
             no server needed, data stays on your machine)
Styling:     Tailwind CSS
AI Layer:    Anthropic API (Claude) for research synthesis
             and analysis; calls made client-side with
             user-provided API key
Trials API:  ClinicalTrials.gov v2 API (free, no auth needed)
PDF Export:  jsPDF + html2canvas
Testing:     Vitest + Testing Library
```

### Data Privacy Considerations
```
- ALL data stored locally in the browser (IndexedDB)
- No server, no cloud storage, no telemetry
- API calls to Claude go directly from browser to Anthropic
  (Anthropic's standard data policies apply)
- API calls to ClinicalTrials.gov are public/anonymous
- Patient profile should use initials only, never full name
- Export files are generated client-side
- Backup files are generated client-side as JSON and restored only
  after explicit user confirmation
- Add a prominent disclaimer on every exported document:
  "This research summary was compiled by a patient advocate
   using AI-assisted tools. It is not medical advice. All
   options should be evaluated by qualified medical
   professionals."
```

### Prompt Engineering Notes for AI Agents
```
Every AI query should include:
1. System prompt establishing role:
   "You are a medical research assistant helping a patient
    advocate identify treatment options for discussion with
    a medical team. You are not providing medical advice.
    You are surfacing published research, clinical trials,
    and documented case reports. Always cite sources. Always
    note level of evidence. Flag anything experimental or
    off-label clearly."

2. Patient context block (auto-injected from profile)

3. Specific research question or analysis request

4. Output format specification (structured for parsing
   back into the UI)

5. Instruction to flag uncertainty:
   "If evidence is limited, conflicting, or low-quality,
    say so explicitly. Do not overstate findings."
```

---

## Build Sequence (Suggested Order)

```
Phase 1: Foundation
  - Workspace shell with navigation
  - Patient Profile module (data entry + storage)
  - Basic local persistence (IndexedDB)

Phase 2: Research Engine
  - Research Queue (kanban board + detail views)
  - Prompt generator (profile + question → formatted prompt)
  - Copy-to-clipboard for pasting into Claude/Codex

Phase 3: Trials Integration
  - ClinicalTrials.gov API integration
  - Search interface with filters
  - Trial cards with eligibility flagging
  - Saved searches

Phase 4: Analysis
  - Pattern Analysis module
  - Comprehensive prompt builder (aggregates all data)
  - Analysis history/versioning

Phase 5: Output
  - Doctor Brief Builder
  - Preview, PDF export, and print flow
  - Disclaimer injection on all outputs

Phase 6: Polish
  - Cross-module linking (click a trial reference in a
    brief → opens trial detail)
  - Notification system for trial status changes
  - Additional restore validation / schema migration handling
```

---

## Usage Workflow (How the Advocate Uses This)

```
1. Fill out Patient Profile with everything you know
2. Add research questions to the Queue as they come up
   (from your own thinking, from doctor conversations,
   from reading)
3. Use "Generate Prompt" to create structured queries,
   paste into Claude/Codex, paste results back in
4. Run Clinical Trials searches periodically, save
   promising results
5. When you have enough findings, run Pattern Analysis
   to look for connections
6. Before a doctor appointment, use Brief Builder to
   compile a professional summary
7. After the appointment, update the profile and queue
   based on what the doctor said
8. Repeat
```

---

## Addendum (2026-04-03)

- Current repo status: the workspace is beyond scaffold stage and already includes the full five-module shell, local Dexie persistence, live ClinicalTrials.gov search, Claude-backed analysis/brief generation, PDF export, and backup/restore plumbing.
- Main stabilization gaps observed during sweep: automated test coverage is still minimal, current local toolchain verification is blocked by the repo using Vite/Vitest versions that require Node 20.19+ while this machine is on Node 18.19.1, and backup/restore needed a safer restore path with clearer UX.
- Runtime note: the repo now declares its supported Node version in `package.json`, and `.nvmrc` pins `20.19.0` so local shells can align with the Vite/Vitest toolchain before running `build` or `test`.
- ~~Solidify backup/restore with a user-friendly "Download Data" / "Restore Data" flow and add focused tests around parsing, restore preview, and date-safe import behavior.~~ Completed on 2026-04-03.
- Follow-up note: backup parsing currently records a schema `version` but does not yet reject newer unsupported versions. Keep this on the addendum list until restore explicitly blocks backups created by future incompatible schema revisions.
