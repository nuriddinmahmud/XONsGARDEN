import type { DebtRecord } from '../types/debt'
import {
  deleteDebtRecord as deleteDebtDatabaseRecord,
  readDebts as readDebtDatabaseRecords,
  saveDebtRecord as saveDebtDatabaseRecord,
  writeDebts as writeDebtDatabaseRecords,
} from '../lib/database'
import { STORAGE_KEYS, STORAGE_SYNC_EVENT } from '../constants/storageKeys'

function emitStorageSync() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(STORAGE_SYNC_EVENT, { detail: { key: STORAGE_KEYS.xonsgarden_debts } }),
  )
}

export async function readDebts() {
  return readDebtDatabaseRecords()
}

export async function writeDebts(records: DebtRecord[]) {
  const value = await writeDebtDatabaseRecords(records)
  emitStorageSync()
  return value
}

export async function saveDebtRecord(record: DebtRecord) {
  const value = await saveDebtDatabaseRecord(record)
  emitStorageSync()
  return value
}

export async function deleteDebtRecord(id: string) {
  await deleteDebtDatabaseRecord(id)
  emitStorageSync()
}
