import type {
  AppSettings,
  AppStorageBackup,
  Drainage,
  Energy,
  EntityKey,
  Fertilizer,
  Food,
  Oil,
  RecordsMap,
  Remont,
  StorageKey,
  Tax,
  Transport,
  Worker,
} from '../types'
import type { DebtRecord } from '../types/debt'
import type { IncomeRecord } from '../types/income'
import { normalizeCurrencyLabel } from '../utils/formatMoney'
import { getSupabaseClient } from './supabase'

const DEFAULT_SETTINGS: AppSettings = {
  gardenName: '',
  managerName: '',
  phone: '',
  location: '',
  currencyLabel: "so'm",
}

const STATIC_GARDEN_SLUG = 'xons-static-garden'

const BACKUP_STORAGE_KEYS: StorageKey[] = [
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
  'settings',
]

const ENTITY_TABLES: Record<EntityKey, string> = {
  workers: 'worker_expenses',
  foods: 'food_expenses',
  fertilizers: 'fertilizer_expenses',
  transports: 'transport_expenses',
  energies: 'energy_expenses',
  oils: 'oil_expenses',
  remonts: 'remont_expenses',
  taxes: 'tax_expenses',
  drainages: 'drainage_expenses',
}

interface GardenRow {
  id: string
  slug: string
  owner_user_id: string | null
  garden_name: string
  manager_name: string
  phone: string
  location: string
  currency_label: string
  created_at: string
  updated_at: string
}

interface IncomeRow {
  id: string
  garden_id: string
  amount: number
  reason: string
  date: string
  source_location: string | null
  comment: string | null
  created_at: string
  updated_at: string
}

interface DebtRow {
  id: string
  garden_id: string
  person_or_company: string
  category: string
  reason: string
  amount: number
  date: string
  due_date: string | null
  status: DebtRecord['status']
  phone: string | null
  note: string | null
  created_at: string
  updated_at: string
}

interface WorkerRow {
  id: string
  garden_id: string
  date: string
  worker_count: number
  salary_per_one: number
  total_salary: number
  comment: string | null
  created_at: string
  updated_at: string
}

interface FoodRow {
  id: string
  garden_id: string
  date: string
  shop_name: string
  price: number
  created_at: string
  updated_at: string
}

interface FertilizerRow {
  id: string
  garden_id: string
  date: string
  fertilizer_type: string
  machine_count: number
  ton_amount: number
  cost: number
  comment: string | null
  created_at: string
  updated_at: string
}

interface TransportRow {
  id: string
  garden_id: string
  date: string
  transport_type: string
  cost: number
  comment: string | null
  created_at: string
  updated_at: string
}

interface EnergyRow {
  id: string
  garden_id: string
  date: string
  amount_paid: number
  comment: string | null
  created_at: string
  updated_at: string
}

interface OilRow {
  id: string
  garden_id: string
  date: string
  price: number
  comment: string | null
  created_at: string
  updated_at: string
}

interface RemontRow {
  id: string
  garden_id: string
  date: string
  price: number
  comment: string | null
  created_at: string
  updated_at: string
}

interface TaxRow {
  id: string
  garden_id: string
  date: string
  amount_paid: number
  comment: string | null
  created_at: string
  updated_at: string
}

interface DrainageRow {
  id: string
  garden_id: string
  date: string
  hours_worked: number
  total_salary: number
  created_at: string
  updated_at: string
}

type EntityRowMap = {
  workers: WorkerRow
  foods: FoodRow
  fertilizers: FertilizerRow
  transports: TransportRow
  energies: EnergyRow
  oils: OilRow
  remonts: RemontRow
  taxes: TaxRow
  drainages: DrainageRow
}

type EntityRecordMap = {
  workers: Worker
  foods: Food
  fertilizers: Fertilizer
  transports: Transport
  energies: Energy
  oils: Oil
  remonts: Remont
  taxes: Tax
  drainages: Drainage
}

let gardenCache: GardenRow | null = null
let gardenPromise: Promise<GardenRow> | null = null

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeSettings(value: AppSettings): AppSettings {
  return {
    gardenName: value.gardenName.trim(),
    managerName: value.managerName.trim(),
    phone: value.phone.trim(),
    location: value.location.trim(),
    currencyLabel: normalizeCurrencyLabel(value.currencyLabel),
  }
}

