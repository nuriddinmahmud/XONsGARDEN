import { STORAGE_KEYS } from '../constants/storageKeys'
import type { IncomeRecord } from '../types/income'
import { readStorage, writeStorage } from './localStorage'

function normalizeOptionalText(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed || undefined
}

function isIncomeRecord(value: unknown): value is IncomeRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.id === 'string' &&
    typeof record.amount === 'number' &&
    Number.isFinite(record.amount) &&
    typeof record.reason === 'string' &&
    typeof record.date === 'string' &&
    (record.sourceLocation === undefined || typeof record.sourceLocation === 'string') &&
    (record.comment === undefined || typeof record.comment === 'string') &&
    (record.createdAt === undefined || typeof record.createdAt === 'string')
  )
}

function normalizeIncomeRecord(record: IncomeRecord): IncomeRecord {
  return {
    ...record,
    reason: record.reason.trim(),
    sourceLocation: normalizeOptionalText(record.sourceLocation),
    comment: normalizeOptionalText(record.comment),
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : undefined,
  }
}

export function readIncomeRecords() {
  const stored = readStorage<unknown[]>(STORAGE_KEYS.xonsgarden_income, [])

  return stored.filter(isIncomeRecord).map(normalizeIncomeRecord)
}

export function writeIncomeRecords(records: IncomeRecord[]) {
  writeStorage(STORAGE_KEYS.xonsgarden_income, records.map(normalizeIncomeRecord))
}
