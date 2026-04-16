import type { EntityKey, StorageKey } from '../types'

export const STORAGE_KEYS: Record<StorageKey, StorageKey> = {
  auth: 'auth',
  xonsgarden_debts: 'xonsgarden_debts',
  workers: 'workers',
  foods: 'foods',
  fertilizers: 'fertilizers',
  transports: 'transports',
  energies: 'energies',
  oils: 'oils',
  remonts: 'remonts',
  taxes: 'taxes',
  drainages: 'drainages',
  settings: 'settings',
  users: 'users',
}

export const ENTITY_KEYS: EntityKey[] = [
  'workers',
  'foods',
  'fertilizers',
  'transports',
  'energies',
  'oils',
  'remonts',
  'taxes',
  'drainages',
]

export const STORAGE_SYNC_EVENT = 'xons-storage-sync'
