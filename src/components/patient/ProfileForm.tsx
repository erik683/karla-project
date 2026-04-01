import type { PatientProfile, Biomarker, Medication } from '../../types/patient'
import { TreatmentHistoryList } from './TreatmentHistoryList'
import { LabValuesTable } from './LabValuesTable'
import { CareTeamList } from './CareTeamList'

interface Props {
  value: PatientProfile
  onChange: (profile: PatientProfile) => void
}

function set<K extends keyof PatientProfile>(
  profile: PatientProfile,
  key: K,
  val: PatientProfile[K],
): PatientProfile {
  return { ...profile, [key]: val }
}

const sectionClass = 'border border-gray-200 rounded-lg p-5 bg-white space-y-4'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
const textareaClass = inputClass + ' resize-y min-h-[80px]'

export function ProfileForm({ value, onChange }: Props) {
  const emptyBiomarker: Biomarker = { name: '', value: '', date: '', notes: '' }
  const emptyMed: Medication = { name: '', dosage: '', frequency: '' }

  const updateBiomarker = (i: number, field: keyof Biomarker, v: string) =>
    onChange(
      set(value, 'biomarkers', value.biomarkers.map((b, idx) => (idx === i ? { ...b, [field]: v } : b))),
    )

  const updateMed = (i: number, field: keyof Medication, v: string) =>
    onChange(
      set(value, 'currentMedications', value.currentMedications.map((m, idx) => (idx === i ? { ...m, [field]: v } : m))),
    )

  return (
    <div className="space-y-6">

      {/* Identification */}
      <div className={sectionClass}>
        <h3 className="text-base font-semibold text-gray-900">Patient Identification</h3>
        <div>
          <label className={labelClass}>
            Patient initials <span className="text-red-500">*</span>
            <span className="ml-1 text-xs text-gray-400 font-normal">(never use a full name — initials only)</span>
          </label>
          <input
            type="text"
            className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            placeholder="e.g., K.L."
            value={value.initials}
            onChange={(e) => onChange(set(value, 'initials', e.target.value))}
            maxLength={10}
          />
        </div>
      </div>

      {/* Diagnosis */}
      <div className={sectionClass}>
        <h3 className="text-base font-semibold text-gray-900">Diagnosis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Primary diagnosis</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g., Non-small cell lung cancer, adenocarcinoma"
              value={value.diagnosis}
              onChange={(e) => onChange(set(value, 'diagnosis', e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Stage / Grade</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g., Stage IV, Grade 3"
              value={value.stage}
              onChange={(e) => onChange(set(value, 'stage', e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Secondary conditions / comorbidities</label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g., Type 2 diabetes, hypertension"
            value={value.secondaryConditions}
            onChange={(e) => onChange(set(value, 'secondaryConditions', e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Progression timeline</label>
          <textarea
            className={textareaClass}
            placeholder="Describe how the disease has progressed over time, key milestones, when it was diagnosed, spread, etc."
            value={value.progressionTimeline}
            onChange={(e) => onChange(set(value, 'progressionTimeline', e.target.value))}
          />
        </div>
      </div>

      {/* Biomarkers */}
      <div className={sectionClass}>
        <h3 className="text-base font-semibold text-gray-900">Biomarkers & Molecular Profile</h3>
        <p className="text-xs text-gray-500">
          Include genetic mutations, receptor status, PD-L1, tumor mutational burden, etc.
        </p>
        <div className="space-y-2">
          {value.biomarkers.map((b, i) => (
            <div key={i} className="flex gap-2 items-start border border-gray-200 rounded-md p-2 bg-gray-50">
              <input
                type="text"
                placeholder="Marker (e.g., EGFR)"
                value={b.name}
                onChange={(e) => updateBiomarker(i, 'name', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Result (e.g., Exon 19 deletion)"
                value={b.value}
                onChange={(e) => updateBiomarker(i, 'value', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Date"
                value={b.date}
                onChange={(e) => updateBiomarker(i, 'date', e.target.value)}
                className="w-28 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Notes"
                value={b.notes}
                onChange={(e) => updateBiomarker(i, 'notes', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() =>
                  onChange(set(value, 'biomarkers', value.biomarkers.filter((_, idx) => idx !== i)))
                }
                className="text-red-400 hover:text-red-600 p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange(set(value, 'biomarkers', [...value.biomarkers, { ...emptyBiomarker }]))}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add biomarker
          </button>
        </div>
      </div>

      {/* Treatments tried */}
      <div className={sectionClass}>
        <h3 className="text-base font-semibold text-gray-900">Treatments Tried</h3>
        <p className="text-xs text-gray-500">All prior treatments — chemotherapy, targeted therapy, immunotherapy, radiation, surgery, etc.</p>
        <TreatmentHistoryList
          value={value.treatmentsTried}
          onChange={(t) => onChange(set(value, 'treatmentsTried', t))}
        />
      </div>

      {/* Current medications */}
      <div className={sectionClass}>
        <h3 className="text-base font-semibold text-gray-900">Current Medications</h3>
        <div className="space-y-2">
          {value.currentMedications.map((m, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Medication name"
                value={m.name}
                onChange={(e) => updateMed(i, 'name', e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Dosage"
                value={m.dosage}
                onChange={(e) => updateMed(i, 'dosage', e.target.value)}
                className="w-28 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Frequency"
                value={m.frequency}
                onChange={(e) => updateMed(i, 'frequency', e.target.value)}
                className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() =>
                  onChange(set(value, 'currentMedications', value.currentMedications.filter((_, idx) => idx !== i)))
                }
                className="text-red-400 hover:text-red-600 p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange(set(value, 'currentMedications', [...value.currentMedications, { ...emptyMed }]))}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add medication
          </button>
        </div>
      </div>

      {/* Allergies & Contraindications */}
      <div className={sectionClass}>
        <h3 className="text-base font-semibold text-gray-900">Allergies & Contraindications</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Allergies</label>
            <textarea
              className={textareaClass}
              placeholder="Known drug allergies or sensitivities"
              value={value.allergies}
              onChange={(e) => onChange(set(value, 'allergies', e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Contraindications</label>
            <textarea
              className={textareaClass}
              placeholder="Conditions or medications that rule out certain treatments"
              value={value.contraindications}
              onChange={(e) => onChange(set(value, 'contraindications', e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Functional status */}
      <div className={sectionClass}>
        <h3 className="text-base font-semibold text-gray-900">Functional Status</h3>
        <div>
          <label className={labelClass}>
            Performance status
            <span className="ml-1 text-xs text-gray-400 font-normal">(e.g., ECOG 0-4, Karnofsky, or plain description)</span>
          </label>
          <textarea
            className={textareaClass}
            placeholder="e.g., ECOG 1 — able to carry out light work, some restrictions in physically strenuous activity"
            value={value.functionalStatus}
            onChange={(e) => onChange(set(value, 'functionalStatus', e.target.value))}
          />
        </div>
      </div>

      {/* Lab values */}
      <div className={sectionClass}>
        <h3 className="text-base font-semibold text-gray-900">Recent Lab Values</h3>
        <p className="text-xs text-gray-500">Include CBC, metabolic panel, tumor markers, organ function, or anything relevant.</p>
        <LabValuesTable
          value={value.labValues}
          onChange={(l) => onChange(set(value, 'labValues', l))}
        />
      </div>

      {/* Preferences */}
      <div className={sectionClass}>
        <h3 className="text-base font-semibold text-gray-900">Patient Preferences</h3>
        <div>
          <label className={labelClass}>Travel ability</label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g., Can travel to major cancer centers, prefers within 2 hours"
            value={value.preferences.travelAbility}
            onChange={(e) =>
              onChange(set(value, 'preferences', { ...value.preferences, travelAbility: e.target.value }))
            }
          />
        </div>
        <div>
          <label className={labelClass}>Side effect tolerance</label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g., Willing to accept moderate side effects for potential benefit"
            value={value.preferences.sideEffectTolerance}
            onChange={(e) =>
              onChange(set(value, 'preferences', { ...value.preferences, sideEffectTolerance: e.target.value }))
            }
          />
        </div>
        <div>
          <label className={labelClass}>Quality of life priorities</label>
          <textarea
            className={textareaClass}
            placeholder="What matters most to the patient — maintaining cognitive function, staying active, minimizing hospital time, etc."
            value={value.preferences.qualityOfLifePriorities}
            onChange={(e) =>
              onChange(
                set(value, 'preferences', { ...value.preferences, qualityOfLifePriorities: e.target.value }),
              )
            }
          />
        </div>
      </div>

      {/* Care team */}
      <div className={sectionClass}>
        <h3 className="text-base font-semibold text-gray-900">Care Team</h3>
        <CareTeamList
          value={value.careTeam}
          onChange={(c) => onChange(set(value, 'careTeam', c))}
        />
      </div>

      {/* Additional notes */}
      <div className={sectionClass}>
        <h3 className="text-base font-semibold text-gray-900">Additional Notes</h3>
        <textarea
          className={textareaClass}
          placeholder="Any other relevant information — recent hospitalizations, clinical context, important conversations, etc."
          value={value.additionalNotes}
          onChange={(e) => onChange(set(value, 'additionalNotes', e.target.value))}
        />
      </div>

    </div>
  )
}
