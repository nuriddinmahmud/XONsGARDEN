import { createElement } from 'react'
import type { EntityPageConfig, Food } from '../../types'
import { formatDate } from '../../utils/formatDate'
import { formatMoney } from '../../utils/formatMoney'
import { generateId, parseNumber, toInputValue } from '../../utils/helpers'

export const foodsConfig: EntityPageConfig<Food> = {
  storageKey: 'foods',
  title: 'Oziq-ovqat',
  addLabel: "Qo'shish",
  searchPlaceholder: 'Qidirish',
  emptyTitle: "Ma'lumot yo'q",
  fields: [
    { name: 'date', label: 'Sana', type: 'date', required: true },
    { name: 'shopName', label: "Do'kon yoki manba", type: 'text', required: true },
    { name: 'price', label: 'Narx', type: 'number', required: true, min: 0 },
  ],
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    { key: 'shopName', label: 'Manba', render: (row) => row.shopName },
    {
      key: 'price',
      label: 'Xarajat',
      render: (row, context) =>
        createElement('span', { className: 'font-semibold text-slate-900' }, formatMoney(row.price, context.currencyLabel)),
    },
  ],
  getSearchText: (record) => `${record.shopName} ${record.price}`,
  getAmount: (record) => record.price,
  toFormValues: (record) => ({
    date: record.date,
    shopName: record.shopName,
    price: toInputValue(record.price),
  }),
  createRecord: (values, existingId) => ({
    id: existingId ?? generateId('food'),
    date: values.date,
    shopName: values.shopName.trim(),
    price: parseNumber(values.price),
  }),
}
