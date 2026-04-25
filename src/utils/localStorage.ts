import { STORAGE_SYNC_EVENT } from '../constants/storageKeys'
import type {
  AppSettings,
  AppStorageBackup,
  AuthState,
  EntityKey,
  EntityRecord,
  RecordsMap,
} from '../types'
import {
  createStorageBackup as createDatabaseBackup,
  deleteCollectionRecord as deleteDatabaseCollectionRecord,
  parseStorageBackup as parseDatabaseBackup,
  readCollection as readDatabaseCollection,
  readRecordsMap as readDatabaseRecordsMap,
  readSettings as readDatabaseSettings,
  readUsers as readDatabaseUsers,
  restoreStorageBackup as restoreDatabaseBackup,
  saveCollectionRecord,
  validateBackupValue,
  writeCollection as writeDatabaseCollection,
  writeSettings as writeDatabaseSettings,
} from '../lib/database'

const AUTH_STORAGE_KEY = 'auth'
const STATIC_USERNAME = 'XON'

function emitStorageSync(key: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(STORAGE_SYNC_EVENT, { detail: { key } }))
}

export function readStorage<T>(_key: string, fallback: T) {
  return fallback
}

export function writeStorage<T>(_key: string, value: T) {
  return value
}

export async function readAuthState(): Promise<AuthState> {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      login: null,
    }
  }

  const saved = window.localStorage.getItem(AUTH_STORAGE_KEY)
  const isAuthenticated = saved === 'true'

  return {
    isAuthenticated,
    login: isAuthenticated ? STATIC_USERNAME : null,
  }
}

export async function writeAuthState(value: boolean) {
  if (typeof window !== 'undefined') {
    if (value) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, 'true')
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  emitStorageSync('auth')
}

export async function clearSession() {
  await writeAuthState(false)
}

export async function readCollection<T>(key: EntityKey) {
  return (await readDatabaseCollection(key)) as T[]
}

export async function saveCollection<T extends EntityRecord>(key: EntityKey, record: T) {
  const savedRecord = await saveCollectionRecord(key, record)
  emitStorageSync(key)
  return savedRecord as unknown as T
}

export async function deleteCollectionRecord(key: EntityKey, id: string) {
  await deleteDatabaseCollectionRecord(key, id)
  emitStorageSync(key)
}

export async function writeCollection<T extends EntityRecord>(key: EntityKey, value: T[]) {
  const records = await writeDatabaseCollection(key, value as never[])
  emitStorageSync(key)
  return records as unknown as T[]
}

export async function readSettings() {
  return readDatabaseSettings()
}

export async function writeSettings(value: AppSettings) {
  const settings = await writeDatabaseSettings(value)
  emitStorageSync('settings')
  return settings
}

export async function readUsers() {
  return readDatabaseUsers()
}

export async function readRecordsMap(): Promise<RecordsMap> {
  return readDatabaseRecordsMap()
}

export async function createStorageBackup(): Promise<AppStorageBackup> {
  return createDatabaseBackup()
}

export function parseStorageBackup(rawText: string) {
  return parseDatabaseBackup(rawText)
}

export async function restoreStorageBackup(backup: AppStorageBackup) {
  const result = await restoreDatabaseBackup(backup)

  if (result.success) {
    emitStorageSync('settings')
    emitStorageSync('xonsgarden_income')
    emitStorageSync('xonsgarden_debts')
    emitStorageSync('workers')
    emitStorageSync('foods')
    emitStorageSync('fertilizers')
    emitStorageSync('transports')
    emitStorageSync('energies')
    emitStorageSync('oils')
    emitStorageSync('remonts')
    emitStorageSync('taxes')
    emitStorageSync('drainages')
  }

  return result
}

export { validateBackupValue }
