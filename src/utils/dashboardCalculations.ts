import type { SummaryCardItem } from '../types'
import type { DashboardAlertItem, DashboardRecentItem } from '../types/report'
import type { DebtRecord } from '../types/debt'
import type { IncomeRecord } from '../types/income'
import { DEBT_STATUS_META, getDebtTotals, isDebtOverdue } from './debtCalculations'
import { formatShortDate } from './formatDate'
import { getTodayDate } from './helpers'
import { isIncomeInCurrentMonth, isIncomeOnDate } from './incomeCalculations'

const DAY_IN_MS = 24 * 60 * 60 * 1000

function sortIncomeRecords(records: IncomeRecord[]) {
  return [...records].sort((left, right) => {
    const byDate = +new Date(right.date) - +new Date(left.date)

    if (byDate !== 0) {
      return byDate
    }

    return +(new Date(right.createdAt ?? 0)) - +(new Date(left.createdAt ?? 0))
  })
}

function sortDebtRecords(records: DebtRecord[]) {
  return [...records].sort((left, right) => {
    const byDate = +new Date(right.date) - +new Date(left.date)

    if (byDate !== 0) {
      return byDate
    }

    return +new Date(right.dueDate || right.date) - +new Date(left.dueDate || left.date)
  })
}

function getAverageAmount(values: number[]) {
  if (!values.length) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function buildDailyRange(days: number, today = getTodayDate()) {
  const todayDate = new Date(`${today}T00:00:00`)

  return Array.from({ length: days }, (_, index) => {
    const cursor = new Date(todayDate)
    cursor.setDate(todayDate.getDate() - (days - 1 - index))
    const isoDate = cursor.toISOString().slice(0, 10)

    return {
      date: isoDate,
      label: formatShortDate(isoDate),
    }
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

export function getDashboardSummaryItems(
  incomeRecords: IncomeRecord[],
  debts: DebtRecord[],
  today = getTodayDate(),
): SummaryCardItem[] {
  const debtTotals = getDebtTotals(debts)
  const todayIncomeRecords = incomeRecords.filter((record) => isIncomeOnDate(record, today))
  const todayIncome = todayIncomeRecords.reduce((sum, record) => sum + record.amount, 0)
  const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0)

  return [
    {
      key: 'dashboard_income_total',
      label: 'Jami daromad',
      total: totalIncome,
      count: incomeRecords.length,
      color: '#10b981',
    },
    {
      key: 'dashboard_income_today',
      label: 'Bugungi daromad',
      total: todayIncome,
      count: todayIncomeRecords.length,
      color: '#0ea5e9',
    },
    {
      key: 'dashboard_debt_total',
      label: 'Jami qarzdorlik',
      total: debtTotals.total,
      count: debts.length,
      color: '#7c2d12',
    },
    {
      key: 'dashboard_debt_unpaid',
      label: "To'lanmagan qarzdorlik",
      total: debtTotals.unpaid,
      count: debtTotals.unpaidCount,
      color: DEBT_STATUS_META["to'lanmagan"].summaryColor,
    },
    {
      key: 'dashboard_debt_partial',
      label: "Qisman to'langan qarzdorlik",
      total: debtTotals.partial,
      count: debtTotals.partialCount,
      color: DEBT_STATUS_META["qisman to'langan"].summaryColor,
    },
    {
      key: 'dashboard_debt_paid',
      label: "To'langan qarzdorlik",
      total: debtTotals.paid,
      count: debtTotals.paidCount,
      color: DEBT_STATUS_META["to'langan"].summaryColor,
    },
  ]
}

export function getRecentIncomeItems(records: IncomeRecord[], count = 5): DashboardRecentItem[] {
  return sortIncomeRecords(records)
    .slice(0, count)
    .map((record) => ({
      id: record.id,
      title: record.reason,
      subtitle: record.sourceLocation || "Manba ko'rsatilmagan",
      amount: record.amount,
      date: record.date,
      badgeLabel: 'Daromad',
      badgeClass: 'bg-emerald-50 text-emerald-700',
      accentColor: '#10b981',
    }))
}

export function getRecentDebtItems(
  records: DebtRecord[],
  count = 5,
  today = getTodayDate(),
): DashboardRecentItem[] {
  return sortDebtRecords(records)
    .slice(0, count)
    .map((record) => ({
      id: record.id,
      title: record.personOrCompany,
      subtitle: record.reason,
      amount: record.amount,
      date: record.date,
      badgeLabel: isDebtOverdue(record, today)
        ? "Muddati o'tgan"
        : DEBT_STATUS_META[record.status].label,
      badgeClass: isDebtOverdue(record, today)
        ? 'bg-rose-50 text-rose-700'
        : DEBT_STATUS_META[record.status].badgeClass,
      accentColor: isDebtOverdue(record, today)
        ? '#e11d48'
        : DEBT_STATUS_META[record.status].summaryColor,
    }))
}

export function getIncomeTrendByDate(
  records: IncomeRecord[],
  days = 10,
  today = getTodayDate(),
) {
  const range = buildDailyRange(days, today)

  return range.map((entry) => {
    const dayRecords = records.filter((record) => record.date === entry.date)

    return {
      date: entry.date,
      label: entry.label,
      total: dayRecords.reduce((sum, record) => sum + record.amount, 0),
      count: dayRecords.length,
    }
  })
}

export function getDebtStatusDistribution(records: DebtRecord[]) {
  const totals = getDebtTotals(records)

  return [
    {
      key: "to'lanmagan",
      label: DEBT_STATUS_META["to'lanmagan"].label,
      total: totals.unpaid,
      count: totals.unpaidCount,
      color: DEBT_STATUS_META["to'lanmagan"].summaryColor,
    },
    {
      key: "qisman to'langan",
      label: DEBT_STATUS_META["qisman to'langan"].label,
      total: totals.partial,
      count: totals.partialCount,
      color: DEBT_STATUS_META["qisman to'langan"].summaryColor,
    },
    {
      key: "to'langan",
      label: DEBT_STATUS_META["to'langan"].label,
      total: totals.paid,
      count: totals.paidCount,
      color: DEBT_STATUS_META["to'langan"].summaryColor,
    },
  ].filter((entry) => entry.total > 0 || entry.count > 0)
}

export function getMonthlyIncomeVsDebtComparison(
  incomeRecords: IncomeRecord[],
  debts: DebtRecord[],
  months = 6,
  today = getTodayDate(),
) {
  const cursor = new Date(`${today}T00:00:00`)
  const result: Array<Record<string, number | string>> = []

  for (let index = months - 1; index >= 0; index -= 1) {
    const monthDate = new Date(cursor.getFullYear(), cursor.getMonth() - index, 1)
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`

    const incomeTotal = incomeRecords
      .filter((record) => record.date.slice(0, 7) === monthKey)
      .reduce((sum, record) => sum + record.amount, 0)

    const debtTotal = debts
      .filter((record) => record.date.slice(0, 7) === monthKey)
      .reduce((sum, record) => sum + record.amount, 0)

    const unpaidDebtTotal = debts
      .filter((record) => record.date.slice(0, 7) === monthKey && record.status !== "to'langan")
      .reduce((sum, record) => sum + record.amount, 0)

    result.push({
      month: new Intl.DateTimeFormat('uz-UZ', { month: 'short' }).format(monthDate),
      income: incomeTotal,
      debt: debtTotal,
      unpaidDebt: unpaidDebtTotal,
    })
  }

  return result
}

export function getDashboardAlerts(
  incomeRecords: IncomeRecord[],
  debts: DebtRecord[],
  today = getTodayDate(),
): DashboardAlertItem[] {
  const overdueAlerts = sortDebtRecords(debts)
    .filter((record) => isDebtOverdue(record, today))
    .slice(0, 3)
    .map((record) => ({
      id: `overdue_${record.id}`,
      title: `${record.personOrCompany} qarzi muddati o'tgan`,
      description: record.dueDate
        ? `${record.dueDate} muddat bilan belgilangan qarzni tekshiring.`
        : "Muddat o'tgan qarz holatini tekshiring.",
      tone: 'rose' as const,
      amount: record.amount,
      date: record.dueDate || record.date,
    }))

  const latestIncome = sortIncomeRecords(incomeRecords)[0]
  const latestIncomeAlert = latestIncome
    ? [
        {
          id: `latest_income_${latestIncome.id}`,
          title: "So'nggi daromad yozuvi",
          description: latestIncome.reason,
          tone: 'emerald' as const,
          amount: latestIncome.amount,
          date: latestIncome.date,
        },
      ]
    : []

  const incomeAverage = getAverageAmount(incomeRecords.map((record) => record.amount))
  const debtAverage = getAverageAmount(debts.map((record) => record.amount))
  const largestIncome = sortIncomeRecords(incomeRecords)[0]
  const largestDebt = sortDebtRecords(debts)[0]

  const unusualIncomeAlert =
    largestIncome && incomeRecords.length >= 4 && largestIncome.amount >= Math.max(incomeAverage * 1.8, 1)
      ? [
          {
            id: `large_income_${largestIncome.id}`,
            title: 'Yirik daromad yozuvi aniqlandi',
            description: `${largestIncome.reason} bo'yicha odatdagidan katta tushum yozilgan.`,
            tone: 'blue' as const,
            amount: largestIncome.amount,
            date: largestIncome.date,
          },
        ]
      : []

  const unusualDebtAlert =
    largestDebt && debts.length >= 4 && largestDebt.amount >= Math.max(debtAverage * 1.8, 1)
      ? [
          {
            id: `large_debt_${largestDebt.id}`,
            title: 'Yirik qarzdorlik yozuvi aniqlandi',
            description: `${largestDebt.personOrCompany} bo'yicha katta miqdordagi majburiyat mavjud.`,
            tone: 'amber' as const,
            amount: largestDebt.amount,
            date: largestDebt.date,
          },
        ]
      : []

  return [...overdueAlerts, ...unusualDebtAlert, ...unusualIncomeAlert, ...latestIncomeAlert]
}

export function getFinancialHighlights(
  incomeRecords: IncomeRecord[],
  debts: DebtRecord[],
  expensesTotal: number,
  today = getTodayDate(),
) {
  const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0)
  const debtTotals = getDebtTotals(debts)
  const currentMonthIncome = incomeRecords
    .filter((record) => isIncomeInCurrentMonth(record, today))
    .reduce((sum, record) => sum + record.amount, 0)

  return {
    totalIncome,
    currentMonthIncome,
    unpaidDebtTotal: debtTotals.unpaid,
    totalDebt: debtTotals.total,
    netBalance: totalIncome - expensesTotal - debtTotals.unpaid,
    last30DaysIncome: incomeRecords
      .filter((record) => isDateInLastDays(record.date, 30, today))
      .reduce((sum, record) => sum + record.amount, 0),
  }
}
