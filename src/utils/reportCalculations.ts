import { categoryMeta, getAmountByRecord } from './calculations'
import { DEBT_STATUS_META } from './debtCalculations'
import { formatDate, formatMonthLabel } from './formatDate'
import { getTodayDate } from './helpers'
import type { SummaryCardItem, EntityKey, EntityRecord, RecordsMap } from '../types'
import type { DebtStatus } from '../types/debt'
import type { DebtRecord } from '../types/debt'
import type { IncomeRecord } from '../types/income'
import type {
  ReportDebtStatusFilter,
  ReportGroupBy,
  ReportGroupSection,
  ReportModuleFilter,
  ReportModuleType,
  ReportRow,
} from '../types/report'

const DAY_IN_MS = 24 * 60 * 60 * 1000

const expenseRouteMap: Record<EntityKey, string> = {
  workers: '/workers',
  foods: '/food',
  fertilizers: '/fertilizer',
  transports: '/transport',
  energies: '/energy',
  oils: '/oil',
  remonts: '/remont',
  taxes: '/tax',
  drainages: '/drainage',
}

const debtStatusOrder: Record<DebtStatus, number> = {
  "to'lanmagan": 0,
  "qisman to'langan": 1,
  "to'langan": 2,
}

export const reportModuleMeta: Record<
  ReportModuleType,
  { label: string; color: string; badgeClass: string; path: string }
> = {
  workers: { ...categoryMeta.workers, path: expenseRouteMap.workers },
  foods: { ...categoryMeta.foods, path: expenseRouteMap.foods },
  fertilizers: { ...categoryMeta.fertilizers, path: expenseRouteMap.fertilizers },
  transports: { ...categoryMeta.transports, path: expenseRouteMap.transports },
  energies: { ...categoryMeta.energies, path: expenseRouteMap.energies },
  oils: { ...categoryMeta.oils, path: expenseRouteMap.oils },
  remonts: { ...categoryMeta.remonts, path: expenseRouteMap.remonts },
  taxes: { ...categoryMeta.taxes, path: expenseRouteMap.taxes },
  drainages: { ...categoryMeta.drainages, path: expenseRouteMap.drainages },
  income: {
    label: 'Daromad',
    color: '#10b981',
    badgeClass: 'bg-emerald-50 text-emerald-700',
    path: '/income',
  },
  debt: {
    label: 'Qarzdorlik',
    color: '#b45309',
    badgeClass: 'bg-amber-50 text-amber-700',
    path: '/debts',
  },
}

export const reportModuleOptions: Array<{ value: ReportModuleFilter; label: string }> = [
  { value: 'all', label: 'Barchasi' },
  { value: 'income', label: 'Daromad' },
  { value: 'debt', label: 'Qarzdorlik' },
  { value: 'workers', label: 'Ishchilar' },
  { value: 'foods', label: 'Oziq-ovqat' },
  { value: 'fertilizers', label: "O'g'it" },
  { value: 'transports', label: 'Transport' },
  { value: 'energies', label: 'Energiya' },
  { value: 'oils', label: "Yog'" },
  { value: 'remonts', label: 'Remont' },
  { value: 'taxes', label: 'Soliq' },
  { value: 'drainages', label: 'Drenaj' },
]

export const reportGroupOptions: Array<{ value: ReportGroupBy; label: string }> = [
  { value: 'none', label: 'Guruhsiz' },
  { value: 'date', label: "Sana bo'yicha" },
  { value: 'module', label: "Modul bo'yicha" },
  { value: 'debt_status', label: "Qarz holati bo'yicha" },
  { value: 'category', label: "Kategoriya bo'yicha" },
  { value: 'month', label: "Oy bo'yicha" },
]

function recordsEntries(recordsMap: RecordsMap) {
  return Object.entries(recordsMap) as [EntityKey, RecordsMap[EntityKey]][]
}

function toSearchText(value: Record<string, unknown>) {
  return Object.values(value)
    .filter((item) => item !== undefined && item !== null)
    .join(' ')
    .toLocaleLowerCase('uz-UZ')
}

