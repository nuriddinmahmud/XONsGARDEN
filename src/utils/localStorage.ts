import { STATIC_ADMIN } from '../constants/auth'
import { STORAGE_KEYS, STORAGE_SYNC_EVENT } from '../constants/storageKeys'
import type {
  AppSettings,
  AppStorageBackup,
  AuthState,
  EntityKey,
  RecordsMap,
  StorageKey,
  User,
} from '../types'

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  login: null,
}

const defaultSettings: AppSettings = {
  gardenName: '',
  managerName: '',
  phone: '',
  location: '',
  currencyLabel: "so'm",
}

const APP_STORAGE_NAME = 'xons-garden'
const APP_STORAGE_VERSION = 1

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function emitStorageSync(key: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(STORAGE_SYNC_EVENT, { detail: { key } }))
}

export function readStorage<T>(key: StorageKey, fallback: T): T {
  if (!hasStorage()) {
    return fallback
  }

  const raw = window.localStorage.getItem(key)

  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: StorageKey, value: T) {
  if (!hasStorage()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
  emitStorageSync(key)
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeAuthState(value: unknown): AuthState {
  if (value === true || value === 'true') {
    return {
      isAuthenticated: true,
      login: STATIC_ADMIN.login,
    }
  }

  if (!isObjectRecord(value) || typeof value.isAuthenticated !== 'boolean') {
    return defaultAuthState
  }

  const storedLogin =
    typeof value.login === 'string'
      ? value.login
      : typeof value.email === 'string'
        ? value.email
        : null

  return {
    isAuthenticated: value.isAuthenticated,
    login: value.isAuthenticated ? storedLogin ?? STATIC_ADMIN.login : null,
  }
}

function validateBackupValue(key: StorageKey, value: unknown) {
  if (key === STORAGE_KEYS.auth) {
    return typeof value === 'boolean' || typeof value === 'string' || isObjectRecord(value)
  }

  if (key === STORAGE_KEYS.settings) {
    return isObjectRecord(value)
  }

  return Array.isArray(value)
}

export function readAuthState() {
  if (!hasStorage()) {
    return defaultAuthState
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.auth)

  if (!raw) {
    return defaultAuthState
  }

  try {
    return normalizeAuthState(JSON.parse(raw) as unknown)
  } catch {
    return normalizeAuthState(raw)
  }
}

export function writeAuthState(value: AuthState) {
  if (!hasStorage()) {
    return
  }

  if (value.isAuthenticated) {
    window.localStorage.setItem(STORAGE_KEYS.auth, 'true')
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.auth)
  }

  emitStorageSync(STORAGE_KEYS.auth)
}

export function readCollection<T>(key: EntityKey) {
  return readStorage<T[]>(key, [])
}

export function writeCollection<T>(key: EntityKey, value: T[]) {
  writeStorage(key, value)
}

export function readSettings() {
  return readStorage<AppSettings>(STORAGE_KEYS.settings, defaultSettings)
}

export function writeSettings(value: AppSettings) {
  writeStorage(STORAGE_KEYS.settings, value)
}

export function readUsers() {
  return readStorage<User[]>(STORAGE_KEYS.users, [])
}

export function readRecordsMap(): RecordsMap {
  return {
    workers: readCollection('workers'),
    foods: readCollection('foods'),
    fertilizers: readCollection('fertilizers'),
    transports: readCollection('transports'),
    energies: readCollection('energies'),
    oils: readCollection('oils'),
    remonts: readCollection('remonts'),
    taxes: readCollection('taxes'),
    drainages: readCollection('drainages'),
  }
}

export function clearSession() {
  writeAuthState(defaultAuthState)
}

export function createStorageBackup(): AppStorageBackup {
  const data: Partial<Record<StorageKey, unknown>> = {}

  for (const key of Object.values(STORAGE_KEYS)) {
    const raw = window.localStorage.getItem(key)

    if (!raw) {
      continue
    }

    try {
      data[key] = JSON.parse(raw) as unknown
    } catch {
      // Skip corrupted values instead of exporting unusable JSON.
    }
  }

  return {
    app: APP_STORAGE_NAME,
    version: APP_STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  }
}

export function parseStorageBackup(rawText: string) {
  try {
    const parsed = JSON.parse(rawText) as unknown

    if (!isObjectRecord(parsed)) {
      return { success: false as const, message: "JSON fayl formati noto'g'ri." }
    }

    if (parsed.app !== APP_STORAGE_NAME || parsed.version !== APP_STORAGE_VERSION) {
      return {
        success: false as const,
        message: "Bu fayl XON's Garden zaxira fayli emas yoki versiyasi mos emas.",
      }
    }

    if (!isObjectRecord(parsed.data)) {
      return { success: false as const, message: "Zaxira fayl ichidagi data bo'limi noto'g'ri." }
    }

    const data: Partial<Record<StorageKey, unknown>> = {}

    for (const key of Object.values(STORAGE_KEYS)) {
      const value = parsed.data[key]

      if (value === undefined) {
        continue
      }

      if (!validateBackupValue(key, value)) {
        return {
          success: false as const,
          message: `${key} bo'limidagi ma'lumot formati noto'g'ri.`,
        }
      }

      data[key] = value
    }

    return {
      success: true as const,
      backup: {
        app: APP_STORAGE_NAME,
        version: APP_STORAGE_VERSION,
        exportedAt:
          typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
        data,
      } satisfies AppStorageBackup,
    }
  } catch {
    return { success: false as const, message: "JSON faylni o'qishda xatolik yuz berdi." }
  }
}

export function restoreStorageBackup(backup: AppStorageBackup) {
  if (!hasStorage()) {
    return { success: false as const, message: 'Brauzer storage mavjud emas.' }
  }

  for (const key of Object.values(STORAGE_KEYS)) {
    window.localStorage.removeItem(key)
  }

  for (const key of Object.values(STORAGE_KEYS)) {
    const value = backup.data[key]

    if (value !== undefined) {
      window.localStorage.setItem(key, JSON.stringify(value))
    }
  }

  for (const key of Object.values(STORAGE_KEYS)) {
    emitStorageSync(key)
  }

  return { success: true as const }
}
