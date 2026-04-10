import { createElement } from 'react'
import type { EntityPageConfig, Tax } from '../../types'
import { formatDate } from '../../utils/formatDate'
import { formatMoney } from '../../utils/formatMoney'
import { generateId, parseNumber, toInputValue } from '../../utils/helpers'

export const taxesConfig: EntityPageConfig<Tax> = {
  storageKey: 'taxes',
  title: 'Soliq',
  addLabel: "Qo'shish",
  searchPlaceholder: 'Qidirish',
  emptyTitle: "Ma'lumot yo'q",
  fields: [
    { name: 'date', label: 'Sana', type: 'date', required: true },
    { name: 'amountPaid', label: "To'langan summa", type: 'number', required: true, min: 0 },
    { name: 'comment', label: 'Izoh', type: 'textarea' },
  ],
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    {
      key: 'amountPaid',
      label: "To'lov",
      render: (row, context) =>
        createElement('span', { className: 'font-semibold text-slate-900' }, formatMoney(row.amountPaid, context.currencyLabel)),
    },
    { key: 'comment', label: 'Izoh', render: (row) => row.comment || '-' },
  ],
  getSearchText: (record) => `${record.comment} ${record.amountPaid}`,
  getAmount: (record) => record.amountPaid,
  toFormValues: (record) => ({
    date: record.date,
    amountPaid: toInputValue(record.amountPaid),
    comment: record.comment,
  }),
  createRecord: (values, existingId) => ({
    id: existingId ?? generateId('tax'),
    date: values.date,
    amountPaid: parseNumber(values.amountPaid),
    comment: values.comment.trim(),
  }),
}
