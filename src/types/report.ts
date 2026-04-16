import type { EntityKey } from './index'
import type { DebtStatus } from './debt'

export type ReportModuleType = EntityKey | 'income' | 'debt'
export type ReportModuleFilter = 'all' | ReportModuleType
export type ReportDebtStatusFilter = DebtStatus | 'all'
export type ReportGroupBy = 'none' | 'date' | 'module' | 'debt_status' | 'category' | 'month'

export interface ReportRow {
  id: string
  date: string
  moduleType: ReportModuleType
  moduleLabel: string
  modulePath: string
  title: string
  subtitle?: string
  categoryLabel?: string
  debtStatus?: DebtStatus
  amount: number
  extraInfo?: string
  searchText: string
  accentColor: string
  badgeClass: string
  createdAt?: string
}

export interface ReportGroupSection {
  key: string
  label: string
  total: number
  rows: ReportRow[]
}

export interface DashboardRecentItem {
  id: string
  title: string
  subtitle: string
  amount: number
  date: string
  badgeLabel: string
  badgeClass: string
  accentColor: string
}

export interface DashboardAlertItem {
  id: string
  title: string
  description: string
  tone: 'rose' | 'amber' | 'emerald' | 'blue'
  amount?: number
  date?: string
}
