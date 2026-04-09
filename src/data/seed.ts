import { STATIC_ADMIN } from '../constants/auth'
import type {
  AppSettings,
  Drainage,
  Energy,
  Fertilizer,
  Food,
  Oil,
  RecordsMap,
  Remont,
  Tax,
  Transport,
  User,
  Worker,
} from '../types'
import { generateId } from '../utils/helpers'

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

export const demoUser: User = {
  id: generateId('user'),
  name: STATIC_ADMIN.name,
  email: STATIC_ADMIN.email,
  password: STATIC_ADMIN.password,
  createdAt: new Date().toISOString(),
}

export const demoSettings: AppSettings = {
  gardenName: "XON's Garden",
  managerName: 'Nuriddin Xasanov',
  phone: '+998 90 123 45 67',
  location: 'Toshkent viloyati, Qibray tumani',
  currencyLabel: "so'm",
}

const workers: Worker[] = [
  { id: generateId('wrk'), date: daysAgo(1), workerCount: 14, salaryPerOne: 180000, totalSalary: 2520000, comment: "Bahorgi ko'chat ekish jamoasi" },
  { id: generateId('wrk'), date: daysAgo(5), workerCount: 11, salaryPerOne: 170000, totalSalary: 1870000, comment: 'Issiqxona tozalash ishlari' },
  { id: generateId('wrk'), date: daysAgo(12), workerCount: 9, salaryPerOne: 160000, totalSalary: 1440000, comment: "Tomchilatib sug'orish nazorati" },
  { id: generateId('wrk'), date: daysAgo(18), workerCount: 15, salaryPerOne: 175000, totalSalary: 2625000, comment: 'Hosil saralash va omborlash' },
  { id: generateId('wrk'), date: daysAgo(33), workerCount: 10, salaryPerOne: 165000, totalSalary: 1650000, comment: "Bog' qatorlarini parvarishlash" },
]

const foods: Food[] = [
  { id: generateId('food'), date: daysAgo(2), shopName: 'Samarqand osh markazi', price: 680000 },
  { id: generateId('food'), date: daysAgo(7), shopName: "Dehqon bozori taomlari", price: 520000 },
  { id: generateId('food'), date: daysAgo(14), shopName: 'Green Lunch', price: 430000 },
  { id: generateId('food'), date: daysAgo(20), shopName: 'Chorsu servis taomlari', price: 610000 },
]

const fertilizers: Fertilizer[] = [
  { id: generateId('fert'), date: daysAgo(3), fertilizerType: 'Ammiakli selitra', machineCount: 2, tonAmount: 1.6, cost: 2850000, comment: 'Pomidor va bodring maydoni' },
  { id: generateId('fert'), date: daysAgo(10), fertilizerType: 'Karbamid', machineCount: 1, tonAmount: 0.9, cost: 1540000, comment: "Ko'chat kuchaytirish bosqichi" },
  { id: generateId('fert'), date: daysAgo(24), fertilizerType: 'NPK aralashmasi', machineCount: 3, tonAmount: 2.2, cost: 3940000, comment: 'Asosiy dala sektori' },
  { id: generateId('fert'), date: daysAgo(41), fertilizerType: 'Organik kompost', machineCount: 2, tonAmount: 3.4, cost: 2180000, comment: 'Yangi maydon tayyorlash' },
]

const transports: Transport[] = [
  { id: generateId('trn'), date: daysAgo(4), transportType: 'Yuk mashinasi', cost: 950000, comment: "Mineral o'g'it yetkazib berish" },
  { id: generateId('trn'), date: daysAgo(9), transportType: 'Mini traktor', cost: 680000, comment: "Ichki logistika va ko'chat tashish" },
  { id: generateId('trn'), date: daysAgo(17), transportType: 'Gazel', cost: 540000, comment: "Bozor uchun yuk jo'natish" },
  { id: generateId('trn'), date: daysAgo(29), transportType: 'Ekskavator', cost: 1320000, comment: "Drenaj yo'lagini ochish" },
]

const energies: Energy[] = [
  { id: generateId('eng'), date: daysAgo(2), amountPaid: 1730000, comment: 'Nasos stansiyasi va sovitish tizimi' },
  { id: generateId('eng'), date: daysAgo(13), amountPaid: 1490000, comment: 'Issiqxona yoritish bloki' },
  { id: generateId('eng'), date: daysAgo(30), amountPaid: 1660000, comment: "Oy boshidagi elektr to'lovi" },
]

const oils: Oil[] = [
  { id: generateId('oil'), date: daysAgo(6), price: 420000, comment: "Generator uchun moy almashtirildi" },
  { id: generateId('oil'), date: daysAgo(21), price: 385000, comment: 'Traktor va purkagich texnikasi' },
  { id: generateId('oil'), date: daysAgo(39), price: 448000, comment: 'Favqulodda servis xarajati' },
]

const remonts: Remont[] = [
  { id: generateId('rem'), date: daysAgo(8), price: 870000, comment: "Suv nasosi klapanini ta'mirlash" },
  { id: generateId('rem'), date: daysAgo(19), price: 1230000, comment: 'Issiqxona eshik mexanizmi' },
  { id: generateId('rem'), date: daysAgo(35), price: 640000, comment: 'Elektr panel profilaktikasi' },
]

const taxes: Tax[] = [
  { id: generateId('tax'), date: daysAgo(11), amountPaid: 2140000, comment: "Yer solig'i bo'yicha to'lov" },
  { id: generateId('tax'), date: daysAgo(42), amountPaid: 1860000, comment: "Ijtimoiy ajratmalar va yig'imlar" },
]

const drainages: Drainage[] = [
  { id: generateId('drn'), date: daysAgo(1), hoursWorked: 6, totalSalary: 760000 },
  { id: generateId('drn'), date: daysAgo(16), hoursWorked: 8, totalSalary: 980000 },
  { id: generateId('drn'), date: daysAgo(27), hoursWorked: 5, totalSalary: 620000 },
  { id: generateId('drn'), date: daysAgo(46), hoursWorked: 9, totalSalary: 1120000 },
]

export const demoRecords: RecordsMap = {
  workers,
  foods,
  fertilizers,
  transports,
  energies,
  oils,
  remonts,
  taxes,
  drainages,
}
