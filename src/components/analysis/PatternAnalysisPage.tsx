import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { callClaude, ClaudeApiError } from '../../services/claudeApi'
import { buildAnalysisPrompt } from '../../services/promptBuilder'
import { useAnalysisStore } from '../../stores/useAnalysisStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useAppStore } from '../../stores/useAppStore'
import type { AnalysisEntry, AnalysisType } from '../../types/analysis'
import { AnalysisTypeSelector } from './AnalysisTypeSelector'
import { AnalysisPromptPreview } from './AnalysisPromptPreview'
import { AnalysisResultView } from './AnalysisResultView'
import { AnalysisHistoryList } from './AnalysisHistoryList'

export function PatternAnalysisPage() {
  const { addToast, setActiveModule } = useAppStore()
  const { claudeApiKey, openSettings } = useSettingsStore()
  const {
    selectedType,
    customQuery,
    isRunning,
    streamingResult,
    selectedHistoryId,
    setType,
    setCustomQuery,
    setRunning,
    appendStreamChunk,
    clearStreamingResult,
    selectHistory,
  } = useAnalysisStore()

  const [editedPrompt, setEditedPrompt] = useState('')
  const [displayResult, setDisplayResult] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const profile = useLiveQuery(() => db.patientProfiles.toCollection().first())
  const flaggedItems = useLiveQuery(() =>
    db.researchItems
      .where('status')
      .anyOf(['Flagged for Doctor', 'Reviewed'])
      .toArray()
  )
  const savedTrials = useLiveQuery(() =>
    db.trials
      .filter((t) => t.localStatus === 'Discuss with Doctor' || t.localStatus === 'Eligible?')
      .toArray()
  )

  // Rebuild prompt whenever type / custom query / data changes
  useEffect(() => {
    if (!profile || selectedHistoryId !== null) return
    const prompt = buildAnalysisPrompt(
      profile,
      flaggedItems ?? [],
      savedTrials ?? [],
      selectedType,
      selectedType === 'Custom Query' ? customQuery : undefined,
    )
    setEditedPrompt(prompt)
  }, [profile, flaggedItems, savedTrials, selectedType, customQuery, selectedHistoryId])

  const handleRun = async () => {
    if (!claudeApiKey) {
      openSettings()
      addToast('Please add your Claude API key in Settings first')
      return
    }
    if (!profile) {
      addToast('Please set up a patient profile first')
      setActiveModule('patient')
      return
    }
    if (selectedType === 'Custom Query' && !customQuery.trim()) {
      addToast('Please enter your custom query')
      return
    }

    setRunning(true)
    clearStreamingResult()
    setDisplayResult('')
    setErrorMsg(null)
    selectHistory(null)

    try {
      let fullResult = ''
      await callClaude(editedPrompt, claudeApiKey, (chunk) => {
        fullResult += chunk
        appendStreamChunk(chunk)
        setDisplayResult((prev) => prev + chunk)
      })

      // Save to history
      await db.analyses.add({
        type: selectedType,
        customQuery: selectedType === 'Custom Query' ? customQuery : '',
        promptUsed: editedPrompt,
        result: fullResult,
        informingResearchItemIds: (flaggedItems ?? []).map((i) => i.id!).filter(Boolean),
        informingTrialIds: (savedTrials ?? []).map((t) => t.id!).filter(Boolean),
        createdAt: new Date(),
      })

      addToast('Analysis complete')
    } catch (err) {
      const msg = err instanceof ClaudeApiError ? err.message : 'Analysis failed — please try again'
      setErrorMsg(msg)
      addToast(msg)
    } finally {
      setRunning(false)
    }
  }

  const handleSelectHistory = (entry: AnalysisEntry) => {
    selectHistory(entry.id ?? null)
    setType(entry.type)
    setCustomQuery(entry.customQuery)
    setDisplayResult(entry.result)
    setEditedPrompt(entry.promptUsed)
    setErrorMsg(null)
    clearStreamingResult()
  }

  const hasData = (flaggedItems?.length ?? 0) > 0 || (savedTrials?.length ?? 0) > 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <h2 className="text-xl font-bold text-gray-900">Pattern Analysis</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Run AI-powered analysis across your gathered research items and saved trials. Requires a Claude API key.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main panel */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* No API key warning */}
          {!claudeApiKey && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <strong>Claude API key required.</strong>{' '}
              <button type="button" onClick={openSettings} className="underline hover:text-amber-900">
                Open Settings
              </button>{' '}
              to add your API key. You can get one at anthropic.com/api.
            </div>
          )}

          {/* No profile warning */}
          {!profile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>No patient profile yet.</strong>{' '}
              <button
                type="button"
                onClick={() => setActiveModule('patient')}
                className="underline hover:text-blue-900"
              >
                Set up the patient profile
              </button>{' '}
              first — it's included in every analysis to provide relevant context.
            </div>
          )}

          {/* Data context notice */}
          {profile && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-700">Data included in this analysis:</p>
              <p>
                <span className={`font-medium ${(flaggedItems?.length ?? 0) > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                  {flaggedItems?.length ?? 0} research items
                </span>
                {' '}(Flagged for Doctor + Reviewed){' '}
                <span className="text-gray-300">·</span>{' '}
                <span className={`font-medium ${(savedTrials?.length ?? 0) > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                  {savedTrials?.length ?? 0} trials
                </span>
                {' '}(Discuss with Doctor + Eligible?)
              </p>
              {!hasData && (
                <p className="text-amber-600 mt-1">
                  Tip: Flag research items in the Research Queue and mark trials as "Discuss with Doctor" to include them here.
                </p>
              )}
            </div>
          )}

          {/* Analysis type selector */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Choose analysis type</p>
            <AnalysisTypeSelector selected={selectedType} onSelect={(t: AnalysisType) => { setType(t); selectHistory(null); setDisplayResult('') }} />
          </div>

          {/* Custom query input */}
          {selectedType === 'Custom Query' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your question or analysis request</label>
              <textarea
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="e.g., Are there any treatments that specifically target BRAF V600E mutations in anaplastic thyroid cancer that haven't been tried yet?"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-20"
              />
            </div>
          )}

          {/* Prompt preview toggle */}
          {profile && (
            <div>
              <button
                type="button"
                onClick={() => setShowPrompt((v) => !v)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <svg className={`w-3.5 h-3.5 transition-transform ${showPrompt ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {showPrompt ? 'Hide prompt' : 'Preview / edit prompt before running'}
              </button>
              {showPrompt && (
                <div className="mt-3">
                  <AnalysisPromptPreview prompt={editedPrompt} onPromptChange={setEditedPrompt} />
                </div>
              )}
            </div>
          )}

          {/* Run button */}
          <div>
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning || !profile || !claudeApiKey}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Run Analysis
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
              <strong>Error: </strong>{errorMsg}
            </div>
          )}

          {/* Result */}
          <AnalysisResultView
            result={isRunning ? streamingResult : displayResult}
            isStreaming={isRunning}
          />
        </div>

        {/* History sidebar */}
        <div className="w-72 shrink-0 border-l border-gray-200 bg-gray-50 overflow-y-auto flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 bg-white shrink-0">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Analysis History</p>
          </div>
          <div className="p-3 flex-1 overflow-y-auto">
            <AnalysisHistoryList onSelectEntry={handleSelectHistory} disabled={isRunning} />
          </div>
        </div>
      </div>
    </div>
  )
}
