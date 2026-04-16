import { STORAGE_KEYS } from '../constants/storageKeys'
import type { DebtRecord, DebtStatus } from '../types/debt'
import { readStorage, writeStorage } from './localStorage'

function isDebtStatus(value: unknown): value is DebtStatus {
  return value === "to'lanmagan" || value === "qisman to'langan" || value === "to'langan"
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed || undefined
}

function isDebtRecord(value: unknown): value is DebtRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.id === 'string' &&
    typeof record.personOrCompany === 'string' &&
    typeof record.category === 'string' &&
    typeof record.reason === 'string' &&
    typeof record.amount === 'number' &&
    Number.isFinite(record.amount) &&
    typeof record.date === 'string' &&
    typeof record.dueDate === 'string' &&
    isDebtStatus(record.status) &&
    (record.phone === undefined || typeof record.phone === 'string') &&
    (record.note === undefined || typeof record.note === 'string')
  )
}

function normalizeDebtRecord(record: DebtRecord): DebtRecord {
  return {
    ...record,
    personOrCompany: record.personOrCompany.trim(),
    category: record.category.trim(),
    reason: record.reason.trim(),
    dueDate: record.dueDate.trim(),
    phone: normalizeOptionalText(record.phone),
    note: normalizeOptionalText(record.note),
  }
}

export function readDebts() {
  const stored = readStorage<unknown[]>(STORAGE_KEYS.xonsgarden_debts, [])

  return stored.filter(isDebtRecord).map(normalizeDebtRecord)
}

export function writeDebts(records: DebtRecord[]) {
  writeStorage(STORAGE_KEYS.xonsgarden_debts, records.map(normalizeDebtRecord))
}
