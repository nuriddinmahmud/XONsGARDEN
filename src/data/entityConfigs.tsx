import type { EntityPageConfig } from '../types'
import type {
  Drainage,
  Energy,
  Fertilizer,
  Food,
  Oil,
  Remont,
  Tax,
  Transport,
  Worker,
} from '../types'
import { formatCurrency, formatDate } from '../utils/formatDate'
import { generateId, parseNumber, toInputValue } from '../utils/helpers'

function formAmount(value: number) {
  return <span className="font-semibold text-slate-900">{formatCurrency(value)}</span>
}

export const workersConfig: EntityPageConfig<Worker> = {
  storageKey: 'workers',
  title: 'Ishchilar',
  description: 'Brigadalar soni, kunlik tarif va umumiy ish haqi nazorati.',
  addLabel: 'Yangi ishchi yozuvi',
  searchPlaceholder: "Izoh yoki ishchi soni bo'yicha qidiring",
  emptyTitle: "Ishchi yozuvlari yo'q",
  emptyDescription: "Birlamchi brigada ma'lumotlarini qo'shsangiz, ish haqi nazorati shu yerda paydo bo'ladi.",
  fields: [
    { name: 'date', label: 'Sana', type: 'date', required: true },
    { name: 'workerCount', label: 'Ishchi soni', type: 'number', required: true, min: 0 },
    { name: 'salaryPerOne', label: '1 ishchi uchun tarif', type: 'number', required: true, min: 0 },
    { name: 'totalSalary', label: 'Jami ish haqi', type: 'number', readOnly: true, helperText: 'Avtomatik hisoblanadi' },
    { name: 'comment', label: 'Izoh', type: 'textarea', placeholder: "Masalan, ko'chat ekish jamoasi" },
  ],
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    { key: 'workerCount', label: 'Ishchi', render: (row) => `${row.workerCount} ta` },
    { key: 'salaryPerOne', label: 'Tarif', render: (row) => formatCurrency(row.salaryPerOne) },
    { key: 'totalSalary', label: 'Jami', render: (row) => formAmount(row.totalSalary) },
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

export const foodsConfig: EntityPageConfig<Food> = {
  storageKey: 'foods',
  title: 'Oziq-ovqat',
  description: 'Ishchilar uchun ovqatlanish va kunlik xarid xarajatlari.',
  addLabel: "Yangi oziq-ovqat yozuvi",
  searchPlaceholder: "Do'kon yoki summa bo'yicha qidiring",
  emptyTitle: "Oziq-ovqat yozuvlari yo'q",
  emptyDescription: "Ovqatlanish xarajatlari qo'shilgach, bu bo'limda ko'rinadi.",
  fields: [
    { name: 'date', label: 'Sana', type: 'date', required: true },
    { name: 'shopName', label: "Do'kon yoki manba", type: 'text', required: true, placeholder: 'Masalan, Samarqand osh markazi' },
    { name: 'price', label: 'Narx', type: 'number', required: true, min: 0 },
  ],
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    { key: 'shopName', label: 'Manba', render: (row) => row.shopName },
    { key: 'price', label: 'Xarajat', render: (row) => formAmount(row.price) },
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

export const fertilizersConfig: EntityPageConfig<Fertilizer> = {
  storageKey: 'fertilizers',
  title: "O'g'it",
  description: "Mineral va organik o'g'itlar, texnika va tonnaj hisobi.",
  addLabel: "Yangi o'g'it yozuvi",
  searchPlaceholder: "Tur, izoh yoki tonna bo'yicha qidiring",
  emptyTitle: "O'g'it yozuvlari yo'q",
  emptyDescription: "Maydon resurslari uchun birinchi o'g'it xarajatini kiriting.",
  fields: [
    { name: 'date', label: 'Sana', type: 'date', required: true },
    { name: 'fertilizerType', label: "O'g'it turi", type: 'text', required: true, placeholder: 'Masalan, NPK aralashmasi' },
    { name: 'machineCount', label: 'Texnika soni', type: 'number', required: true, min: 0 },
    { name: 'tonAmount', label: 'Tonna miqdori', type: 'number', required: true, min: 0, step: 0.1 },
    { name: 'cost', label: 'Xarajat', type: 'number', required: true, min: 0 },
    { name: 'comment', label: 'Izoh', type: 'textarea', placeholder: "Qo'llanilgan sektor yoki maqsad" },
  ],
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    { key: 'fertilizerType', label: 'Turi', render: (row) => row.fertilizerType },
    { key: 'machineCount', label: 'Texnika', render: (row) => `${row.machineCount} ta` },
    { key: 'tonAmount', label: 'Tonna', render: (row) => `${row.tonAmount} t` },
    { key: 'cost', label: 'Xarajat', render: (row) => formAmount(row.cost) },
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

export const transportsConfig: EntityPageConfig<Transport> = {
  storageKey: 'transports',
  title: 'Transport',
  description: 'Texnika harakati, logistika va tashish xarajatlari.',
  addLabel: 'Yangi transport yozuvi',
  searchPlaceholder: "Transport turi yoki izoh bo'yicha qidiring",
  emptyTitle: "Transport yozuvlari yo'q",
  emptyDescription: "Tashish harajatlari qo'shilgach, bu yerda ko'rinadi.",
  fields: [
    { name: 'date', label: 'Sana', type: 'date', required: true },
    { name: 'transportType', label: 'Transport turi', type: 'text', required: true, placeholder: 'Masalan, yuk mashinasi' },
    { name: 'cost', label: 'Xarajat', type: 'number', required: true, min: 0 },
    { name: 'comment', label: 'Izoh', type: 'textarea', placeholder: 'Qayerga va nima uchun ishlatilgan' },
  ],
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    { key: 'transportType', label: 'Transport', render: (row) => row.transportType },
    { key: 'cost', label: 'Xarajat', render: (row) => formAmount(row.cost) },
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

const energyLikeCommonFields = [
  { name: 'date', label: 'Sana', type: 'date' as const, required: true },
  { name: 'amountPaid', label: "To'langan summa", type: 'number' as const, required: true, min: 0 },
  { name: 'comment', label: 'Izoh', type: 'textarea' as const, placeholder: "Qo'shimcha ma'lumot" },
]

export const energiesConfig: EntityPageConfig<Energy> = {
  storageKey: 'energies',
  title: 'Energiya',
  description: "Elektr, nasos, yoritish va quvvat bilan bog'liq to'lovlar.",
  addLabel: 'Yangi energiya yozuvi',
  searchPlaceholder: "Izoh yoki summa bo'yicha qidiring",
  emptyTitle: "Energiya yozuvlari yo'q",
  emptyDescription: "Energiya to'lovlarini shu bo'limda kuzatib boring.",
  fields: energyLikeCommonFields,
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    { key: 'amountPaid', label: "To'lov", render: (row) => formAmount(row.amountPaid) },
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
    id: existingId ?? generateId('eng'),
    date: values.date,
    amountPaid: parseNumber(values.amountPaid),
    comment: values.comment.trim(),
  }),
}

export const oilsConfig: EntityPageConfig<Oil> = {
  storageKey: 'oils',
  title: "Yog'",
  description: 'Generator, traktor va mexanizmlar uchun moylash xarajatlari.',
  addLabel: "Yangi yog' yozuvi",
  searchPlaceholder: "Izoh yoki summa bo'yicha qidiring",
  emptyTitle: "Yog' yozuvlari yo'q",
  emptyDescription: "Texnik moy xarajatlari qo'shilgach, bu sahifa jonlanadi.",
  fields: [
    { name: 'date', label: 'Sana', type: 'date', required: true },
    { name: 'price', label: 'Narx', type: 'number', required: true, min: 0 },
    { name: 'comment', label: 'Izoh', type: 'textarea', placeholder: 'Qaysi texnika uchun ishlatilgani' },
  ],
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    { key: 'price', label: 'Xarajat', render: (row) => formAmount(row.price) },
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

export const remontsConfig: EntityPageConfig<Remont> = {
  storageKey: 'remonts',
  title: 'Remont',
  description: "Ta'mirlash, ehtiyot qism va servis xarajatlari.",
  addLabel: 'Yangi remont yozuvi',
  searchPlaceholder: "Izoh yoki summa bo'yicha qidiring",
  emptyTitle: "Remont yozuvlari yo'q",
  emptyDescription: "Ta'mirlash xarajatlari shu bo'limda yig'iladi.",
  fields: [
    { name: 'date', label: 'Sana', type: 'date', required: true },
    { name: 'price', label: 'Narx', type: 'number', required: true, min: 0 },
    { name: 'comment', label: 'Izoh', type: 'textarea', placeholder: "Qaysi uskuna ta'mirlandi" },
  ],
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    { key: 'price', label: 'Xarajat', render: (row) => formAmount(row.price) },
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
    id: existingId ?? generateId('rem'),
    date: values.date,
    price: parseNumber(values.price),
    comment: values.comment.trim(),
  }),
}

export const taxesConfig: EntityPageConfig<Tax> = {
  storageKey: 'taxes',
  title: 'Soliq',
  description: "Yer, yig'im va boshqa majburiy to'lovlar nazorati.",
  addLabel: 'Yangi soliq yozuvi',
  searchPlaceholder: "Izoh yoki summa bo'yicha qidiring",
  emptyTitle: "Soliq yozuvlari yo'q",
  emptyDescription: "Majburiy to'lovlar yozuvlari shu yerda saqlanadi.",
  fields: energyLikeCommonFields,
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    { key: 'amountPaid', label: "To'lov", render: (row) => formAmount(row.amountPaid) },
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

export const drainagesConfig: EntityPageConfig<Drainage> = {
  storageKey: 'drainages',
  title: 'Drenaj',
  description: "Drenaj va suv yo'lagi bo'yicha ishlangan soat hamda jami to'lov.",
  addLabel: 'Yangi drenaj yozuvi',
  searchPlaceholder: "Soat yoki summa bo'yicha qidiring",
  emptyTitle: "Drenaj yozuvlari yo'q",
  emptyDescription: "Kanal va suv chiqarish ishlari yozuvlari shu sahifada turadi.",
  fields: [
    { name: 'date', label: 'Sana', type: 'date', required: true },
    { name: 'hoursWorked', label: 'Ishlangan soat', type: 'number', required: true, min: 0 },
    { name: 'totalSalary', label: "Jami to'lov", type: 'number', required: true, min: 0 },
  ],
  columns: [
    { key: 'date', label: 'Sana', render: (row) => formatDate(row.date) },
    { key: 'hoursWorked', label: 'Soat', render: (row) => `${row.hoursWorked} soat` },
    { key: 'totalSalary', label: "To'lov", render: (row) => formAmount(row.totalSalary) },
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
