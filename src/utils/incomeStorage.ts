import type { IncomeRecord } from '../types/income'
import {
  deleteIncomeRecord as deleteIncomeDatabaseRecord,
  readIncomeRecords as readIncomeDatabaseRecords,
  saveIncomeRecord as saveIncomeDatabaseRecord,
  writeIncomeRecords as writeIncomeDatabaseRecords,
} from '../lib/database'
import { STORAGE_KEYS, STORAGE_SYNC_EVENT } from '../constants/storageKeys'

function emitStorageSync() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(STORAGE_SYNC_EVENT, { detail: { key: STORAGE_KEYS.xonsgarden_income } }),
  )
}

export async function readIncomeRecords() {
  return readIncomeDatabaseRecords()
}

export async function writeIncomeRecords(records: IncomeRecord[]) {
  const value = await writeIncomeDatabaseRecords(records)
  emitStorageSync()
  return value
}

export async function saveIncomeRecord(record: IncomeRecord) {
  const value = await saveIncomeDatabaseRecord(record)
  emitStorageSync()
  return value
}

export async function deleteIncomeRecord(id: string) {
  await deleteIncomeDatabaseRecord(id)
  emitStorageSync()
}
