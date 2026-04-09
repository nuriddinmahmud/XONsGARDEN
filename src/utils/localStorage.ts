import { STATIC_ADMIN } from '../constants/auth'
import { ENTITY_KEYS, STORAGE_KEYS, STORAGE_SYNC_EVENT } from '../constants/storageKeys'
import { demoRecords, demoSettings, demoUser } from '../data/seed'
import type { AppSettings, AuthState, EntityKey, RecordsMap, StorageKey, User } from '../types'

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  email: null,
}

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

export function readAuthState() {
  return readStorage<AuthState>(STORAGE_KEYS.auth, defaultAuthState)
}

export function writeAuthState(value: AuthState) {
  writeStorage(STORAGE_KEYS.auth, value)
}

export function readCollection<T>(key: EntityKey) {
  return readStorage<T[]>(key, [])
}

export function writeCollection<T>(key: EntityKey, value: T[]) {
  writeStorage(key, value)
}

export function readSettings() {
  return readStorage<AppSettings>(STORAGE_KEYS.settings, demoSettings)
}

export function writeSettings(value: AppSettings) {
  writeStorage(STORAGE_KEYS.settings, value)
}

export function readUsers() {
  return readStorage<User[]>(STORAGE_KEYS.users, [demoUser])
}

export function initializeAppData() {
  if (!hasStorage()) {
    return
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.auth)) {
    writeAuthState(defaultAuthState)
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.settings)) {
    writeSettings(demoSettings)
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.users)) {
    writeStorage(STORAGE_KEYS.users, [
      {
        ...demoUser,
        name: STATIC_ADMIN.name,
      },
    ])
  }

  for (const key of ENTITY_KEYS) {
    if (!window.localStorage.getItem(key)) {
      writeStorage(key, demoRecords[key])
    }
  }
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
