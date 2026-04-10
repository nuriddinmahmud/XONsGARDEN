export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function toInputValue(value: string | number | undefined | null) {
  return value === undefined || value === null ? '' : String(value)
}

export function parseNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function isValidDateString(value: string) {
  if (!value) {
    return false
  }

  const parsed = new Date(value)
  return !Number.isNaN(parsed.getTime())
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}
