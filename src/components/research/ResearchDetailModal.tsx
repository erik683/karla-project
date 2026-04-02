import { useState, useEffect } from 'react'
import { db } from '../../db/database'
import type { ResearchItem, ResearchCategory, ResearchPriority, ResearchStatus, ResearchSource } from '../../types/research'
import { useAppStore } from '../../stores/useAppStore'
import { StatusBadge } from '../shared/StatusBadge'
import { PriorityBadge } from '../shared/PriorityBadge'
import { PromptGeneratorPanel } from './PromptGeneratorPanel'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { formatDateTime } from '../../utils/formatters'

const STATUSES: ResearchStatus[] = ['Queued', 'In Progress', 'Reviewed', 'Dismissed', 'Flagged for Doctor']
const CATEGORIES: ResearchCategory[] = ['Treatment', 'Mechanism', 'Supportive Care', 'Palliative', 'Diagnostic', 'Other']
const PRIORITIES: ResearchPriority[] = ['High', 'Medium', 'Low']

interface Props {
  item: ResearchItem
  onClose: () => void
}

type Tab = 'details' | 'prompt'

export function ResearchDetailModal({ item, onClose }: Props) {
  const { addToast } = useAppStore()
  const [tab, setTab] = useState<Tab>('details')
  const [form, setForm] = useState<ResearchItem>(item)
  const [isDirty, setIsDirty] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newSourceTitle, setNewSourceTitle] = useState('')
  const [newSourceUrl, setNewSourceUrl] = useState('')
  const [newSourceType, setNewSourceType] = useState('')

  useEffect(() => { setForm(item); setIsDirty(false) }, [item])

  const update = <K extends keyof ResearchItem>(key: K, val: ResearchItem[K]) => {
    setForm((f) => ({ ...f, [key]: val }))
    setIsDirty(true)
  }

  const handleSave = async () => {
    if (!form.id) return
    await db.researchItems.update(form.id, { ...form, updatedAt: new Date() })
    setIsDirty(false)
    addToast('Saved')
  }

  const handleDelete = async () => {
    if (!item.id) return
    await db.researchItems.delete(item.id)
    addToast('Item deleted')
    onClose()
  }

  const addSource = () => {
    if (!newSourceTitle.trim()) return
    const src: ResearchSource = {
      title: newSourceTitle.trim(),
      url: newSourceUrl.trim(),
      type: newSourceType.trim() || 'Reference',
    }
    update('sources', [...form.sources, src])
    setNewSourceTitle('')
    setNewSourceUrl('')
    setNewSourceType('')
  }

  const removeSource = (i: number) => {
    update('sources', form.sources.filter((_, idx) => idx !== i))
  }

  const fieldClass = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-gray-200">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-1">
              Added {formatDateTime(item.createdAt)} · Last updated {formatDateTime(item.updatedAt)}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={form.status} />
              <PriorityBadge priority={form.priority} />
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">
                {form.category}
              </span>
            </div>
          </div>
          {isDirty && (
            <button
              type="button"
              onClick={handleSave}
              className="shrink-0 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Save
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mt-3 border-b border-transparent -mb-px">
          {(['details', 'prompt'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'details' ? 'Details' : 'Generate AI Prompt'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {tab === 'details' ? (
          <div className="space-y-5">
            {/* Question */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Research question</label>
              <textarea
                value={form.question}
                onChange={(e) => update('question', e.target.value)}
                className={`${fieldClass} resize-y min-h-[70px]`}
              />
            </div>

            {/* Status / Category / Priority row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => update('status', e.target.value as ResearchStatus)}
                  className={fieldClass}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value as ResearchCategory)}
                  className={fieldClass}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => update('priority', e.target.value as ResearchPriority)}
                  className={fieldClass}
                >
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* AI / Research Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Research notes
                <span className="ml-1 text-xs text-gray-400 font-normal">
                  (paste AI responses and summaries here)
                </span>
              </label>
              <textarea
                value={form.agentNotes}
                onChange={(e) => update('agentNotes', e.target.value)}
                placeholder="Paste findings, AI responses, and notes from your research here…"
                className={`${fieldClass} resize-y min-h-[120px]`}
              />
            </div>

            {/* Sources */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sources</label>
              {form.sources.length === 0 && (
                <p className="text-sm text-gray-400 italic mb-2">No sources added yet.</p>
              )}
              <div className="space-y-2 mb-3">
                {form.sources.map((src, i) => (
                  <div key={i} className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-md p-2 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{src.title}</p>
                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate block"
                        >
                          {src.url}
                        </a>
                      )}
                      {src.type && <p className="text-xs text-gray-400">{src.type}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSource(i)}
                      className="text-red-400 hover:text-red-600 p-0.5 shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              {/* Add source inline */}
              <div className="border border-dashed border-gray-300 rounded-md p-3 space-y-2">
                <p className="text-xs text-gray-500 font-medium">Add source</p>
                <input
                  type="text"
                  placeholder="Title or description"
                  value={newSourceTitle}
                  onChange={(e) => setNewSourceTitle(e.target.value)}
                  className={fieldClass}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL (optional)"
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                    className={`${fieldClass} flex-1`}
                  />
                  <input
                    type="text"
                    placeholder="Type (e.g., Study)"
                    value={newSourceType}
                    onChange={(e) => setNewSourceType(e.target.value)}
                    className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addSource}
                    disabled={!newSourceTitle.trim()}
                    className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Advocate notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                My notes
                <span className="ml-1 text-xs text-gray-400 font-normal">(your own observations and follow-ups)</span>
              </label>
              <textarea
                value={form.advocateNotes}
                onChange={(e) => update('advocateNotes', e.target.value)}
                placeholder="Your personal notes, follow-up questions, context from conversations…"
                className={`${fieldClass} resize-y min-h-[80px]`}
              />
            </div>
          </div>
        ) : (
          <PromptGeneratorPanel item={form} />
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Delete item
        </button>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Close
          </button>
          {isDirty && (
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete research item"
        message="Are you sure you want to delete this item? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