function mapGardenRowToSettings(row: GardenRow): AppSettings {
  return {
    gardenName: row.garden_name,
    managerName: row.manager_name,
    phone: row.phone,
    location: row.location,
    currencyLabel: normalizeCurrencyLabel(row.currency_label),
  }
}

function mapIncomeRow(row: IncomeRow): IncomeRecord {
  return {
    id: row.id,
    amount: row.amount,
    reason: row.reason,
    date: row.date,
    sourceLocation: row.source_location ?? undefined,
    comment: row.comment ?? undefined,
    createdAt: row.created_at,
  }
}

function mapDebtRow(row: DebtRow): DebtRecord {
  return {
    id: row.id,
    personOrCompany: row.person_or_company,
    category: row.category,
    reason: row.reason,
    amount: row.amount,
    date: row.date,
    dueDate: row.due_date ?? '',
    status: row.status,
    phone: row.phone ?? undefined,
    note: row.note ?? undefined,
  }
}

function mapEntityRow<K extends EntityKey>(key: K, row: EntityRowMap[K]): EntityRecordMap[K] {
  if (key === 'workers') {
    const workerRow = row as WorkerRow

    return {
      id: workerRow.id,
      date: workerRow.date,
      workerCount: workerRow.worker_count,
      salaryPerOne: workerRow.salary_per_one,
      totalSalary: workerRow.total_salary,
      comment: workerRow.comment ?? '',
    } as EntityRecordMap[K]
  }

  if (key === 'foods') {
    const foodRow = row as FoodRow

    return {
      id: foodRow.id,
      date: foodRow.date,
      shopName: foodRow.shop_name,
      price: foodRow.price,
    } as EntityRecordMap[K]
  }

  if (key === 'fertilizers') {
    const fertilizerRow = row as FertilizerRow

    return {
      id: fertilizerRow.id,
      date: fertilizerRow.date,
      fertilizerType: fertilizerRow.fertilizer_type,
      machineCount: fertilizerRow.machine_count,
      tonAmount: fertilizerRow.ton_amount,
      cost: fertilizerRow.cost,
      comment: fertilizerRow.comment ?? '',
    } as EntityRecordMap[K]
  }

  if (key === 'transports') {
    const transportRow = row as TransportRow

    return {
      id: transportRow.id,
      date: transportRow.date,
      transportType: transportRow.transport_type,
      cost: transportRow.cost,
      comment: transportRow.comment ?? '',
    } as EntityRecordMap[K]
  }

  if (key === 'energies') {
    const energyRow = row as EnergyRow

    return {
      id: energyRow.id,
      date: energyRow.date,
      amountPaid: energyRow.amount_paid,
      comment: energyRow.comment ?? '',
    } as EntityRecordMap[K]
  }

  if (key === 'oils') {
    const oilRow = row as OilRow

    return {
      id: oilRow.id,
      date: oilRow.date,
      price: oilRow.price,
      comment: oilRow.comment ?? '',
    } as EntityRecordMap[K]
  }

  if (key === 'remonts') {
    const remontRow = row as RemontRow

    return {
      id: remontRow.id,
      date: remontRow.date,
      price: remontRow.price,
      comment: remontRow.comment ?? '',
    } as EntityRecordMap[K]
  }

  if (key === 'taxes') {
    const taxRow = row as TaxRow

    return {
      id: taxRow.id,
      date: taxRow.date,
      amountPaid: taxRow.amount_paid,
      comment: taxRow.comment ?? '',
    } as EntityRecordMap[K]
  }

  const drainageRow = row as DrainageRow

  return {
    id: drainageRow.id,
    date: drainageRow.date,
    hoursWorked: drainageRow.hours_worked,
    totalSalary: drainageRow.total_salary,
  } as EntityRecordMap[K]
}

function toIncomeRow(gardenId: string, record: IncomeRecord): Omit<IncomeRow, 'updated_at'> {
  return {
    id: record.id,
    garden_id: gardenId,
    amount: record.amount,
    reason: record.reason.trim(),
    date: record.date,
    source_location: record.sourceLocation?.trim() || null,
    comment: record.comment?.trim() || null,
    created_at: record.createdAt ?? new Date().toISOString(),
  }
}

