import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import type {
  ResearchCategory,
  ResearchItem,
  ResearchPriority,
  ResearchStatus,
} from '../../types/research'
import { KanbanColumn } from './KanbanColumn'
import { ResearchCard } from './ResearchCard'

const COLUMNS: ResearchStatus[] = [
  'Queued',
  'In Progress',
  'Reviewed',
  'Dismissed',
  'Flagged for Doctor',
]

interface Props {
  onOpenItem: (id: number) => void
  filterPriority?: ResearchPriority | ''
  filterCategory?: ResearchCategory | ''
}

export function KanbanBoard({
  onOpenItem,
  filterPriority = '',
  filterCategory = '',
}: Props) {
  const [activeItem, setActiveItem] = useState<ResearchItem | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // 8px drag before activating — prevents accidental drags
    }),
  )

  const allItems = useLiveQuery(() =>
    db.researchItems.orderBy('sortOrder').toArray()
  )

  const visibleItems = useMemo(
    () =>
      (allItems ?? []).filter((item) => {
        if (filterPriority && item.priority !== filterPriority) return false
        if (filterCategory && item.category !== filterCategory) return false
        return true
      }),
    [allItems, filterPriority, filterCategory],
  )

  const itemsByStatus = useCallback(
    (status: ResearchStatus) =>
      visibleItems.filter((i) => i.status === status),
    [visibleItems],
  )

  const handleDragStart = (event: DragStartEvent) => {
    const item = allItems?.find((i) => i.id === event.active.id)
    setActiveItem(item ?? null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveItem(null)
    const { active, over } = event
    if (!over) return

    const draggedId = active.id as number
    const overId = over.id

    // overId is either a ResearchStatus (column drop) or another item id (card drop)
    const isColumnDrop = COLUMNS.includes(overId as ResearchStatus)

    if (isColumnDrop) {
      const newStatus = overId as ResearchStatus
      const currentItem = allItems?.find((i) => i.id === draggedId)
      if (currentItem && currentItem.status !== newStatus) {
        await db.researchItems.update(draggedId, { status: newStatus, updatedAt: new Date() })
      }
    } else {
      // Dropped onto another card — move to that card's column
      const targetItem = allItems?.find((i) => i.id === overId)
      if (!targetItem) return
      const currentItem = allItems?.find((i) => i.id === draggedId)
      if (!currentItem) return
      if (currentItem.status !== targetItem.status) {
        await db.researchItems.update(draggedId, {
          status: targetItem.status,
          updatedAt: new Date(),
        })
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-full">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            items={itemsByStatus(status)}
            onOpenItem={onOpenItem}
          />
        ))}
      </div>

      {/* Ghost card shown while dragging */}
      <DragOverlay>
        {activeItem ? (
          <div className="rotate-2 shadow-xl opacity-90">
            <ResearchCard item={activeItem} onOpen={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
