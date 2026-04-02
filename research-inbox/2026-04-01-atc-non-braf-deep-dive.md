# ATC deep dive — non-BRAF / BRAF-non-V600 / RAS-pathway angles

_Date:_ 2026-04-01  
_Scope:_ De-identified research memo for discussion with oncology team. This is not medical advice.

## Working frame

Current working assumption is **ATC that is not classic BRAF V600E-driven**, pending the actual molecular report. In practice that means one of the following buckets may end up being the real one once the report lands:

1. **BRAF wild-type / no actionable BRAF mutation**
2. **BRAF non-V600 mutation** (for example class 2 or class 3)
3. **RAS-driven disease** (NRAS/KRAS/HRAS, or NF1/2-adjacent MAPK biology)
4. **Fusion-driven disease hiding inside “non-BRAF” shorthand** (RET, NTRK, ALK, ROS1, etc.)
5. **Tumor-agnostic immunotherapy bucket** (MSI-H/dMMR or TMB-high)

That distinction matters because the evidence is not one-size-fits-all.

---

## High-confidence takeaways

### 1) If this really is “non-BRAF” ATC, expert-center / trial-first thinking is still the right frame

The 2021 ATA ATC guidelines still hold up as the backbone: ATC needs rapid multidisciplinary management, **early molecular testing**, and palliative/supportive care integrated alongside active therapy rather than reserved only for end-of-life. The guideline specifically treats molecular testing as part of expanding therapeutic options.

Why this matters here: if the case is **not** classic BRAF V600E, standard evidence gets much thinner and trial matching becomes more important, not less.

### 2) Dual checkpoint blockade is a real salvage option in ATC, but not a guaranteed one

The 2024 phase 2 nivolumab + ipilimumab trial reported in the exploratory ATC cohort:
- **ORR 30% (3/10)**
- **clinical benefit rate 50% (5/10)**

That is enough to justify continued interest in Opdivo/Yervoy once bleeding / wound / vascular issues are acceptable, but it is still a minority-response setting.

Important wrinkle: the biomarker section of that paper specifically analyzed **NRAS variant status** for PFS and OS, which makes exact NRAS details worth getting immediately once the report arrives.

### 3) The strongest published “non-BRAF / RAS-pathway” signal I found is mutation-matched therapy plus checkpoint blockade

The 2024 nonrandomized trial of **atezolizumab + mutation-matched targeted therapy** split ATC into 3 groups:
- **BRAF V600E:** vemurafenib + cobimetinib + atezolizumab
- **RAS/NF:** cobimetinib + atezolizumab
- **non-BRAF/RAS/NF:** bevacizumab + atezolizumab

For the **RAS/NF cohort**:
- **ORR 14%**
- **median PFS 4.8 months**
- **median OS 8.7 months**

For the **non-BRAF/RAS/NF cohort**:
- **median PFS 1.3 months**
- **median OS 6.21 months**

This is not a home run, but it is one of the clearer pieces of prospective evidence pointing toward a **MEK-pathway strategy** when the disease is RAS/NF related.

### 4) There is a concrete case report showing that some “non-BRAF” disease is only untargetable until the exact mutation class is known

A published case report described metastatic ATC with **NRAS Q61R + BRAF D594N** (a **class 3 BRAF** mutation, not V600E). The tumor had progressed on **PD-1 antibody + anti-angiogenic therapy**, then achieved a **complete pathological response** to **dabrafenib + trametinib + PD-1 antibody**.

That does **not** mean this combination is standard for all “non-BRAF” ATC. It does mean that if the report comes back with a **class 3 / non-V600 BRAF** plus RAS context, there is at least a mechanistically rational and published precedent for discussing a **BRAF/MEK + PD-1 triplet** rather than dismissing all BRAF-directed therapy outright.

### 5) “CAR-T was shut down” does not appear to be the full public picture

The thyroid CAR-T study **AIC100** (ICAM-1-directed CAR-T) is still listed on ClinicalTrials.gov as **Active, not recruiting** with a last update posted **2025-03-30**. The trial description explicitly includes:
- **BRAF wild-type ATC, including newly diagnosed**, and
- **BRAF-mutant ATC after failure of BRAF-specific therapy**

I did **not** find a reliable public source confirming that the program itself was terminated because of a death. That may refer to a site-level event, an earlier hold, or a different cell therapy program. Publicly, the study still appears alive, though not currently recruiting.

