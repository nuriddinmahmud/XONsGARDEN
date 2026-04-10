import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

export interface AuthState {
  isAuthenticated: boolean
  email: string | null
}

export interface BaseRecord {
  id: string
  date: string
}

export interface Worker extends BaseRecord {
  workerCount: number
  salaryPerOne: number
  totalSalary: number
  comment: string
}

export interface Food extends BaseRecord {
  shopName: string
  price: number
}

export interface Fertilizer extends BaseRecord {
  fertilizerType: string
  machineCount: number
  tonAmount: number
  cost: number
  comment: string
}

export interface Transport extends BaseRecord {
  transportType: string
  cost: number
  comment: string
}

export interface Energy extends BaseRecord {
  amountPaid: number
  comment: string
}

export interface Oil extends BaseRecord {
  price: number
  comment: string
}

export interface Remont extends BaseRecord {
  price: number
  comment: string
}

export interface Tax extends BaseRecord {
  amountPaid: number
  comment: string
}

export interface Drainage extends BaseRecord {
  hoursWorked: number
  totalSalary: number
}

export interface AppSettings {
  gardenName: string
  managerName: string
  phone: string
  location: string
  currencyLabel: string
}

export type StorageKey =
  | 'auth'
  | 'workers'
  | 'foods'
  | 'fertilizers'
  | 'transports'
  | 'energies'
  | 'oils'
  | 'remonts'
  | 'taxes'
  | 'drainages'
  | 'settings'
  | 'users'

export type EntityKey =
  | 'workers'
  | 'foods'
  | 'fertilizers'
  | 'transports'
  | 'energies'
  | 'oils'
  | 'remonts'
  | 'taxes'
  | 'drainages'

export type EntityRecord =
  | Worker
  | Food
  | Fertilizer
  | Transport
  | Energy
  | Oil
  | Remont
  | Tax
  | Drainage

export interface RecordsMap {
  workers: Worker[]
  foods: Food[]
  fertilizers: Fertilizer[]
  transports: Transport[]
  energies: Energy[]
  oils: Oil[]
  remonts: Remont[]
  taxes: Tax[]
  drainages: Drainage[]
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  description?: string
}

export interface NavItem {
  path: string
  label: string
  description?: string
  icon: LucideIcon
}

export interface TableColumn<T> {
  key: string
  label: string
  className?: string
  render: (row: T, context: TableRenderContext) => ReactNode
}

export interface TableRenderContext {
  currencyLabel: string
}

export interface SelectOption {
  label: string
  value: string
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'textarea' | 'select'
  required?: boolean
  placeholder?: string
  min?: number
  step?: number
  readOnly?: boolean
  options?: SelectOption[]
  helperText?: string
}

export type FormValues = Record<string, string>

export interface CategorySummary {
  key: EntityKey
  label: string
  total: number
  count: number
  color: string
}

export interface RecentActivity {
  id: string
  category: EntityKey
  label: string
  description: string
  amount: number
  date: string
}

export interface EntityPageConfig<T extends EntityRecord> {
  storageKey: EntityKey
  title: string
  description?: string
  addLabel: string
  searchPlaceholder: string
  emptyTitle: string
  emptyDescription?: string
  fields: FormField[]
  columns: TableColumn<T>[]
  getSearchText: (record: T) => string
  getAmount: (record: T) => number
  toFormValues: (record: T) => FormValues
  createRecord: (values: FormValues, existingId?: string) => T
  deriveValues?: (values: FormValues) => FormValues
}

export interface AppStorageBackup {
  app: 'xons-garden'
  version: 1
  exportedAt: string
  data: Partial<Record<StorageKey, unknown>>
}
