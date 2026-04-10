import { createElement } from 'react'
import type { EntityPageConfig, Transport } from '../../types'
import { formatDate } from '../../utils/formatDate'
import { formatMoney } from '../../utils/formatMoney'
import { generateId, parseNumber, toInputValue } from '../../utils/helpers'

export const transportsConfig: EntityPageConfig<Transport> = {
  storageKey: 'transports',
  title: 'Transport',
  addLabel: "Qo'shish",
  searchPlaceholder: 'Qidirish',
  emptyTitle: "Ma'lumot yo'q",
  fields: [
    { name: 'date', label: 'Sana', type: 'date', required: true },
    { name: 'transportType', label: 'Transport turi', type: 'text', required: true },
    { name: 'cost', label: 'Xarajat', type: 'number', required: true, min: 0 },
    { name: 'comment', label: 'Izoh', type: 'textarea' },
  ],
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    { key: 'transportType', label: 'Transport', render: (row) => row.transportType },
    {
      key: 'cost',
      label: 'Xarajat',
      render: (row, context) =>
        createElement('span', { className: 'font-semibold text-slate-900' }, formatMoney(row.cost, context.currencyLabel)),
    },
    { key: 'comment', label: 'Izoh', render: (row) => row.comment || '-' },
  ],
  getSearchText: (record) => `${record.transportType} ${record.comment} ${record.cost}`,
  getAmount: (record) => record.cost,
  toFormValues: (record) => ({
    date: record.date,
    transportType: record.transportType,
    cost: toInputValue(record.cost),
    comment: record.comment,
  }),
  createRecord: (values, existingId) => ({
    id: existingId ?? generateId('trn'),
    date: values.date,
    transportType: values.transportType.trim(),
    cost: parseNumber(values.cost),
    comment: values.comment.trim(),
  }),
}