### 6) There is a new trial built specifically around BRAF V600E-wild-type ATC

The **NEO-COMBAT XL** trial (NCT06902376) is a phase Ib study of **XL092 (zanzalintinib) + cemiplimab** for **BRAF V600E wild-type ATC**. NCI lists it as active at **UNC Lineberger** in Chapel Hill, NC.

That is notable because it is one of the cleanest examples I found of a trial designed **specifically for the non-BRAF bucket**, rather than treating these patients as leftovers.

### 7) Lenvatinib + pembrolizumab remains one of the main non-BRAF practical regimens, but the vascular-risk context matters a lot here

Evidence around lenvatinib + pembrolizumab is mixed but real:
- retrospective first-line institutional data exist
- a 2025 neoadjuvant ATC series used **lenvatinib + pembrolizumab** for **BRAFV600E-negative** disease
- pembrolizumab-focused and broader immunotherapy meta-analyses published in 2025–2026 continue to show signal in ATC

But this case has a major complicating factor: **recent neck arterial rupture**.

That matters because:
- the FDA lenvatinib labeling has warned that **serious and fatal carotid artery hemorrhages were seen more frequently in ATC** in post-marketing surveillance
- published case literature describes **common carotid artery rupture during lenvatinib treatment** in ATC
- the 2025 neoadjuvant mutation-based ATC series reported **tracheoesophageal / tracheocutaneous fistulas** during treatment

So any VEGF / anti-angiogenic strategy in a neck-vessel-threatened patient is not just an efficacy question; it is also a **catastrophic local complication** question.

### 8) “Non-BRAF” should never end the workup before fusion testing

If the report does **not** show actionable BRAF V600E, the next biggest miss would be stopping there and failing to check for **RET** or **NTRK** fusions.

Relevant findings:
- A 2024 ATC case report described **selpercatinib** use in **RET fusion-positive ATC**
- a 2024 single-institution larotrectinib series included **1 ATC** among 8 NTRK fusion-positive thyroid cancers treated with larotrectinib, with overall outcomes far better than historic ATC benchmarks
- broader 2025 thyroid literature continues to reinforce that **NTRK-positive thyroid cancers can respond dramatically to TRK inhibitors**

These are low-frequency events, but they matter precisely because they can create a much more actionable lane than generic “non-BRAF” disease.

---

## What looks most actionable right now (before the molecular report)

### Tier 1 — Worth discussing immediately once medically feasible

1. **Nivolumab + ipilimumab** remains evidence-backed enough to stay on the board after vascular stabilization.
2. **Referral / second-opinion review at a center that sees ATC often** remains worthwhile if not already happening.
3. **Clinical trial screening for non-BRAF ATC** should start as soon as enough pathology / molecular detail exists.

### Tier 2 — Highly dependent on exact molecular report

1. **If NRAS / KRAS / HRAS / NF1/2 pathway-driven:** discuss **MEK-based trial logic** and RAS/NF-directed approaches.
2. **If BRAF non-V600 (especially class 3) with RAS context:** do not assume “no BRAF option.” The NRAS Q61R / BRAF D594N case report is the reason to keep a mechanistic lens here.
3. **If RET fusion-positive:** selpercatinib / pralsetinib discussion becomes immediately relevant.
4. **If NTRK fusion-positive:** larotrectinib / entrectinib lane opens.
5. **If MSI-H/dMMR or TMB-high:** tumor-agnostic immunotherapy logic becomes stronger.

### Tier 3 — More exploratory / lower-confidence / context-dependent

1. **AIC100 CAR-T** is still a real program publicly, but access is limited by recruitment status and eligibility logistics.
2. **Abemaciclib** had a dedicated phase II study for BRAF-non-V600E / post-BRAF-therapy ATC, but the NCI listing is **closed to accrual**. Still worth noting as a signal about CDK4/6 being considered a plausible lane.
3. Additional off-label combinations may only make sense after the report clarifies whether there is a biologically coherent target to exploit.

---

## Current trial / program leads worth keeping in the queue

### Active / currently relevant public leads

#### 1) NEO-COMBAT XL (NCT06902376)
- **Setting:** BRAF V600E-wild-type ATC
- **Regimen:** XL092 (zanzalintinib) + cemiplimab
- **Status:** Active
- **Site surfaced:** UNC Lineberger, Chapel Hill, NC
- **Why it matters:** specifically built for the non-BRAF bucket

