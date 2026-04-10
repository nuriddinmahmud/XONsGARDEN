import type {
  CategorySummary,
  Drainage,
  Energy,
  EntityKey,
  EntityRecord,
  Fertilizer,
  Food,
  Oil,
  RecentActivity,
  RecordsMap,
  Remont,
  Tax,
  Transport,
  Worker,
} from '../types'

export const categoryMeta: Record<EntityKey, { label: string; color: string; badgeClass: string }> = {
  workers: { label: 'Ishchilar', color: '#0f766e', badgeClass: 'bg-emerald-50 text-emerald-700' },
  foods: { label: 'Oziq-ovqat', color: '#16a34a', badgeClass: 'bg-lime-50 text-lime-700' },
  fertilizers: { label: "O'g'it", color: '#65a30d', badgeClass: 'bg-emerald-100 text-emerald-800' },
  transports: { label: 'Transport', color: '#0f766e', badgeClass: 'bg-cyan-50 text-cyan-700' },
  energies: { label: 'Energiya', color: '#2563eb', badgeClass: 'bg-blue-50 text-blue-700' },
  oils: { label: "Yog'", color: '#f59e0b', badgeClass: 'bg-amber-50 text-amber-700' },
  remonts: { label: 'Remont', color: '#f97316', badgeClass: 'bg-orange-50 text-orange-700' },
  taxes: { label: 'Soliq', color: '#ef4444', badgeClass: 'bg-rose-50 text-rose-700' },
  drainages: { label: 'Drenaj', color: '#06b6d4', badgeClass: 'bg-sky-50 text-sky-700' },
}

const recordsEntries = (recordsMap: RecordsMap) =>
  Object.entries(recordsMap) as [EntityKey, RecordsMap[EntityKey]][]

export function getAmountByRecord(record: EntityRecord) {
  if ('workerCount' in record) {
    return (record as Worker).totalSalary
  }

  if ('hoursWorked' in record) {
    return (record as Drainage).totalSalary
  }

  if ('amountPaid' in record) {
    return (record as Energy | Tax).amountPaid
  }

  if ('cost' in record) {
    return (record as Fertilizer | Transport).cost
  }

  return (record as Food | Oil | Remont).price
}

export function getAllTotals(recordsMap: RecordsMap) {
  return Object.values(recordsMap)
    .flat()
    .reduce((sum, record) => sum + getAmountByRecord(record), 0)
}

export function getCategorySummaries(recordsMap: RecordsMap): CategorySummary[] {
  return recordsEntries(recordsMap).map(([key, records]) => ({
    key,
    label: categoryMeta[key].label,
    total: records.reduce((sum: number, record: EntityRecord) => sum + getAmountByRecord(record), 0),
    count: records.length,
    color: categoryMeta[key].color,
  }))
}

export function getHighestCategory(recordsMap: RecordsMap) {
  return [...getCategorySummaries(recordsMap)].sort((a, b) => b.total - a.total)[0]
}

export function getRecentActivities(recordsMap: RecordsMap): RecentActivity[] {
  return recordsEntries(recordsMap)
    .flatMap(([key, records]) =>
      records.map((record: EntityRecord) => ({
        id: record.id,
        category: key,
        label: categoryMeta[key].label,
        description: getDescription(record),
        amount: getAmountByRecord(record),
        date: record.date,
      })),
    )
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 7)
}

function getDescription(record: EntityRecord) {
  if ('shopName' in record) {
    return record.shopName
  }

  if ('fertilizerType' in record) {
    return `${record.fertilizerType}, ${record.tonAmount} tonna`
  }

  if ('transportType' in record) {
    return `${record.transportType} xizmati`
  }

  if ('workerCount' in record) {
    return `${record.workerCount} ishchi, ${record.comment || 'izohsiz'}`
  }

  if ('hoursWorked' in record) {
    return `${record.hoursWorked} soat drenaj ishlari`
  }

  return record.comment || "Izoh yo'q"
}

export function getCurrentMonthStats(recordsMap: RecordsMap) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const currentMonthRecords = Object.values(recordsMap)
    .flat()
    .filter((record) => {
      const date = new Date(record.date)
      return date.getFullYear() === year && date.getMonth() === month
    })

  const total = currentMonthRecords.reduce((sum, record) => sum + getAmountByRecord(record), 0)

  return {
    total,
    count: currentMonthRecords.length,
    average: currentMonthRecords.length ? Math.round(total / currentMonthRecords.length) : 0,
  }
}

export function getPreviousMonthTotal(recordsMap: RecordsMap) {
  const cursor = new Date()
  cursor.setMonth(cursor.getMonth() - 1)
  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  return Object.values(recordsMap)
    .flat()
    .filter((record) => {
      const date = new Date(record.date)
      return date.getFullYear() === year && date.getMonth() === month
    })
    .reduce((sum, record) => sum + getAmountByRecord(record), 0)
}

export function getMonthlyTrend(recordsMap: RecordsMap, months = 6) {
  const now = new Date()
  const result: Array<Record<string, number | string>> = []

  for (let index = months - 1; index >= 0; index -= 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - index, 1)
    const month = cursor.getMonth()
    const year = cursor.getFullYear()

    const entry: Record<string, number | string> = {
      month: new Intl.DateTimeFormat('uz-UZ', { month: 'short' }).format(cursor),
      jami: 0,
    }

    for (const [key, records] of recordsEntries(recordsMap)) {
      const monthTotal = records
        .filter((record: EntityRecord) => {
          const date = new Date(record.date)
          return date.getFullYear() === year && date.getMonth() === month
        })
        .reduce((sum: number, record: EntityRecord) => sum + getAmountByRecord(record), 0)

      entry[key] = monthTotal
      entry.jami = Number(entry.jami) + monthTotal
    }

    result.push(entry)
  }

  return result
}

export function getCurrentMonthCategoryTotals(recordsMap: RecordsMap) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  return recordsEntries(recordsMap).map(([key, records]) => ({
    key,
    label: categoryMeta[key].label,
    total: records
      .filter((record: EntityRecord) => {
        const date = new Date(record.date)
        return date.getFullYear() === year && date.getMonth() === month
      })
      .reduce((sum: number, record: EntityRecord) => sum + getAmountByRecord(record), 0),
  }))
}
