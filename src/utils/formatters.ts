import { format, parseISO } from 'date-fns'

export function formatDate(date: Date | string | undefined): string {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

export function formatDateTime(date: Date | undefined): string {
  if (!date) return '—'
  try {
    return format(date, 'MMM d, yyyy h:mm a')
  } catch {
    return '—'
  }
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}