#### 2) AIC100 CAR-T (NCT04420754)
- **Setting:** relapsed/refractory advanced thyroid cancer and ATC
- **Includes:** BRAF wild-type ATC and BRAF-mutant ATC after BRAF-specific therapy failure
- **Status:** Active, not recruiting
- **Why it matters:** confirms the CAR-T concept is not publicly dead, even if not currently open

#### 3) Lenvatinib + Pembrolizumab trial (NCT04171622)
- **Setting:** stage IVB unresectable or stage IVC metastatic ATC
- **Status:** Active, not recruiting
- **Why it matters:** still one of the central reference regimens for non-BRAF ATC, though vascular risk may limit suitability here

### Not currently open but worth knowing about

#### 4) Abemaciclib for unresectable/metastatic anaplastic/undifferentiated thyroid cancer (NCT04552769)
- **Status:** Closed to accrual
- **Eligibility note:** explicitly designed for ATC without known BRAF V600E, or BRAF V600E after approved therapy failure/intolerance
- **Why it matters:** shows how some programs are carving out a post-BRAF / non-BRAF lane rather than treating it as undifferentiated salvage only

---

## Molecular-report checklist — what to look for immediately when it arrives

Do not settle for “BRAF with NRAS mutation” as a verbal summary. Pull the exact report and classify:

### Mutation identity
- Exact **BRAF variant** (example: V600E vs D594N vs G469A vs K601E etc.)
- Exact **NRAS / KRAS / HRAS codon + amino acid change**
- Variant allele frequencies if reported
- Whether mutations were found on **tissue**, **liquid biopsy**, or both
- Date / specimen source for each result

### Other driver / pathway findings
- **RET fusion**
- **NTRK fusion**
- **ALK / ROS1** if RNA fusion panel was broad enough
- **NF1 / NF2**
- **PIK3CA / PTEN / AKT / mTOR pathway**
- **CDKN2A/B, CCND1, CDK4/6**
- **TERT promoter**
- **TP53**

### Immunotherapy-relevant markers
- **PD-L1** (TPS/CPS and assay if listed)
- **TMB**
- **MSI / MMR**

### Pathology / context questions
- Confirm this is true **ATC** vs PDTC with anaplastic features or mixed histology
- Ask whether molecular testing captured both **original tumor** and **more recent progression tissue**, because resistance clones may differ from the original tumor

---

## Research interpretation notes

### A) Why exact BRAF class matters

“Non-BRAF” often gets used sloppily to mean “not BRAF V600E.” That can hide very different biology.

- **BRAF V600E** -> established BRAF/MEK lane
- **BRAF non-V600 class 2 / 3** -> may behave very differently, sometimes with **RAS dependence** or differential sensitivity to MEK-pathway inhibition
- **truly BRAF wild-type** -> no BRAF-based rationale unless another MAPK dependency is present

### B) Why RAS status matters

If the tumor is genuinely **NRAS-driven**, the published evidence is not nearly as mature as for BRAF V600E ATC. The main signal is **MEK-pathway-based combination work**, not a clean standard targeted drug with a labeled indication.

### C) Why neck-vessel events change everything

This case is not just “metastatic cancer choosing among systemic regimens.” It is also a **locally dangerous neck disease** case. Recent arterial rupture and prior airway compromise mean that any therapy with risk of:
- hemorrhage
- fistula
- rapid necrosis adjacent to a vessel
- impaired wound healing

has to be judged through that lens as much as through tumor response data.

---

## Short list of source-backed discussion points for the next oncology conversation

1. **Can the exact molecular report be reviewed line-by-line?**
2. **Is this truly BRAF-wild-type, or BRAF non-V600?**
3. **Was RNA fusion testing done, and if so did it include RET/NTRK/ALK/ROS1?**
4. **Are PD-L1, TMB, and MSI/MMR available?**
5. **Given recent neck arterial rupture, which regimens are now considered too dangerous from a hemorrhage/fistula standpoint?**
6. **Is Opdivo/Yervoy still the leading next move once clinically safe, or is there a stronger trial-based option if the molecular profile lands in a specific bucket?**
7. **Would this profile justify referral / re-review at an ATC-focused center specifically for trial matching?**
8. **If the report shows class 3 BRAF or RAS/NF biology, is there a MEK-based strategy or trial that fits?**