function toDebtRow(gardenId: string, record: DebtRecord): Omit<DebtRow, 'updated_at' | 'created_at'> {
  return {
    id: record.id,
    garden_id: gardenId,
    person_or_company: record.personOrCompany.trim(),
    category: record.category.trim(),
    reason: record.reason.trim(),
    amount: record.amount,
    date: record.date,
    due_date: record.dueDate.trim() || null,
    status: record.status,
    phone: record.phone?.trim() || null,
    note: record.note?.trim() || null,
  }
}

function toEntityRow<K extends EntityKey>(
  key: K,
  gardenId: string,
  record: EntityRecordMap[K],
): Omit<EntityRowMap[K], 'updated_at' | 'created_at'> & { created_at?: string } {
  if (key === 'workers') {
    const workerRecord = record as Worker

    return {
      id: workerRecord.id,
      garden_id: gardenId,
      date: workerRecord.date,
      worker_count: workerRecord.workerCount,
      salary_per_one: workerRecord.salaryPerOne,
      total_salary: workerRecord.totalSalary,
      comment: workerRecord.comment.trim() || null,
    } as unknown as Omit<EntityRowMap[K], 'updated_at' | 'created_at'>
  }

  if (key === 'foods') {
    const foodRecord = record as Food

    return {
      id: foodRecord.id,
      garden_id: gardenId,
      date: foodRecord.date,
      shop_name: foodRecord.shopName.trim(),
      price: foodRecord.price,
    } as unknown as Omit<EntityRowMap[K], 'updated_at' | 'created_at'>
  }

  if (key === 'fertilizers') {
    const fertilizerRecord = record as Fertilizer

    return {
      id: fertilizerRecord.id,
      garden_id: gardenId,
      date: fertilizerRecord.date,
      fertilizer_type: fertilizerRecord.fertilizerType.trim(),
      machine_count: fertilizerRecord.machineCount,
      ton_amount: fertilizerRecord.tonAmount,
      cost: fertilizerRecord.cost,
      comment: fertilizerRecord.comment.trim() || null,
    } as unknown as Omit<EntityRowMap[K], 'updated_at' | 'created_at'>
  }

  if (key === 'transports') {
    const transportRecord = record as Transport

    return {
      id: transportRecord.id,
      garden_id: gardenId,
      date: transportRecord.date,
      transport_type: transportRecord.transportType.trim(),
      cost: transportRecord.cost,
      comment: transportRecord.comment.trim() || null,
    } as unknown as Omit<EntityRowMap[K], 'updated_at' | 'created_at'>
  }

  if (key === 'energies') {
    const energyRecord = record as Energy

    return {
      id: energyRecord.id,
      garden_id: gardenId,
      date: energyRecord.date,
      amount_paid: energyRecord.amountPaid,
      comment: energyRecord.comment.trim() || null,
    } as unknown as Omit<EntityRowMap[K], 'updated_at' | 'created_at'>
  }

  if (key === 'oils') {
    const oilRecord = record as Oil

    return {
      id: oilRecord.id,
      garden_id: gardenId,
      date: oilRecord.date,
      price: oilRecord.price,
      comment: oilRecord.comment.trim() || null,
    } as unknown as Omit<EntityRowMap[K], 'updated_at' | 'created_at'>
  }

  if (key === 'remonts') {
    const remontRecord = record as Remont

    return {
      id: remontRecord.id,
      garden_id: gardenId,
      date: remontRecord.date,
      price: remontRecord.price,
      comment: remontRecord.comment.trim() || null,
    } as unknown as Omit<EntityRowMap[K], 'updated_at' | 'created_at'>
  }

  if (key === 'taxes') {
    const taxRecord = record as Tax

    return {
      id: taxRecord.id,
      garden_id: gardenId,
      date: taxRecord.date,
      amount_paid: taxRecord.amountPaid,
      comment: taxRecord.comment.trim() || null,
    } as unknown as Omit<EntityRowMap[K], 'updated_at' | 'created_at'>
  }

  const drainageRecord = record as Drainage

  return {
    id: drainageRecord.id,
    garden_id: gardenId,
    date: drainageRecord.date,
    hours_worked: drainageRecord.hoursWorked,
    total_salary: drainageRecord.totalSalary,
  } as unknown as Omit<EntityRowMap[K], 'updated_at' | 'created_at'>
}