function getExpenseTitle(key: EntityKey, record: EntityRecord) {
  if ('shopName' in record) {
    return record.shopName
  }

  if ('fertilizerType' in record) {
    return record.fertilizerType
  }

  if ('transportType' in record) {
    return record.transportType
  }

  if ('workerCount' in record) {
    return `${record.workerCount} ishchi`
  }

  if ('hoursWorked' in record) {
    return 'Drenaj ishlari'
  }

  return categoryMeta[key].label
}

function getExpenseSubtitle(record: EntityRecord) {
  if ('comment' in record && record.comment) {
    return record.comment
  }

  if ('workerCount' in record) {
    return `${record.workerCount} ta ishchi`
  }

  if ('machineCount' in record) {
    return `${record.machineCount} texnika`
  }

  if ('shopName' in record) {
    return "Do'kon xarajati"
  }

  return "Qo'shimcha ma'lumot yo'q"
}

function getExpenseCategory(key: EntityKey, record: EntityRecord) {
  if ('fertilizerType' in record) {
    return record.fertilizerType
  }

  if ('transportType' in record) {
    return record.transportType
  }

  if ('workerCount' in record) {
    return 'Ish haqi'
  }

  if ('shopName' in record) {
    return "Do'kon"
  }

  if ('hoursWorked' in record) {
    return 'Drenaj'
  }

  return categoryMeta[key].label
}

function getExpenseExtraInfo(record: EntityRecord) {
  if ('comment' in record && record.comment) {
    return record.comment
  }

  if ('tonAmount' in record) {
    return `${record.tonAmount} tonna`
  }

  if ('hoursWorked' in record) {
    return `${record.hoursWorked} soat`
  }

  return ''
}

function toReportRowDateValue(value?: string) {
  return value ? +new Date(value) : 0
}

function sortReportRows(rows: ReportRow[]) {
  return [...rows].sort((left, right) => {
    const byDate = +new Date(right.date) - +new Date(left.date)

    if (byDate !== 0) {
      return byDate
    }

    return toReportRowDateValue(right.createdAt) - toReportRowDateValue(left.createdAt)
  })
}

function isDateInLastDays(value: string, days: number, today = getTodayDate()) {
  const todayStamp = +new Date(`${today}T00:00:00`)
  const valueStamp = +new Date(`${value}T00:00:00`)

  if (Number.isNaN(todayStamp) || Number.isNaN(valueStamp)) {
    return false
  }

  const rangeStart = todayStamp - (days - 1) * DAY_IN_MS
  return valueStamp >= rangeStart && valueStamp <= todayStamp
}

export function buildReportRows(
  recordsMap: RecordsMap,
  incomeRecords: IncomeRecord[],
  debts: DebtRecord[],
): ReportRow[] {
  const expenseRows = recordsEntries(recordsMap).flatMap(([key, records]) =>
    records.map((record: EntityRecord) => ({
      id: `${key}_${record.id}`,
      date: record.date,
      moduleType: key,
      moduleLabel: reportModuleMeta[key].label,
      modulePath: reportModuleMeta[key].path,
      title: getExpenseTitle(key, record),
      subtitle: getExpenseSubtitle(record),
      categoryLabel: getExpenseCategory(key, record),
      amount: getAmountByRecord(record),
      extraInfo: getExpenseExtraInfo(record),
      searchText: `${reportModuleMeta[key].label} ${toSearchText(record as unknown as Record<string, unknown>)}`,
      accentColor: reportModuleMeta[key].color,
      badgeClass: reportModuleMeta[key].badgeClass,
    }))
  )

  const incomeRows = incomeRecords.map((record) => ({
    id: `income_${record.id}`,
    date: record.date,
    moduleType: 'income' as const,
    moduleLabel: reportModuleMeta.income.label,
    modulePath: reportModuleMeta.income.path,
    title: record.reason,
    subtitle: record.sourceLocation || "Manba ko'rsatilmagan",
    categoryLabel: 'Daromad',
    amount: record.amount,
    extraInfo: record.comment || record.sourceLocation || '',
    searchText: `${reportModuleMeta.income.label} ${toSearchText(record as unknown as Record<string, unknown>)}`,
    accentColor: reportModuleMeta.income.color,
    badgeClass: reportModuleMeta.income.badgeClass,
    createdAt: record.createdAt,
  }))

  const debtRows = debts.map((record) => ({
    id: `debt_${record.id}`,
    date: record.date,
    moduleType: 'debt' as const,
    moduleLabel: reportModuleMeta.debt.label,
    modulePath: reportModuleMeta.debt.path,
    title: record.personOrCompany,
    subtitle: record.reason,
    categoryLabel: record.category,
    debtStatus: record.status,
    amount: record.amount,
    extraInfo: [record.note, record.phone, record.dueDate ? `Muddat: ${record.dueDate}` : null]
      .filter(Boolean)
      .join(' • '),
    searchText: `${reportModuleMeta.debt.label} ${toSearchText(record as unknown as Record<string, unknown>)}`,
    accentColor: reportModuleMeta.debt.color,
    badgeClass: reportModuleMeta.debt.badgeClass,
  }))

  return sortReportRows([...expenseRows, ...incomeRows, ...debtRows])
}

