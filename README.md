# Medical Research Workspace

A personal tool for patient advocates to systematically gather, organize, and present treatment options and research to a patient's medical team.

**This tool does not provide medical advice. Every output is framed as options to discuss with doctors, never as recommendations.**

**Live version: [erik683.github.io/karla-project](https://erik683.github.io/karla-project/)**
  *Note* Data including patient profile are not persistent on the live version, be sure to save to your local computer using the built-in feature
---

## How to Use

### First-time setup

1. Make sure [Node.js](https://nodejs.org/) (v20 or v22+) is installed.
2. Clone or download this repository.
3. Open a terminal in this folder and run:

```bash
npm install
npm run dev
```

4. Open your browser to the address shown (usually `http://localhost:5173`).

### Getting started in the app

1. **Fill in the Patient Profile** — Enter the diagnosis, disease stage, treatments tried, biomarkers, medications, and any other relevant context. This profile is injected into AI research prompts automatically so results stay relevant.
2. **Add items to the Research Queue** — Write plain-language research questions (e.g., "Are there off-label uses of Drug X for this condition?"), set a priority, and track each one from Queued through to Flagged for Doctor.
3. **Search Clinical Trials** — Use the Clinical Trials Finder to surface trials that match the patient's profile.
4. **Review Pattern Analysis** — The Pattern Analysis module helps identify themes and gaps across what's been researched.
5. **Build a Doctor Brief** — When you're ready for a medical appointment, use the Doctor Brief Builder to compile findings into a clean, printable summary for the care team.

### Saving and backing up your data

All data is stored locally in your browser (IndexedDB — nothing leaves your device). Use the **backup** feature to export a JSON snapshot you can restore later or move to another machine.

---

## What this is

This workspace was built for a patient advocate — someone without a medical background who is trying to make sure a seriously ill patient's care team has seen every potentially relevant option. The idea is that an advocate can do systematic research using AI tools, organize what they find, and then bring it to doctors in a form that's easy to evaluate.

The five modules work together:

| Module | What it does |
|---|---|
| Patient Profile | Stores the patient's medical context; generates a summary for pasting into AI prompts |
| Research Queue | Task board for tracking research questions from open to reviewed |
| Clinical Trials Finder | Searches for trials matching the patient's specific situation |
| Pattern Analysis | Finds themes across research items to spot gaps or recurring signals |
| Doctor Brief Builder | Assembles a clean summary document for medical appointments |

### Technology

- React single-page app, runs entirely in the browser
- Local data storage via Dexie (IndexedDB wrapper) — no server, no account
- Built with Vite + TypeScript + Tailwind CSS