async function ensureGarden(forceRefresh = false): Promise<GardenRow> {
  if (!forceRefresh && gardenCache) {
    return gardenCache
  }

  if (!forceRefresh && gardenPromise) {
    return gardenPromise
  }

  gardenPromise = (async () => {
    const client = getSupabaseClient()

    const { data: existingGarden, error: readError } = await client
      .from('gardens')
      .select('*')
      .eq('slug', STATIC_GARDEN_SLUG)
      .maybeSingle<GardenRow>()

    if (readError) {
      throw readError
    }

    if (existingGarden) {
      gardenCache = existingGarden
      return existingGarden
    }

    const seedSettings = normalizeSettings({
      gardenName: "XON's Garden",
      managerName: 'XON',
      phone: '',
      location: '',
      currencyLabel: DEFAULT_SETTINGS.currencyLabel,
    })

    const { data: insertedGarden, error: insertError } = await client
      .from('gardens')
      .insert({
        slug: STATIC_GARDEN_SLUG,
        owner_user_id: null,
        garden_name: seedSettings.gardenName,
        manager_name: seedSettings.managerName,
        phone: seedSettings.phone,
        location: seedSettings.location,
        currency_label: seedSettings.currencyLabel,
      })
      .select('*')
      .single<GardenRow>()

    if (insertError) {
      throw insertError
    }

    gardenCache = insertedGarden
    return insertedGarden
  })()

  try {
    return await gardenPromise
  } finally {
    gardenPromise = null
  }
}

async function getGardenId() {
  const garden = await ensureGarden()
  return garden.id
}

export function resetGardenCache() {
  gardenCache = null
  gardenPromise = null
}

export async function getActiveGardenId() {
  return getGardenId()
}

export async function readSettings() {
  const garden = await ensureGarden()
  return mapGardenRowToSettings(garden)
}

export async function writeSettings(value: AppSettings) {
  const client = getSupabaseClient()
  const garden = await ensureGarden()
  const normalized = normalizeSettings(value)

  const { data, error } = await client
    .from('gardens')
    .update({
      garden_name: normalized.gardenName,
      manager_name: normalized.managerName,
      phone: normalized.phone,
      location: normalized.location,
      currency_label: normalized.currencyLabel,
    })
    .eq('id', garden.id)
    .select('*')
    .single<GardenRow>()

  if (error) {
    throw error
  }

  gardenCache = data
  return mapGardenRowToSettings(data)
}

export async function readCollection<K extends EntityKey>(key: K): Promise<EntityRecordMap[K][]> {
  const client = getSupabaseClient()
  const gardenId = await getGardenId()
  const tableName = ENTITY_TABLES[key]

  const { data, error } = await client
    .from(tableName)
    .select('*')
    .eq('garden_id', gardenId)
    .order('date', { ascending: false })

  if (error) {
    throw error
  }

  return ((data ?? []) as EntityRowMap[K][]).map((row) => mapEntityRow(key, row))
}

export async function saveCollectionRecord<K extends EntityKey>(
  key: K,
  record: EntityRecordMap[K],
): Promise<EntityRecordMap[K]> {
  const client = getSupabaseClient()
  const gardenId = await getGardenId()
  const tableName = ENTITY_TABLES[key]
  const payload = toEntityRow(key, gardenId, record)

  const { data, error } = await client
    .from(tableName)
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single<EntityRowMap[K]>()

  if (error) {
    throw error
  }

  return mapEntityRow(key, data)
}

export async function deleteCollectionRecord(key: EntityKey, id: string) {
  const client = getSupabaseClient()
  const gardenId = await getGardenId()

  const { error } = await client.from(ENTITY_TABLES[key]).delete().eq('garden_id', gardenId).eq('id', id)

  if (error) {
    throw error
  }
}

export async function writeCollection<K extends EntityKey>(
  key: K,
  value: EntityRecordMap[K][],
) {
  const client = getSupabaseClient()
  const gardenId = await getGardenId()
  const tableName = ENTITY_TABLES[key]

  const { error: deleteError } = await client.from(tableName).delete().eq('garden_id', gardenId)

  if (deleteError) {
    throw deleteError
  }

  if (!value.length) {
    return []
  }

  const { data, error } = await client
    .from(tableName)
    .insert(value.map((record) => toEntityRow(key, gardenId, record)))
    .select('*')

  if (error) {
    throw error
  }

  return ((data ?? []) as EntityRowMap[K][]).map((row) => mapEntityRow(key, row))
}