export function filterReportRows(
  rows: ReportRow[],
  moduleFilter: ReportModuleFilter,
  searchValue: string,
  dateFromValue: string,
  dateToValue: string,
  debtStatusFilter: ReportDebtStatusFilter,
) {
  const query = searchValue.trim().toLocaleLowerCase('uz-UZ')

  return rows
    .filter((row) => (moduleFilter === 'all' ? true : row.moduleType === moduleFilter))
    .filter((row) => (dateFromValue ? row.date >= dateFromValue : true))
    .filter((row) => (dateToValue ? row.date <= dateToValue : true))
    .filter((row) =>
      debtStatusFilter === 'all'
        ? true
        : row.moduleType === 'debt' && row.debtStatus === debtStatusFilter,
    )
    .filter((row) => (query ? row.searchText.includes(query) : true))
}

export function getReportSummaryItems(rows: ReportRow[], today = getTodayDate()): SummaryCardItem[] {
  const incomeRows = rows.filter((row) => row.moduleType === 'income')
  const debtRows = rows.filter((row) => row.moduleType === 'debt')
  const unpaidDebtRows = debtRows.filter((row) => row.debtStatus === "to'lanmagan")
  const paidDebtRows = debtRows.filter((row) => row.debtStatus === "to'langan")
  const thisMonthIncome = incomeRows.filter((row) => row.date.slice(0, 7) === today.slice(0, 7))
  const last30DayDebtRows = debtRows.filter((row) => isDateInLastDays(row.date, 30, today))

  return [
    {
      key: 'report_income_total',
      label: 'Umumiy daromad',
      total: incomeRows.reduce((sum, row) => sum + row.amount, 0),
      count: incomeRows.length,
      color: '#10b981',
    },
    {
      key: 'report_debt_total',
      label: 'Umumiy qarzdorlik',
      total: debtRows.reduce((sum, row) => sum + row.amount, 0),
      count: debtRows.length,
      color: '#7c2d12',
    },
    {
      key: 'report_debt_unpaid',
      label: "To'lanmagan qarzdorlik",
      total: unpaidDebtRows.reduce((sum, row) => sum + row.amount, 0),
      count: unpaidDebtRows.length,
      color: DEBT_STATUS_META["to'lanmagan"].summaryColor,
    },
    {
      key: 'report_debt_paid',
      label: "To'langan qarzdorlik",
      total: paidDebtRows.reduce((sum, row) => sum + row.amount, 0),
      count: paidDebtRows.length,
      color: DEBT_STATUS_META["to'langan"].summaryColor,
    },
    {
      key: 'report_income_month',
      label: 'Shu oy daromadi',
      total: thisMonthIncome.reduce((sum, row) => sum + row.amount, 0),
      count: thisMonthIncome.length,
      color: '#0ea5e9',
    },
    {
      key: 'report_debt_last_30',
      label: "So'nggi 30 kun qarzdorligi",
      total: last30DayDebtRows.reduce((sum, row) => sum + row.amount, 0),
      count: last30DayDebtRows.length,
      color: '#f59e0b',
    },
  ]
}

