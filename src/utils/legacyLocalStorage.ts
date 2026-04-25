import { STORAGE_KEYS } from '../constants/storageKeys'
import type { AppSettings, AppStorageBackup, StorageKey } from '../types'

const defaultSettings: AppSettings = {
  gardenName: '',
  managerName: '',
  phone: '',
  location: '',
  currencyLabel: "so'm",
}

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function readLegacyStorage<T>(key: StorageKey, fallback: T): T {
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

export function readLegacySettings() {
  return readLegacyStorage<AppSettings>(STORAGE_KEYS.settings, defaultSettings)
}

export function hasLegacyAppData() {
  if (!hasStorage()) {
    return false
  }

  return Object.values(STORAGE_KEYS).some((key) => Boolean(window.localStorage.getItem(key)))
}

export function createLegacyStorageBackup(): AppStorageBackup {
  const data: Partial<Record<StorageKey, unknown>> = {}

  if (!hasStorage()) {
    return {
      app: 'xons-garden',
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    }
  }

  for (const key of Object.values(STORAGE_KEYS)) {
    const raw = window.localStorage.getItem(key)

    if (!raw) {
      continue
    }

    try {
      data[key] = JSON.parse(raw) as unknown
    } catch {
      if (key === STORAGE_KEYS.auth) {
        data[key] = raw
      }
    }
  }

  return {
    app: 'xons-garden',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  }
}

export function parseLegacyStorageBackup(rawText: string) {
  try {
    const parsed = JSON.parse(rawText) as unknown

    if (!isObjectRecord(parsed)) {
      return { success: false as const, message: "JSON fayl formati noto'g'ri." }
    }

    if (parsed.app !== 'xons-garden' || parsed.version !== 1) {
      return {
        success: false as const,
        message: "Bu fayl XON's Garden zaxira fayli emas yoki versiyasi mos emas.",
      }
    }

    if (!isObjectRecord(parsed.data)) {
      return { success: false as const, message: "Zaxira fayl ichidagi data bo'limi noto'g'ri." }
    }

    return {
      success: true as const,
      backup: {
        app: 'xons-garden',
        version: 1,
        exportedAt:
          typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
        data: parsed.data as Partial<Record<StorageKey, unknown>>,
      } satisfies AppStorageBackup,
    }
  } catch {
    return { success: false as const, message: "JSON faylni o'qishda xatolik yuz berdi." }
  }
}