export async function readIncomeRecords() {
  const client = getSupabaseClient()
  const gardenId = await getGardenId()

  const { data, error } = await client
    .from('income_records')
    .select('*')
    .eq('garden_id', gardenId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return ((data ?? []) as IncomeRow[]).map(mapIncomeRow)
}

export async function saveIncomeRecord(record: IncomeRecord) {
  const client = getSupabaseClient()
  const gardenId = await getGardenId()

  const { data, error } = await client
    .from('income_records')
    .upsert(toIncomeRow(gardenId, record), { onConflict: 'id' })
    .select('*')
    .single<IncomeRow>()

  if (error) {
    throw error
  }

  return mapIncomeRow(data)
}

export async function writeIncomeRecords(records: IncomeRecord[]) {
  const client = getSupabaseClient()
  const gardenId = await getGardenId()

  const { error: deleteError } = await client.from('income_records').delete().eq('garden_id', gardenId)

  if (deleteError) {
    throw deleteError
  }

  if (!records.length) {
    return []
  }

  const { data, error } = await client
    .from('income_records')
    .insert(records.map((record) => toIncomeRow(gardenId, record)))
    .select('*')

  if (error) {
    throw error
  }

  return ((data ?? []) as IncomeRow[]).map(mapIncomeRow)
}

export async function deleteIncomeRecord(id: string) {
  const client = getSupabaseClient()
  const gardenId = await getGardenId()

  const { error } = await client.from('income_records').delete().eq('garden_id', gardenId).eq('id', id)

  if (error) {
    throw error
  }
}

export async function readDebts() {
  const client = getSupabaseClient()
  const gardenId = await getGardenId()

  const { data, error } = await client
    .from('debt_records')
    .select('*')
    .eq('garden_id', gardenId)
    .order('date', { ascending: false })
    .order('due_date', { ascending: false })

  if (error) {
    throw error
  }

  return ((data ?? []) as DebtRow[]).map(mapDebtRow)
}

export async function saveDebtRecord(record: DebtRecord) {
  const client = getSupabaseClient()
  const gardenId = await getGardenId()

  const { data, error } = await client
    .from('debt_records')
    .upsert(toDebtRow(gardenId, record), { onConflict: 'id' })
    .select('*')
    .single<DebtRow>()

  if (error) {
    throw error
  }

  return mapDebtRow(data)
}

export async function writeDebts(records: DebtRecord[]) {
  const client = getSupabaseClient()
  const gardenId = await getGardenId()

  const { error: deleteError } = await client.from('debt_records').delete().eq('garden_id', gardenId)

  if (deleteError) {
    throw deleteError
  }

  if (!records.length) {
    return []
  }

  const { data, error } = await client
    .from('debt_records')
    .insert(records.map((record) => toDebtRow(gardenId, record)))
    .select('*')

  if (error) {
    throw error
  }

  return ((data ?? []) as DebtRow[]).map(mapDebtRow)
}

export async function deleteDebtRecord(id: string) {
  const client = getSupabaseClient()
  const gardenId = await getGardenId()

  const { error } = await client.from('debt_records').delete().eq('garden_id', gardenId).eq('id', id)

  if (error) {
    throw error
  }
}

export async function readUsers() {
  return []
}

export async function readRecordsMap(): Promise<RecordsMap> {
  const [
    workers,
    foods,
    fertilizers,
    transports,
    energies,
    oils,
    remonts,
    taxes,
    drainages,
  ] = await Promise.all([
    readCollection('workers'),
    readCollection('foods'),
    readCollection('fertilizers'),
    readCollection('transports'),
    readCollection('energies'),
    readCollection('oils'),
    readCollection('remonts'),
    readCollection('taxes'),
    readCollection('drainages'),
  ])

  return {
    workers,
    foods,
    fertilizers,
    transports,
    energies,
    oils,
    remonts,
    taxes,
    drainages,
  }
}

export function validateBackupValue(key: StorageKey, value: unknown) {
  if (key === 'settings') {
    return isObjectRecord(value)
  }

  if (key === 'auth') {
    return typeof value === 'boolean' || typeof value === 'string' || isObjectRecord(value)
  }

  return Array.isArray(value)
}

export async function createStorageBackup(): Promise<AppStorageBackup> {
  const [
    settings,
    incomeRecords,
    debtRecords,
    workers,
    foods,
    fertilizers,
    transports,
    energies,
    oils,
    remonts,
    taxes,
    drainages,
  ] = await Promise.all([
    readSettings(),
    readIncomeRecords(),
    readDebts(),
    readCollection('workers'),
    readCollection('foods'),
    readCollection('fertilizers'),
    readCollection('transports'),
    readCollection('energies'),
    readCollection('oils'),
    readCollection('remonts'),
    readCollection('taxes'),
    readCollection('drainages'),
  ])

  return {
    app: 'xons-garden',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      settings,
      xonsgarden_income: incomeRecords,
      xonsgarden_debts: debtRecords,
      workers,
      foods,
      fertilizers,
      transports,
      energies,
      oils,
      remonts,
      taxes,
      drainages,
    },
  }
}

