import type { AppStorageBackup } from '../types'
import { createStorageBackup, restoreStorageBackup } from '../utils/localStorage'
import { createLegacyStorageBackup, hasLegacyAppData } from '../utils/legacyLocalStorage'

const MIGRATION_DATA_KEYS = [
  'xonsgarden_income',
  'xonsgarden_debts',
  'workers',
  'foods',
  'fertilizers',
  'transports',
  'energies',
  'oils',
  'remonts',
  'taxes',
  'drainages',
] as const

function hasBusinessRecords(backup: AppStorageBackup) {
  return MIGRATION_DATA_KEYS.some((key) => {
    const value = backup.data[key]
    return Array.isArray(value) && value.length > 0
  })
}

function getMigrationFingerprint(backup: AppStorageBackup) {
  return JSON.stringify({
    settings: backup.data.settings ?? null,
    xonsgarden_income: Array.isArray(backup.data.xonsgarden_income)
      ? backup.data.xonsgarden_income
      : [],
    xonsgarden_debts: Array.isArray(backup.data.xonsgarden_debts)
      ? backup.data.xonsgarden_debts
      : [],
    workers: Array.isArray(backup.data.workers) ? backup.data.workers : [],
    foods: Array.isArray(backup.data.foods) ? backup.data.foods : [],
    fertilizers: Array.isArray(backup.data.fertilizers) ? backup.data.fertilizers : [],
    transports: Array.isArray(backup.data.transports) ? backup.data.transports : [],
    energies: Array.isArray(backup.data.energies) ? backup.data.energies : [],
    oils: Array.isArray(backup.data.oils) ? backup.data.oils : [],
    remonts: Array.isArray(backup.data.remonts) ? backup.data.remonts : [],
    taxes: Array.isArray(backup.data.taxes) ? backup.data.taxes : [],
    drainages: Array.isArray(backup.data.drainages) ? backup.data.drainages : [],
  })
}

export async function migrateLegacyLocalStorageToSupabase() {
  if (!hasLegacyAppData()) {
    return {
      success: false as const,
      message: 'Legacy localStorage ma\'lumotlari topilmadi.',
    }
  }

  const legacyBackup = createLegacyStorageBackup()
  const currentBackup = await createStorageBackup()

  if (hasBusinessRecords(currentBackup)) {
    if (getMigrationFingerprint(currentBackup) === getMigrationFingerprint(legacyBackup)) {
      return {
        success: true as const,
        message: 'Legacy localStorage ma\'lumotlari allaqachon Supabase ga ko\'chirilgan.',
      }
    }

    return {
      success: false as const,
      message:
        'Supabase da ma\'lumotlar allaqachon mavjud. Takroriy migratsiya ustiga yozish yoki dublikat xavfi sabab bekor qilindi.',
    }
  }

  return restoreStorageBackup(legacyBackup)
}
