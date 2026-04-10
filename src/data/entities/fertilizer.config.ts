import { createElement } from 'react'
import type { EntityPageConfig, Fertilizer } from '../../types'
import { formatDate } from '../../utils/formatDate'
import { formatMoney } from '../../utils/formatMoney'
import { generateId, parseNumber, toInputValue } from '../../utils/helpers'

export const fertilizersConfig: EntityPageConfig<Fertilizer> = {
  storageKey: 'fertilizers',
  title: "O'g'it",
  addLabel: "Qo'shish",
  searchPlaceholder: 'Qidirish',
  emptyTitle: "Ma'lumot yo'q",
  fields: [
    { name: 'date', label: 'Sana', type: 'date', required: true },
    { name: 'fertilizerType', label: "O'g'it turi", type: 'text', required: true },
    { name: 'machineCount', label: 'Texnika soni', type: 'number', required: true, min: 0 },
    { name: 'tonAmount', label: 'Tonna miqdori', type: 'number', required: true, min: 0, step: 0.1 },
    { name: 'cost', label: 'Xarajat', type: 'number', required: true, min: 0 },
    { name: 'comment', label: 'Izoh', type: 'textarea' },
  ],
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    { key: 'fertilizerType', label: 'Turi', render: (row) => row.fertilizerType },
    { key: 'machineCount', label: 'Texnika', render: (row) => `${row.machineCount} ta` },
    { key: 'tonAmount', label: 'Tonna', render: (row) => `${row.tonAmount} t` },
    {
      key: 'cost',
      label: 'Xarajat',
      render: (row, context) =>
        createElement('span', { className: 'font-semibold text-slate-900' }, formatMoney(row.cost, context.currencyLabel)),
    },
  ],
  getSearchText: (record) =>
    `${record.fertilizerType} ${record.machineCount} ${record.tonAmount} ${record.comment}`,
  getAmount: (record) => record.cost,
  toFormValues: (record) => ({
    date: record.date,
    fertilizerType: record.fertilizerType,
    machineCount: toInputValue(record.machineCount),
    tonAmount: toInputValue(record.tonAmount),
    cost: toInputValue(record.cost),
    comment: record.comment,
  }),
  createRecord: (values, existingId) => ({
    id: existingId ?? generateId('fert'),
    date: values.date,
    fertilizerType: values.fertilizerType.trim(),
    machineCount: parseNumber(values.machineCount),
    tonAmount: parseNumber(values.tonAmount),
    cost: parseNumber(values.cost),
    comment: values.comment.trim(),
  }),
}
