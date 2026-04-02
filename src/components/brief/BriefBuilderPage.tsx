import { useState, useEffect, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { callClaude, ClaudeApiError } from '../../services/claudeApi'
import { buildBriefSummaryPrompt, buildBriefQuestionsPrompt } from '../../services/promptBuilder'
import { useBriefStore } from '../../stores/useBriefStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useAppStore } from '../../stores/useAppStore'
import type { Brief, BriefOption, AppendixLink } from '../../types/brief'
import { BriefPreview } from './BriefPreview'
import { BriefVersionHistory } from './BriefVersionHistory'
import { ExportControls } from './ExportControls'
import { Modal } from '../shared/Modal'
import { ConfirmDialog } from '../shared/ConfirmDialog'

const EMPTY_BRIEF: Omit<Brief, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  advocateName: '',
  executiveSummary: '',
  options: [],
  trialsNarrative: '',
  questions: [],
  appendixLinks: [],
  includedResearchItemIds: [],
  includedTrialIds: [],
}

type EditorTab = 'edit' | 'preview'
type PendingNavigation =
  | { type: 'new' }
  | { type: 'open'; briefId: number | null }

const getTrialNarrativeLine = (title: string, nctId: string) => `• ${title} (${nctId})`

export function BriefBuilderPage() {
  const { addToast } = useAppStore()
  const { claudeApiKey, openSettings } = useSettingsStore()
  const {
    activeBriefId,
    isPreviewOpen,
    isVersionHistoryOpen,
    isGeneratingSummary,
    isGeneratingQuestions,
    setActiveBrief,
    openPreview,
    closePreview,
    openVersionHistory,
    closeVersionHistory,
    setGeneratingSummary,
    setGeneratingQuestions,
  } = useBriefStore()

  const [form, setForm] = useState<Omit<Brief, 'id' | 'createdAt' | 'updatedAt'>>(EMPTY_BRIEF)
  const [isDirty, setIsDirty] = useState(false)
  const [editorTab, setEditorTab] = useState<EditorTab>('edit')
  const [newQuestion, setNewQuestion] = useState('')
  const [newAppendixTitle, setNewAppendixTitle] = useState('')
  const [newAppendixUrl, setNewAppendixUrl] = useState('')
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null)

  const profile = useLiveQuery(() => db.patientProfiles.toCollection().first())
  const allBriefs = useLiveQuery(() => db.briefs.orderBy('updatedAt').reverse().toArray())
  const flaggedItems = useLiveQuery(() =>
    db.researchItems.where('status').anyOf(['Flagged for Doctor', 'Reviewed']).toArray()
  )
  const discussTrials = useLiveQuery(() =>
    db.trials.filter((t) => t.localStatus === 'Discuss with Doctor' || t.localStatus === 'Eligible?').toArray()
  )

  const activeBrief = useLiveQuery(
    () => activeBriefId ? db.briefs.get(activeBriefId) : undefined,
    [activeBriefId]
  )

  // Sync form when active brief changes from DB
  useEffect(() => {
    if (activeBrief) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = activeBrief
      setForm(rest)
      setIsDirty(false)
    }
  }, [activeBrief])

  const update = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: val }))
    setIsDirty(true)
  }

  const createNewBrief = async () => {
    const now = new Date()
    const newId = await db.briefs.add({
      ...EMPTY_BRIEF,
      title: 'New Brief',
      createdAt: now,
      updatedAt: now,
    })
    setActiveBrief(newId as number)
    setForm({ ...EMPTY_BRIEF, title: 'New Brief' })
    setIsDirty(false)
  }

  const navigateToBrief = (briefId: number | null) => {
    setActiveBrief(briefId)
    if (briefId === null) {
      setForm(EMPTY_BRIEF)
      setIsDirty(false)
    }
  }

  const requestNavigation = (next: PendingNavigation) => {
    if (isDirty) {
      setPendingNavigation(next)
      return
    }

    if (next.type === 'new') {
      void createNewBrief()
      return
    }

    navigateToBrief(next.briefId)
  }

  const handleDiscardChanges = () => {
    const next = pendingNavigation
    setPendingNavigation(null)

    if (!next) return

    if (next.type === 'new') {
      void createNewBrief()
      return
    }

    navigateToBrief(next.briefId)
  }

  const handleSave = useCallback(async () => {
    const now = new Date()
    if (activeBriefId) {
      await db.briefs.update(activeBriefId, { ...form, updatedAt: now })

      // Snapshot for version history
      const versionCount = await db.briefVersions.where('briefId').equals(activeBriefId).count()
      await db.briefVersions.add({
        briefId: activeBriefId,
        versionNumber: versionCount + 1,
        snapshot: { ...form, id: activeBriefId, createdAt: activeBrief?.createdAt ?? now, updatedAt: now },
        createdAt: now,
      })
    } else {
      const newId = await db.briefs.add({ ...form, createdAt: now, updatedAt: now })
      setActiveBrief(newId as number)
    }
    setIsDirty(false)
    addToast('Brief saved')
  }, [activeBriefId, form, activeBrief, addToast, setActiveBrief])

  // Ctrl+S shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && isDirty) {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave, isDirty])

  const handleRestoreVersion = (snapshot: Brief) => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = snapshot
    setForm(rest)
    setIsDirty(true)
    closeVersionHistory()
  }

  const addItemToOptions = (researchItemId: number, question: string) => {
    if (form.includedResearchItemIds.includes(researchItemId)) return
    const newOption: BriefOption = { title: question, summary: '', sourceResearchItemId: researchItemId }
    update('options', [...form.options, newOption])
    update('includedResearchItemIds', [...form.includedResearchItemIds, researchItemId])
  }

  const addTrialToNarrative = (trialId: number, title: string, nctId: string) => {
    if (form.includedTrialIds.includes(trialId)) return
    const line = `• ${title} (${nctId})`
    update('trialsNarrative', form.trialsNarrative ? `${form.trialsNarrative}\n${line}` : line)
    update('includedTrialIds', [...form.includedTrialIds, trialId])
  }

  const removeOption = (i: number) => {
    const opt = form.options[i]
    const newOptions = form.options.filter((_, idx) => idx !== i)
    const newIds = opt.sourceResearchItemId
      ? form.includedResearchItemIds.filter((id) => id !== opt.sourceResearchItemId)
      : form.includedResearchItemIds
    setForm((f) => ({ ...f, options: newOptions, includedResearchItemIds: newIds }))
    setIsDirty(true)
  }

  const removeTrial = (trialId: number) => {
    update('includedTrialIds', form.includedTrialIds.filter((id) => id !== trialId))
  }

  const handleTrialsNarrativeChange = (value: string) => {
    const selectedTrialIds = (discussTrials ?? [])
      .filter((trial) => value.includes(getTrialNarrativeLine(trial.title, trial.nctId)))
      .map((trial) => trial.id!)

    setForm((f) => ({
      ...f,
      trialsNarrative: value,
      includedTrialIds: selectedTrialIds,
    }))
    setIsDirty(true)
  }

  const addQuestion = () => {
    if (!newQuestion.trim()) return
    update('questions', [...form.questions, newQuestion.trim()])
    setNewQuestion('')
  }

  const removeQuestion = (i: number) => {
    update('questions', form.questions.filter((_, idx) => idx !== i))
  }

  const addAppendixLink = () => {
    if (!newAppendixTitle.trim()) return
    const link: AppendixLink = { title: newAppendixTitle.trim(), url: newAppendixUrl.trim() }
    update('appendixLinks', [...form.appendixLinks, link])
    setNewAppendixTitle('')
    setNewAppendixUrl('')
  }

  const removeAppendixLink = (i: number) => {
    update('appendixLinks', form.appendixLinks.filter((_, idx) => idx !== i))
  }

  const appendQuestions = (questionsToAdd: string[]) => {
    if (questionsToAdd.length === 0) return

    setForm((f) => ({
      ...f,
      questions: [...f.questions, ...questionsToAdd],
    }))
    setIsDirty(true)
  }

  const generateSummary = async () => {
    if (!claudeApiKey) { openSettings(); return }
    if (!profile) { addToast('Set up the patient profile first'); return }
    setGeneratingSummary(true)
    try {
      const prompt = buildBriefSummaryPrompt(profile, flaggedItems ?? [], discussTrials ?? [])
      const result = await callClaude(prompt, claudeApiKey)
      update('executiveSummary', result)
      addToast('Summary generated')
    } catch (err) {
      addToast(err instanceof ClaudeApiError ? err.message : 'Generation failed')
    } finally {
      setGeneratingSummary(false)
    }
  }

  const generateQuestions = async () => {
    if (!claudeApiKey) { openSettings(); return }
    if (!profile) { addToast('Set up the patient profile first'); return }
    setGeneratingQuestions(true)
    try {
      const prompt = buildBriefQuestionsPrompt(profile, flaggedItems ?? [], discussTrials ?? [])
      const result = await callClaude(prompt, claudeApiKey)
      // Parse numbered list from result
      const lines = result.split('\n').filter((l) => /^\d+[\.\)]\s/.test(l.trim()))
      const parsed = lines.map((l) => l.replace(/^\d+[\.\)]\s+/, '').trim()).filter(Boolean)
      if (parsed.length > 0) {
        appendQuestions(parsed)
        addToast(`${parsed.length} questions added`)
      } else {
        // Fallback: use raw result split by newlines
        const fallback = result.split('\n').map((l) => l.trim()).filter((l) => l.length > 10)
        appendQuestions(fallback.slice(0, 12))
        addToast('Questions added')
      }
    } catch (err) {
      addToast(err instanceof ClaudeApiError ? err.message : 'Generation failed')
    } finally {
      setGeneratingQuestions(false)
    }
  }

  const fieldClass = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'

  const hasNoBrief = !activeBriefId && !activeBrief

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Doctor Brief Builder</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Compile your research into a professional summary to share with the medical team.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeBriefId && (
              <>
                <button
                  type="button"
                  onClick={openVersionHistory}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Version history
                </button>
                <button
                  type="button"
                  onClick={openPreview}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Preview & Export
                </button>
              </>
            )}
            {isDirty && (
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Save
              </button>
            )}
            <button
              type="button"
              onClick={() => requestNavigation({ type: 'new' })}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
            >
              + New Brief
            </button>
          </div>
        </div>

        {/* Brief selector */}
        {allBriefs && allBriefs.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <label className="text-xs text-gray-500 shrink-0">Open brief:</label>
            <select
              aria-label="Open brief"
              value={activeBriefId ?? ''}
              onChange={(e) => requestNavigation({ type: 'open', briefId: e.target.value ? Number(e.target.value) : null })}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— select —</option>
              {allBriefs.map((b) => (
                <option key={b.id} value={b.id}>{b.title || 'Untitled Brief'}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Empty state */}
      {hasNoBrief ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
          <svg className="w-14 h-14 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-base font-semibold text-gray-600 mb-1">No brief yet</p>
          <p className="text-sm text-gray-400 mb-4">Create a new brief to start compiling your research for the medical team.</p>
          <button
            type="button"
            onClick={() => requestNavigation({ type: 'new' })}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Create New Brief
          </button>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Source panel */}
          <div className="w-72 shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 bg-white shrink-0">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Add to Brief</p>
              <p className="text-xs text-gray-400 mt-0.5">Click items below to add them to the editor</p>
            </div>

            <div className="p-3 space-y-4 flex-1 overflow-y-auto">
              {/* Research items */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Research Items ({flaggedItems?.length ?? 0})
                </p>
                {!flaggedItems || flaggedItems.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No flagged or reviewed research items yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {flaggedItems.map((item) => {
                      const isAdded = form.includedResearchItemIds.includes(item.id!)
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => !isAdded && addItemToOptions(item.id!, item.question)}
                          disabled={isAdded}
                          className={`w-full text-left p-2 rounded-md border text-xs transition-all ${
                            isAdded
                              ? 'border-green-200 bg-green-50 text-green-700 cursor-default'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            {isAdded ? (
                              <svg className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            )}
                            <span className="leading-snug line-clamp-3">{item.question}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Trials */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Saved Trials ({discussTrials?.length ?? 0})
                </p>
                {!discussTrials || discussTrials.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No trials marked "Discuss with Doctor" yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {discussTrials.map((trial) => {
                      const isAdded = form.includedTrialIds.includes(trial.id!)
                      return (
                        <button
                          key={trial.id}
                          type="button"
                          onClick={() => !isAdded && addTrialToNarrative(trial.id!, trial.title, trial.nctId)}
                          disabled={isAdded}
                          className={`w-full text-left p-2 rounded-md border text-xs transition-all ${
                            isAdded
                              ? 'border-green-200 bg-green-50 text-green-700 cursor-default'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            {isAdded ? (
                              <svg className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            )}
                            <div className="min-w-0">
                              <p className="leading-snug line-clamp-2 font-medium">{trial.title}</p>
                              <p className="text-gray-400 font-mono mt-0.5">{trial.nctId}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editor panel */}
          <div className="flex-1 overflow-y-auto">
            {/* Edit / Preview tabs */}
            <div className="flex border-b border-gray-200 bg-white px-6 sticky top-0 z-10">
              {(['edit', 'preview'] as EditorTab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEditorTab(t)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    editorTab === t
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t === 'edit' ? 'Edit' : 'Preview'}
                </button>
              ))}
            </div>

            {editorTab === 'edit' ? (
              <div className="px-6 py-5 space-y-6 max-w-3xl">
                {/* Title + metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brief title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => update('title', e.target.value)}
                      placeholder="e.g., Treatment Options Brief — April 2025"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prepared by</label>
                    <input
                      type="text"
                      value={form.advocateName}
                      onChange={(e) => update('advocateName', e.target.value)}
                      placeholder="Your name"
                      className={fieldClass}
                    />
                  </div>
                </div>

                {/* Executive Summary */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">Executive Summary</label>
                    <button
                      type="button"
                      onClick={generateSummary}
                      disabled={isGeneratingSummary || !claudeApiKey}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      {isGeneratingSummary ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                      {isGeneratingSummary ? 'Generating…' : 'Generate with AI'}
                    </button>
                  </div>
                  <textarea
                    value={form.executiveSummary}
                    onChange={(e) => update('executiveSummary', e.target.value)}
                    placeholder="Write a summary of the patient's situation and the options explored, or use the AI button to generate one…"
                    className={`${fieldClass} resize-y min-h-32`}
                  />
                </div>

                {/* Treatment Options */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Treatment Options ({form.options.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => update('options', [...form.options, { title: '', summary: '' }])}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      + Add option manually
                    </button>
                  </div>
                  {form.options.length === 0 && (
                    <p className="text-xs text-gray-400 italic mb-2">
                      Click research items in the left panel to add them as options, or add manually above.
                    </p>
                  )}
                  <div className="space-y-3">
                    {form.options.map((opt, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt.title}
                            onChange={(e) => {
                              const newOpts = [...form.options]
                              newOpts[i] = { ...opt, title: e.target.value }
                              update('options', newOpts)
                            }}
                            placeholder="Option title"
                            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                          <button type="button" aria-label="Remove option" onClick={() => removeOption(i)} className="text-gray-300 hover:text-red-400 p-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <textarea
                          value={opt.summary}
                          onChange={(e) => {
                            const newOpts = [...form.options]
                            newOpts[i] = { ...opt, summary: e.target.value }
                            update('options', newOpts)
                          }}
                          placeholder="Brief summary of this option, mechanism, evidence, and considerations…"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-16"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clinical Trials */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">Clinical Trials</label>
                    {form.includedTrialIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          form.includedTrialIds.forEach((id) => removeTrial(id))
                          update('trialsNarrative', '')
                          update('includedTrialIds', [])
                        }}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <textarea
                    value={form.trialsNarrative}
                    onChange={(e) => handleTrialsNarrativeChange(e.target.value)}
                    placeholder="Click trials in the left panel to add them here, or write a narrative about relevant trials…"
                    className={`${fieldClass} resize-y min-h-24`}
                  />
                </div>

                {/* Questions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Questions for the Doctor ({form.questions.filter((q) => q.trim()).length})
                    </label>
                    <button
                      type="button"
                      onClick={generateQuestions}
                      disabled={isGeneratingQuestions || !claudeApiKey}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      {isGeneratingQuestions ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                      {isGeneratingQuestions ? 'Generating…' : 'Generate with AI'}
                    </button>
                  </div>
                  <div className="space-y-2 mb-3">
                    {form.questions.map((q, i) => (
                      q.trim() ? (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-xs text-gray-400 font-medium mt-2 w-5 text-right shrink-0">{i + 1}.</span>
                          <input
                            type="text"
                            aria-label={`Question ${i + 1}`}
                            value={q}
                            onChange={(e) => {
                              const newQs = [...form.questions]
                              newQs[i] = e.target.value
                              update('questions', newQs)
                            }}
                            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button type="button" aria-label="Remove question" onClick={() => removeQuestion(i)} className="text-gray-300 hover:text-red-400 mt-1.5 p-0.5 shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : null
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
                      placeholder="Type a question and press Enter…"
                      className={`${fieldClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={addQuestion}
                      disabled={!newQuestion.trim()}
                      className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Appendix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appendix / References</label>
                  {form.appendixLinks.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {form.appendixLinks.map((link, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{link.title}</p>
                            {link.url && <p className="text-xs text-blue-600 truncate">{link.url}</p>}
                          </div>
                          <button type="button" aria-label="Remove reference" onClick={() => removeAppendixLink(i)} className="text-gray-300 hover:text-red-400 shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Title or description"
                      value={newAppendixTitle}
                      onChange={(e) => setNewAppendixTitle(e.target.value)}
                      className={`${fieldClass} flex-1`}
                    />
                    <input
                      type="text"
                      placeholder="URL (optional)"
                      value={newAppendixUrl}
                      onChange={(e) => setNewAppendixUrl(e.target.value)}
                      className="w-48 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addAppendixLink}
                      disabled={!newAppendixTitle.trim()}
                      className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Preview tab */
              <div className="px-4 py-4">
                <div className="flex justify-end mb-4">
                  <ExportControls brief={{ ...form, id: activeBriefId ?? undefined, createdAt: activeBrief?.createdAt ?? new Date(), updatedAt: new Date() }} />
                </div>
                <BriefPreview
                  brief={{ ...form, id: activeBriefId ?? undefined, createdAt: activeBrief?.createdAt ?? new Date(), updatedAt: new Date() }}
                  patientInitials={profile?.initials ?? ''}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview modal */}
      <Modal isOpen={isPreviewOpen} onClose={closePreview} title="Preview & Export" size="xl">
        <div className="-m-6">
          <div className="flex justify-end px-6 py-3 border-b border-gray-200">
            <ExportControls brief={{ ...form, id: activeBriefId ?? undefined, createdAt: activeBrief?.createdAt ?? new Date(), updatedAt: new Date() }} />
          </div>
          <div className="overflow-y-auto max-h-[80vh]">
            <BriefPreview
              brief={{ ...form, id: activeBriefId ?? undefined, createdAt: activeBrief?.createdAt ?? new Date(), updatedAt: new Date() }}
              patientInitials={profile?.initials ?? ''}
            />
          </div>
        </div>
      </Modal>

      {/* Version history modal */}
      <Modal isOpen={isVersionHistoryOpen} onClose={closeVersionHistory} title="Version History" size="md">
        {activeBriefId && (
          <BriefVersionHistory briefId={activeBriefId} onRestore={handleRestoreVersion} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={pendingNavigation !== null}
        onClose={() => setPendingNavigation(null)}
        onConfirm={handleDiscardChanges}
        title="Discard unsaved changes?"
        message="You have unsaved edits in this brief. Continuing will discard them and open a different brief."
        confirmLabel="Discard changes"
        confirmVariant="danger"
      />
    </div>
  )
}
