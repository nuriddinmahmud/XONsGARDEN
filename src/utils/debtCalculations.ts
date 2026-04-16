import type { SummaryCardItem } from '../types'
import type { DebtRecord, DebtStatus } from '../types/debt'
import { getTodayDate } from './helpers'

export const DEBT_STATUS_OPTIONS: Array<{ label: string; value: DebtStatus }> = [
  { label: "To'lanmagan", value: "to'lanmagan" },
  { label: "Qisman to'langan", value: "qisman to'langan" },
  { label: "To'langan", value: "to'langan" },
]

export const DEBT_STATUS_META: Record<
  DebtStatus,
  { label: string; badgeClass: string; summaryColor: string }
> = {
  "to'lanmagan": {
    label: "To'lanmagan",
    badgeClass: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
    summaryColor: '#e11d48',
  },
  "qisman to'langan": {
    label: "Qisman to'langan",
    badgeClass: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    summaryColor: '#f59e0b',
  },
  "to'langan": {
    label: "To'langan",
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    summaryColor: '#10b981',
  },
}

export type DebtStatusFilter = DebtStatus | 'all'

export function isDebtOverdue(record: DebtRecord, today = getTodayDate()) {
  return Boolean(record.dueDate) && record.dueDate < today && record.status !== "to'langan"
}

export function getDebtTotals(records: DebtRecord[]) {
  return records.reduce(
    (totals, record) => {
      totals.total += record.amount

      if (record.status === "to'lanmagan") {
        totals.unpaid += record.amount
        totals.unpaidCount += 1
      } else if (record.status === "qisman to'langan") {
        totals.partial += record.amount
        totals.partialCount += 1
      } else {
        totals.paid += record.amount
        totals.paidCount += 1
      }

      return totals
    },
    {
      total: 0,
      unpaid: 0,
      partial: 0,
      paid: 0,
      unpaidCount: 0,
      partialCount: 0,
      paidCount: 0,
    },
  )
}

export function getDebtSummaryItems(records: DebtRecord[]): SummaryCardItem[] {
  const totals = getDebtTotals(records)

  return [
    {
      key: 'debt_total',
      label: 'Jami qarz',
      total: totals.total,
      count: records.length,
      color: '#0f172a',
    },
    {
      key: 'debt_unpaid',
      label: "To'lanmagan",
      total: totals.unpaid,
      count: totals.unpaidCount,
      color: DEBT_STATUS_META["to'lanmagan"].summaryColor,
    },
    {
      key: 'debt_partial',
      label: "Qisman to'langan",
      total: totals.partial,
      count: totals.partialCount,
      color: DEBT_STATUS_META["qisman to'langan"].summaryColor,
    },
    {
      key: 'debt_paid',
      label: "To'langan",
      total: totals.paid,
      count: totals.paidCount,
      color: DEBT_STATUS_META["to'langan"].summaryColor,
    },
  ]
}

export function getDebtCategories(records: DebtRecord[]) {
  const categories = new Map<string, string>()

  for (const record of records) {
    const trimmed = record.category.trim()

    if (!trimmed) {
      continue
    }

    const normalized = trimmed.toLocaleLowerCase('uz-UZ')

    if (!categories.has(normalized)) {
      categories.set(normalized, trimmed)
    }
  }

  return [...categories.values()].sort((left, right) => left.localeCompare(right, 'uz'))
}

export function getOverdueDebtCount(records: DebtRecord[], today = getTodayDate()) {
  return records.filter((record) => isDebtOverdue(record, today)).length
}

export function filterDebts(
  records: DebtRecord[],
  searchValue: string,
  statusFilter: DebtStatusFilter,
  categoryFilter: string,
) {
  const query = searchValue.trim().toLocaleLowerCase('uz-UZ')
  const normalizedCategoryFilter = categoryFilter.trim().toLocaleLowerCase('uz-UZ')

  return [...records]
    .filter((record) => {
      if (!query) {
        return true
      }

      return [
        record.personOrCompany,
        record.category,
        record.reason,
        record.phone,
        record.note,
        record.status,
        String(record.amount),
      ]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase('uz-UZ').includes(query))
    })
    .filter((record) => (statusFilter === 'all' ? true : record.status === statusFilter))
    .filter((record) =>
      normalizedCategoryFilter
        ? record.category.trim().toLocaleLowerCase('uz-UZ') === normalizedCategoryFilter
        : true,
    )
    .sort((left, right) => {
      const byDate = +new Date(right.date) - +new Date(left.date)

      if (byDate !== 0) {
        return byDate
      }

      return +new Date(right.dueDate || right.date) - +new Date(left.dueDate || left.date)
    })
}