export function getReportNetBalance(rows: ReportRow[]) {
  const incomeTotal = rows
    .filter((row) => row.moduleType === 'income')
    .reduce((sum, row) => sum + row.amount, 0)
  const expenseTotal = rows
    .filter((row) => row.moduleType !== 'income' && row.moduleType !== 'debt')
    .reduce((sum, row) => sum + row.amount, 0)
  const unpaidDebtTotal = rows
    .filter((row) => row.moduleType === 'debt' && row.debtStatus === "to'lanmagan")
    .reduce((sum, row) => sum + row.amount, 0)

  return incomeTotal - expenseTotal - unpaidDebtTotal
}

export function getReportModuleSummaries(rows: ReportRow[]): SummaryCardItem[] {
  const totals = new Map<ReportModuleType, SummaryCardItem>()

  for (const row of rows) {
    const current = totals.get(row.moduleType)

    if (current) {
      current.total += row.amount
      current.count += 1
    } else {
      totals.set(row.moduleType, {
        key: row.moduleType,
        label: row.moduleLabel,
        total: row.amount,
        count: 1,
        color: row.accentColor,
      })
    }
  }

  return [...totals.values()].sort((left, right) => right.total - left.total)
}

export function getReportMonthlyDatasets(rows: ReportRow[], months = 6, today = getTodayDate()) {
  const now = new Date(`${today}T00:00:00`)
  const result: Array<Record<string, number | string>> = []

  for (let index = months - 1; index >= 0; index -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - index, 1)
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
    const monthRows = rows.filter((row) => row.date.slice(0, 7) === monthKey)

    const income = monthRows
      .filter((row) => row.moduleType === 'income')
      .reduce((sum, row) => sum + row.amount, 0)
    const debt = monthRows
      .filter((row) => row.moduleType === 'debt')
      .reduce((sum, row) => sum + row.amount, 0)
    const expenses = monthRows
      .filter((row) => row.moduleType !== 'income' && row.moduleType !== 'debt')
      .reduce((sum, row) => sum + row.amount, 0)

    result.push({
      month: new Intl.DateTimeFormat('uz-UZ', { month: 'short' }).format(monthDate),
      income,
      debt,
      expenses,
      balance: income - expenses - debt,
    })
  }

  return result
}

export function groupReportRows(rows: ReportRow[], groupBy: ReportGroupBy): ReportGroupSection[] {
  if (groupBy === 'none') {
    return rows.length
      ? [
          {
            key: 'all',
            label: 'Barcha yozuvlar',
            total: rows.reduce((sum, row) => sum + row.amount, 0),
            rows,
          },
        ]
      : []
  }

  const groups = new Map<string, ReportGroupSection>()

  for (const row of rows) {
    let groupKey = ''
    let groupLabel = ''

    if (groupBy === 'date') {
      groupKey = row.date
      groupLabel = formatDate(row.date)
    } else if (groupBy === 'module') {
      groupKey = row.moduleType
      groupLabel = row.moduleLabel
    } else if (groupBy === 'debt_status') {
      groupKey = row.debtStatus ?? 'other'
      groupLabel =
        row.debtStatus ? DEBT_STATUS_META[row.debtStatus].label : "Qarz bo'lmagan yozuvlar"
    } else if (groupBy === 'category') {
      groupKey = row.categoryLabel ?? row.moduleLabel
      groupLabel = row.categoryLabel ?? row.moduleLabel
    } else {
      groupKey = row.date.slice(0, 7)
      groupLabel = formatMonthLabel(row.date)
    }

    const current = groups.get(groupKey)

    if (current) {
      current.rows.push(row)
      current.total += row.amount
    } else {
      groups.set(groupKey, {
        key: groupKey,
        label: groupLabel,
        total: row.amount,
        rows: [row],
      })
    }
  }

  const sections = [...groups.values()].map((section) => ({
    ...section,
    rows: sortReportRows(section.rows),
  }))

  sections.sort((left, right) => {
    if (groupBy === 'date' || groupBy === 'month') {
      return right.key.localeCompare(left.key)
    }

    if (groupBy === 'debt_status') {
      const leftOrder = left.key in debtStatusOrder ? debtStatusOrder[left.key as DebtStatus] : 99
      const rightOrder = right.key in debtStatusOrder ? debtStatusOrder[right.key as DebtStatus] : 99
      return leftOrder - rightOrder
    }

    return right.total - left.total
  })

  return sections
}
