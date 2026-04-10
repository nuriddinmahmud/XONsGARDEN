import { createElement } from 'react'
import type { Drainage, EntityPageConfig } from '../../types'
import { formatDate } from '../../utils/formatDate'
import { formatMoney } from '../../utils/formatMoney'
import { generateId, parseNumber, toInputValue } from '../../utils/helpers'

export const drainagesConfig: EntityPageConfig<Drainage> = {
  storageKey: 'drainages',
  title: 'Drenaj',
  addLabel: "Qo'shish",
  searchPlaceholder: 'Qidirish',
  emptyTitle: "Ma'lumot yo'q",
  fields: [
    { name: 'date', label: 'Sana', type: 'date', required: true },
    { name: 'hoursWorked', label: 'Ishlangan soat', type: 'number', required: true, min: 0 },
    { name: 'totalSalary', label: "Jami to'lov", type: 'number', required: true, min: 0 },
  ],
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    { key: 'hoursWorked', label: 'Soat', render: (row) => `${row.hoursWorked} soat` },
    {
      key: 'totalSalary',
      label: "To'lov",
      render: (row, context) =>
        createElement('span', { className: 'font-semibold text-slate-900' }, formatMoney(row.totalSalary, context.currencyLabel)),
    },
  ],
  getSearchText: (record) => `${record.hoursWorked} ${record.totalSalary}`,
  getAmount: (record) => record.totalSalary,
  toFormValues: (record) => ({
    date: record.date,
    hoursWorked: toInputValue(record.hoursWorked),
    totalSalary: toInputValue(record.totalSalary),
  }),
  createRecord: (values, existingId) => ({
    id: existingId ?? generateId('drn'),
    date: values.date,
    hoursWorked: parseNumber(values.hoursWorked),
    totalSalary: parseNumber(values.totalSalary),
  }),
}
