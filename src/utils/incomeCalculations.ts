import type { SummaryCardItem } from '../types'
import type { IncomeRecord } from '../types/income'
import { getTodayDate } from './helpers'

const DAY_IN_MS = 24 * 60 * 60 * 1000

function toDateStamp(value: string) {
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? Number.NaN : parsed.getTime()
}

export function isIncomeOnDate(record: IncomeRecord, targetDate: string) {
  return record.date === targetDate
}

export function isIncomeInCurrentMonth(record: IncomeRecord, today = getTodayDate()) {
  return record.date.slice(0, 7) === today.slice(0, 7)
}

export function isIncomeInLastDays(record: IncomeRecord, days: number, today = getTodayDate()) {
  const todayStamp = toDateStamp(today)
  const recordStamp = toDateStamp(record.date)

  if (Number.isNaN(todayStamp) || Number.isNaN(recordStamp)) {
    return false
  }

  const rangeStart = todayStamp - (days - 1) * DAY_IN_MS
  return recordStamp >= rangeStart && recordStamp <= todayStamp
}

export function getIncomeSummaryItems(
  records: IncomeRecord[],
  today = getTodayDate(),
): SummaryCardItem[] {
  const total = records.reduce((sum, record) => sum + record.amount, 0)
  const todayRecords = records.filter((record) => isIncomeOnDate(record, today))
  const monthRecords = records.filter((record) => isIncomeInCurrentMonth(record, today))
  const last30DaysRecords = records.filter((record) => isIncomeInLastDays(record, 30, today))

  return [
    {
      key: 'income_total',
      label: 'Jami daromad',
      total,
      count: records.length,
      color: '#0f172a',
    },
    {
      key: 'income_today',
      label: 'Bugungi daromad',
      total: todayRecords.reduce((sum, record) => sum + record.amount, 0),
      count: todayRecords.length,
      color: '#10b981',
    },
    {
      key: 'income_month',
      label: 'Shu oydagi daromad',
      total: monthRecords.reduce((sum, record) => sum + record.amount, 0),
      count: monthRecords.length,
      color: '#0ea5e9',
    },
    {
      key: 'income_last_30',
      label: "So'nggi 30 kundagi daromad",
      total: last30DaysRecords.reduce((sum, record) => sum + record.amount, 0),
      count: last30DaysRecords.length,
      color: '#f59e0b',
    },
  ]
}

export function filterIncomeRecords(
  records: IncomeRecord[],
  searchValue: string,
  dateFromValue: string,
  dateToValue: string,
) {
  const query = searchValue.trim().toLocaleLowerCase('uz-UZ')

  return [...records]
    .filter((record) => {
      if (!query) {
        return true
      }

      return [
        record.reason,
        record.sourceLocation,
        record.comment,
        record.date,
        String(record.amount),
      ]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase('uz-UZ').includes(query))
    })
    .filter((record) => (dateFromValue ? record.date >= dateFromValue : true))
    .filter((record) => (dateToValue ? record.date <= dateToValue : true))
    .sort((left, right) => {
      const rightPrimary = toDateStamp(right.date)
      const leftPrimary = toDateStamp(left.date)

      if (rightPrimary !== leftPrimary) {
        return rightPrimary - leftPrimary
      }

      const rightCreated = right.createdAt ? new Date(right.createdAt).getTime() : 0
      const leftCreated = left.createdAt ? new Date(left.createdAt).getTime() : 0

      return rightCreated - leftCreated
    })
}
