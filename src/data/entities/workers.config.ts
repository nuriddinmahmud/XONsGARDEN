import { createElement } from 'react'
import type { EntityPageConfig, Worker } from '../../types'
import { formatDate } from '../../utils/formatDate'
import { formatMoney } from '../../utils/formatMoney'
import { generateId, parseNumber, toInputValue } from '../../utils/helpers'

export const workersConfig: EntityPageConfig<Worker> = {
  storageKey: 'workers',
  title: 'Ishchilar',
  addLabel: "Qo'shish",
  searchPlaceholder: 'Qidirish',
  emptyTitle: "Ma'lumot yo'q",
  fields: [
    { name: 'date', label: 'Sana', type: 'date', required: true },
    { name: 'workerCount', label: 'Ishchi soni', type: 'number', required: true, min: 0 },
    { name: 'salaryPerOne', label: '1 ishchi uchun tarif', type: 'number', required: true, min: 0 },
    { name: 'totalSalary', label: 'Jami ish haqi', type: 'number', readOnly: true },
    { name: 'comment', label: 'Izoh', type: 'textarea' },
  ],
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    { key: 'workerCount', label: 'Ishchi', render: (row) => `${row.workerCount} ta` },
    { key: 'salaryPerOne', label: 'Tarif', render: (row, context) => formatMoney(row.salaryPerOne, context.currencyLabel) },
    {
      key: 'totalSalary',
      label: 'Jami',
      render: (row, context) =>
        createElement('span', { className: 'font-semibold text-slate-900' }, formatMoney(row.totalSalary, context.currencyLabel)),
    },
    { key: 'comment', label: 'Izoh', render: (row) => row.comment || '-' },
  ],
  getSearchText: (record) => `${record.workerCount} ${record.comment} ${record.salaryPerOne}`,
  getAmount: (record) => record.totalSalary,
  toFormValues: (record) => ({
    date: record.date,
    workerCount: toInputValue(record.workerCount),
    salaryPerOne: toInputValue(record.salaryPerOne),
    totalSalary: toInputValue(record.totalSalary),
    comment: record.comment,
  }),
  createRecord: (values, existingId) => {
    const workerCount = parseNumber(values.workerCount)
    const salaryPerOne = parseNumber(values.salaryPerOne)

    return {
      id: existingId ?? generateId('wrk'),
      date: values.date,
      workerCount,
      salaryPerOne,
      totalSalary: workerCount * salaryPerOne,
      comment: values.comment.trim(),
    }
  },
  deriveValues: (values) => {
    const totalSalary = parseNumber(values.workerCount) * parseNumber(values.salaryPerOne)
    return { ...values, totalSalary: toInputValue(totalSalary) }
  },
}
