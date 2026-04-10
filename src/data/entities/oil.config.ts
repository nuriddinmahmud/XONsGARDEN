import { createElement } from 'react'
import type { EntityPageConfig, Oil } from '../../types'
import { formatDate } from '../../utils/formatDate'
import { formatMoney } from '../../utils/formatMoney'
import { generateId, parseNumber, toInputValue } from '../../utils/helpers'

export const oilsConfig: EntityPageConfig<Oil> = {
  storageKey: 'oils',
  title: "Yog'",
  addLabel: "Qo'shish",
  searchPlaceholder: 'Qidirish',
  emptyTitle: "Ma'lumot yo'q",
  fields: [
    { name: 'date', label: 'Sana', type: 'date', required: true },
    { name: 'price', label: 'Narx', type: 'number', required: true, min: 0 },
    { name: 'comment', label: 'Izoh', type: 'textarea' },
  ],
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    {
      key: 'price',
      label: 'Xarajat',
      render: (row, context) =>
        createElement('span', { className: 'font-semibold text-slate-900' }, formatMoney(row.price, context.currencyLabel)),
    },
    { key: 'comment', label: 'Izoh', render: (row) => row.comment || '-' },
  ],
  getSearchText: (record) => `${record.comment} ${record.price}`,
  getAmount: (record) => record.price,
  toFormValues: (record) => ({
    date: record.date,
    price: toInputValue(record.price),
    comment: record.comment,
  }),
  createRecord: (values, existingId) => ({
    id: existingId ?? generateId('oil'),
    date: values.date,
    price: parseNumber(values.price),
    comment: values.comment.trim(),
  }),
}