export function parseStorageBackup(rawText: string) {
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

    const data: Partial<Record<StorageKey, unknown>> = {}

    for (const key of BACKUP_STORAGE_KEYS) {
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
        app: 'xons-garden',
        version: 1,
        exportedAt:
          typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
        data,
      } satisfies AppStorageBackup,
    }
  } catch {
    return { success: false as const, message: "JSON faylni o'qishda xatolik yuz berdi." }
  }
}

async function clearGardenData() {
  const client = getSupabaseClient()
  const gardenId = await getGardenId()

  const tablesToClear = [
    'income_records',
    'debt_records',
    ...Object.values(ENTITY_TABLES),
  ]

  for (const tableName of tablesToClear) {
    const { error } = await client.from(tableName).delete().eq('garden_id', gardenId)

    if (error) {
      throw error
    }
  }
}

export async function restoreStorageBackup(backup: AppStorageBackup) {
  try {
    await clearGardenData()

    if (backup.data.settings && isObjectRecord(backup.data.settings)) {
      const settingsRecord = backup.data.settings as Partial<AppSettings>
      await writeSettings({
        gardenName: typeof settingsRecord.gardenName === 'string' ? settingsRecord.gardenName : '',
        managerName:
          typeof settingsRecord.managerName === 'string' ? settingsRecord.managerName : '',
        phone: typeof settingsRecord.phone === 'string' ? settingsRecord.phone : '',
        location: typeof settingsRecord.location === 'string' ? settingsRecord.location : '',
        currencyLabel:
          typeof settingsRecord.currencyLabel === 'string'
            ? settingsRecord.currencyLabel
            : DEFAULT_SETTINGS.currencyLabel,
      })
    }

    if (Array.isArray(backup.data.xonsgarden_income)) {
      await writeIncomeRecords(backup.data.xonsgarden_income as IncomeRecord[])
    }

    if (Array.isArray(backup.data.xonsgarden_debts)) {
      await writeDebts(backup.data.xonsgarden_debts as DebtRecord[])
    }

    if (Array.isArray(backup.data.workers)) {
      await writeCollection('workers', backup.data.workers as Worker[])
    }

    if (Array.isArray(backup.data.foods)) {
      await writeCollection('foods', backup.data.foods as Food[])
    }

    if (Array.isArray(backup.data.fertilizers)) {
      await writeCollection('fertilizers', backup.data.fertilizers as Fertilizer[])
    }

    if (Array.isArray(backup.data.transports)) {
      await writeCollection('transports', backup.data.transports as Transport[])
    }

    if (Array.isArray(backup.data.energies)) {
      await writeCollection('energies', backup.data.energies as Energy[])
    }

    if (Array.isArray(backup.data.oils)) {
      await writeCollection('oils', backup.data.oils as EntityRecordMap['oils'][])
    }

    if (Array.isArray(backup.data.remonts)) {
      await writeCollection('remonts', backup.data.remonts as Remont[])
    }

    if (Array.isArray(backup.data.taxes)) {
      await writeCollection('taxes', backup.data.taxes as Tax[])
    }

    if (Array.isArray(backup.data.drainages)) {
      await writeCollection('drainages', backup.data.drainages as Drainage[])
    }

    return { success: true as const }
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Ma'lumotlarni tiklab bo'lmadi.",
    }
  }
}
