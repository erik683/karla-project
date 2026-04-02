import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { searchStudies } from '../../services/clinicalTrialsApi'
import { useTrialsStore } from '../../stores/useTrialsStore'
import { useAppStore } from '../../stores/useAppStore'
import type { ClinicalTrialSearchResult, TrialSearchParams } from '../../types/trials'
import { TrialSearchForm } from './TrialSearchForm'
import { TrialCard } from './TrialCard'
import { TrialDetailModal } from './TrialDetailModal'
import { SavedSearchesList } from './SavedSearchesList'
import { WatchedTrialsList } from './WatchedTrialsList'
import { Modal } from '../shared/Modal'

type SideTab = 'saved-searches' | 'watched' | 'saved-trials'

export function TrialFinderPage() {
  const { addToast } = useAppStore()
  const {
    searchResults,
    isSearching,
    searchError,
    selectedTrialNctId,
    isDetailOpen,
    nextPageToken,
    setSearchResults,
    appendSearchResults,
    setSearching,
    setSearchError,
    setParams,
    openDetail,
    closeDetail,
  } = useTrialsStore()

  const [sideTab, setSideTab] = useState<SideTab>('saved-searches')
  const [hasSearched, setHasSearched] = useState(false)
  const [lastSearchParams, setLastSearchParams] = useState<TrialSearchParams | null>(null)
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false)
  const [saveSearchName, setSaveSearchName] = useState('')

  const savedTrials = useLiveQuery(() => db.trials.orderBy('savedAt').reverse().toArray())
  const savedDetailTrial = selectedTrialNctId
    ? savedTrials?.find((t) => t.nctId === selectedTrialNctId) ?? null
    : null

  const runSearch = async (params: TrialSearchParams, pageToken?: string) => {
    setSearching(true)
    setSearchError(null)
    setLastSearchParams(params)
    if (!pageToken) setHasSearched(true)

    try {
      const resp = await searchStudies(params, pageToken)
      if (pageToken) {
        appendSearchResults(resp.results, resp.nextPageToken)
      } else {
        setSearchResults(resp.results, resp.nextPageToken)
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handleRunSearch = (params: TrialSearchParams) => {
    setParams(params)
    runSearch(params)
  }

  const handleLoadMore = () => {
    if (!nextPageToken || !lastSearchParams) return
    runSearch(lastSearchParams, nextPageToken)
  }

  const handleSaveSearch = async () => {
    if (!lastSearchParams || !saveSearchName.trim()) return
    await db.savedSearches.add({
      name: saveSearchName.trim(),
      params: lastSearchParams,
      createdAt: new Date(),
    })
    addToast('Search saved')
    setShowSaveSearchModal(false)
    setSaveSearchName('')
  }

  const exportCsv = () => {
    if (searchResults.length === 0) return
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`
    const rows = [
      ['NCT ID', 'Title', 'Phase', 'Status', 'Conditions', 'Interventions', 'Locations'],
      ...searchResults.map((t: ClinicalTrialSearchResult) => [
        t.nctId,
        escapeCsv(t.title),
        escapeCsv(t.phase),
        t.overallStatus,
        escapeCsv(t.conditions.join('; ')),
        escapeCsv(t.interventionSummary),
        escapeCsv(t.locations.map((l) => `${l.city}, ${l.state} ${l.country}`.trim()).join('; ')),
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clinical-trials.csv'
    a.click()
    URL.revokeObjectURL(url)
    addToast('CSV downloaded')
  }

  // Resolve detail trial from search results or saved trials
  const detailTrial: ClinicalTrialSearchResult | null = selectedTrialNctId
    ? ((savedDetailTrial as ClinicalTrialSearchResult | null) ??
       searchResults.find((r) => r.nctId === selectedTrialNctId) ??
       null)
    : null

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <div className="mb-3">
          <h2 className="text-xl font-bold text-gray-900">Clinical Trials Finder</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Search ClinicalTrials.gov in real time. Save trials to track eligibility and discuss with your doctor.
          </p>
        </div>
        <TrialSearchForm onSearch={handleRunSearch} isSearching={isSearching} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Results panel */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Results header */}
          {hasSearched && !isSearching && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">
                {searchResults.length === 0
                  ? 'No results found. Try broadening your search terms.'
                  : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}${nextPageToken ? '+' : ''}`}
              </p>
              {searchResults.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveSearchModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Save search
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={exportCsv}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Export CSV
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {searchError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4 mb-4">
              <strong>Search error: </strong>{searchError}
              <p className="text-xs mt-1 text-red-500">ClinicalTrials.gov may be temporarily unavailable. Try again in a moment.</p>
            </div>
          )}

          {/* Loading skeleton */}
          {isSearching && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!isSearching && searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((trial) => (
                <TrialCard key={trial.nctId} trial={trial} onOpen={openDetail} />
              ))}
              {nextPageToken && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="w-full py-2.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  Load more results
                </button>
              )}
            </div>
          )}

          {/* Empty state before first search */}
          {!hasSearched && !isSearching && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm text-gray-500 font-medium">Enter a condition above to search ClinicalTrials.gov</p>
              <p className="text-xs text-gray-400 mt-1">The condition field will pre-fill from your patient profile if you've set one up.</p>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="w-80 shrink-0 border-l border-gray-200 bg-gray-50 overflow-y-auto flex flex-col">
          {/* Side panel tabs */}
          <div className="flex border-b border-gray-200 bg-white shrink-0">
            {([
              { key: 'saved-searches', label: 'Searches' },
              { key: 'watched', label: 'Watching' },
              { key: 'saved-trials', label: 'Saved' },
            ] as { key: SideTab; label: string }[]).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setSideTab(t.key)}
                className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  sideTab === t.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-3 flex-1 overflow-y-auto">
            {sideTab === 'saved-searches' && (
              <SavedSearchesList onRunSearch={handleRunSearch} />
            )}

            {sideTab === 'watched' && (
              <WatchedTrialsList onOpenTrial={openDetail} />
            )}

            {sideTab === 'saved-trials' && (
              <div className="space-y-2">
                {!savedTrials || savedTrials.length === 0 ? (
                  <p className="text-xs text-gray-400 italic px-1">No trials saved yet. Click a trial in the search results and click "Save Trial".</p>
                ) : (
                  savedTrials.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white border border-gray-200 rounded-md p-2.5 cursor-pointer hover:shadow-sm transition-shadow"
                      onClick={() => openDetail(t.nctId)}
                    >
                      <p className="text-xs font-medium text-gray-800 leading-snug mb-1">{t.title}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-blue-600">{t.nctId}</span>
                        <span className="text-xs text-gray-400">{t.localStatus}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      <Modal
        isOpen={isDetailOpen && !!detailTrial}
        onClose={closeDetail}
        title="Trial Details"
        size="xl"
      >
        {detailTrial && <TrialDetailModal trial={detailTrial} onClose={closeDetail} />}
      </Modal>

      {/* Save search modal */}
      <Modal
        isOpen={showSaveSearchModal}
        onClose={() => setShowSaveSearchModal(false)}
        title="Save Search"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Give this search a name so you can re-run it later.</p>
          <input
            type="text"
            placeholder="e.g., ATC Phase 2 Recruiting"
            value={saveSearchName}
            onChange={(e) => setSaveSearchName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()}
            autoFocus
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowSaveSearchModal(false)}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSearch}
              disabled={!saveSearchName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
