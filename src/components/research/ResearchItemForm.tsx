import { useState } from 'react'
import { db } from '../../db/database'
import type { ResearchItem, ResearchCategory, ResearchPriority } from '../../types/research'
import { useAppStore } from '../../stores/useAppStore'
import { useResearchStore } from '../../stores/useResearchStore'

interface Props {
  onClose: () => void
  editItem?: ResearchItem
}

const categories: ResearchCategory[] = [
  'Treatment',
  'Mechanism',
  'Supportive Care',
  'Palliative',
  'Diagnostic',
  'Other',
]

const priorities: ResearchPriority[] = ['High', 'Medium', 'Low']

export function ResearchItemForm({ onClose, editItem }: Props) {
  const { addToast } = useAppStore()
  const { closeForm } = useResearchStore()

  const [question, setQuestion] = useState(editItem?.question ?? '')
  const [category, setCategory] = useState<ResearchCategory>(editItem?.category ?? 'Treatment')
  const [priority, setPriority] = useState<ResearchPriority>(editItem?.priority ?? 'Medium')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    setSaving(true)

    const now = new Date()
    try {
      if (editItem?.id) {
        await db.researchItems.update(editItem.id, { question: question.trim(), category, priority, updatedAt: now })
        addToast('Research item updated')
      } else {
        const lastItem = await db.researchItems.orderBy('sortOrder').last()
        const nextSortOrder = (lastItem?.sortOrder ?? -1) + 1
        await db.researchItems.add({
          question: question.trim(),
          category,
          priority,
          status: 'Queued',
          agentNotes: '',
          sources: [],
          advocateNotes: '',
          linkedTrialIds: [],
          linkedAnalysisIds: [],
          sortOrder: nextSortOrder,
          createdAt: now,
          updatedAt: now,
        })
        addToast('Research item added')
      }
      closeForm()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Research question <span className="text-red-500">*</span>
        </label>
        <textarea
          autoFocus
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., What targeted therapies exist for EGFR exon 19 deletions after osimertinib failure?"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          Write the question you want to research. Be specific — a focused question produces better AI results.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ResearchCategory)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as ResearchPriority)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !question.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
        >
          {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add to Queue'}
        </button>
      </div>
    </form>
  )
}