---

## Search strings to reuse after the report arrives

### If report says BRAF wild-type + NRAS/KRAS/HRAS/NF1/2
- `anaplastic thyroid carcinoma NRAS cobimetinib atezolizumab`
- `anaplastic thyroid carcinoma RAS NF1 MEK inhibitor trial`
- `anaplastic thyroid carcinoma nivolumab ipilimumab NRAS`

### If report says non-V600 BRAF
- `anaplastic thyroid carcinoma BRAF non-V600 class 3 trametinib`
- `anaplastic thyroid carcinoma D594N NRAS dabrafenib trametinib PD-1`

### If report finds a fusion
- `anaplastic thyroid carcinoma RET fusion selpercatinib`
- `anaplastic thyroid carcinoma NTRK fusion larotrectinib`

### If report is “no actionable driver”
- `BRAF wild type anaplastic thyroid cancer clinical trial`
- `ATC non-BRAF trial cemiplimab XL092`
- `ATC CAR-T AIC100`

---

## Sources

1. 2021 American Thyroid Association Guidelines for Management of Patients with Anaplastic Thyroid Cancer  
   https://pmc.ncbi.nlm.nih.gov/articles/PMC8349723/

2. Dual Immune Checkpoint Inhibition in Patients With Aggressive Thyroid Carcinoma: A Phase 2 Nonrandomized Clinical Trial (JAMA Oncol 2024)  
   https://pubmed.ncbi.nlm.nih.gov/39446365/

3. Anti–Programmed Death Ligand 1 Plus Targeted Therapy in Anaplastic Thyroid Carcinoma: A Nonrandomized Clinical Trial  
   https://pmc.ncbi.nlm.nih.gov/articles/PMC11581602/

4. Study of AIC100 CAR T Cells in Relapsed/Refractory Thyroid Cancer (ClinicalTrials.gov NCT04420754)  
   https://clinicaltrials.gov/study/NCT04420754

5. XL092 and Cemiplimab for the Treatment of BRAF V600E-Wild Type Anaplastic Thyroid Cancer, NEO-COMBAT XL Trial (NCI / NCT06902376)  
   https://www.cancer.gov/research/participate/clinical-trials-search/v?id=NCI-2025-01421

6. Lenvatinib and Pembrolizumab for the Treatment of Stage IVB Locally Advanced and Unresectable or Stage IVC Metastatic Anaplastic Thyroid Cancer (ClinicalTrials.gov NCT04171622)  
   https://clinicaltrials.gov/study/NCT04171622

7. Case report: Complete response of an anaplastic thyroid carcinoma patient with NRAS Q61R/BRAF D594N mutations to the triplet of dabrafenib, trametinib and PD-1 antibody  
   https://pmc.ncbi.nlm.nih.gov/articles/PMC10140402/

8. The Efficacy and Safety of Pembrolizumab in Anaplastic Thyroid Carcinoma: A Systematic Review and Meta-Analysis (2025)  
   https://pubmed.ncbi.nlm.nih.gov/40518758/

9. Efficacy and safety of immunotherapy in anaplastic thyroid carcinoma: a systematic review and meta-analysis (2026)  
   https://pubmed.ncbi.nlm.nih.gov/40865971/

10. Mutation-based, neoadjuvant treatment for advanced anaplastic thyroid carcinoma (2025)  
   https://pubmed.ncbi.nlm.nih.gov/40927298/

11. The genomic and evolutionary landscapes of anaplastic thyroid carcinoma (2024)  
   https://pubmed.ncbi.nlm.nih.gov/38412093/

12. A case of selpercatinib treatment for anaplastic thyroid carcinoma resulting in abscess formation (2024)  
   https://pmc.ncbi.nlm.nih.gov/articles/PMC11464953/

13. Single-Institution Experience of Larotrectinib Therapy for Patients With NTRK Fusion-Positive Thyroid Carcinoma (2024)  
   https://pmc.ncbi.nlm.nih.gov/articles/PMC11408928/

14. FDA LENVIMA label / hemorrhage warning reference  
   https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/206947s021lbl.pdf

15. Common carotid artery rupture during treatment with lenvatinib for anaplastic thyroid cancer  
   https://pmc.ncbi.nlm.nih.gov/articles/PMC6498322/
