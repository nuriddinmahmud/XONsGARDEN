import { BadgeDollarSign, CircleAlert, Files, Plus, PlusCircle, RotateCcw, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DataTable } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { FormModal } from '../components/FormModal'
import { SummaryCards } from '../components/SummaryCards'
import { STORAGE_KEYS, STORAGE_SYNC_EVENT } from '../constants/storageKeys'
import { useToast } from '../context/ToastContext'
import { useSettings } from '../hooks/useSettings'
import type { FormField, FormValues, TableColumn } from '../types'
import type { DebtRecord, DebtStatus } from '../types/debt'
import {
  DEBT_STATUS_META,
  DEBT_STATUS_OPTIONS,
  type DebtStatusFilter,
  filterDebts,
  getDebtCategories,
  getDebtSummaryItems,
  getOverdueDebtCount,
  isDebtOverdue,
} from '../utils/debtCalculations'
import { readDebts, writeDebts } from '../utils/debtStorage'
import { formatDate } from '../utils/formatDate'
import { formatMoney } from '../utils/formatMoney'
import { cn, generateId, getTodayDate, isValidDateString, parseNumber } from '../utils/helpers'

const ALL_STATUS_VALUE = 'all'
const ALL_CATEGORY_VALUE = 'all'
const PHONE_PATTERN = /^[+0-9()\s-]{7,20}$/

const debtFormFields: FormField[] = [
  {
    name: 'personOrCompany',
    label: 'Kim / Tashkilot',
    type: 'text',
    required: true,
    placeholder: 'Ism yoki kompaniya nomi',
  },
  {
    name: 'phone',
    label: 'Telefon',
    type: 'text',
    placeholder: '+998 XX XXX XX XX',
    helperText: "Bo'sh qoldirilishi mumkin.",
  },
  {
    name: 'category',
    label: 'Kategoriya',
    type: 'text',
    required: true,
    placeholder: "Masalan: O'g'it, yoqilg'i, xizmat",
  },
  {
    name: 'status',
    label: 'Holat',
    type: 'select',
    required: true,
    options: DEBT_STATUS_OPTIONS,
  },
  {
    name: 'amount',
    label: 'Summa',
    type: 'number',
    required: true,
    min: 1,
    step: 1,
  },
  {
    name: 'date',
    label: 'Sana',
    type: 'date',
    required: true,
  },
  {
    name: 'dueDate',
    label: 'Muddat',
    type: 'date',
    helperText: "Bo'sh qoldirilishi mumkin.",
  },
  {
    name: 'reason',
    label: 'Sabab',
    type: 'textarea',
    required: true,
    placeholder: 'Qarz yoki majburiyat sababi',
  },
  {
    name: 'note',
    label: 'Izoh',
    type: 'textarea',
    placeholder: "Qo'shimcha ma'lumot",
  },
]

function createInitialValues(): FormValues {
  return {
    personOrCompany: '',
    phone: '',
    category: '',
    status: "to'lanmagan",
    amount: '',
    date: getTodayDate(),
    dueDate: '',
    reason: '',
    note: '',
  }
}

function toFormValues(record: DebtRecord): FormValues {
  return {
    personOrCompany: record.personOrCompany,
    phone: record.phone ?? '',
    category: record.category,
    status: record.status,
    amount: String(record.amount),
    date: record.date,
    dueDate: record.dueDate,
    reason: record.reason,
    note: record.note ?? '',
  }
}

function normalizeValues(values: FormValues) {
  return {
    personOrCompany: values.personOrCompany.trim(),
    phone: values.phone.trim(),
    category: values.category.trim(),
    status: values.status.trim(),
    amount: values.amount.trim(),
    date: values.date.trim(),
    dueDate: values.dueDate.trim(),
    reason: values.reason.trim(),
    note: values.note.trim(),
  }
}

function validateDebtForm(values: FormValues) {
  const normalized = normalizeValues(values)
  const nextErrors: Record<string, string> = {}

  if (normalized.personOrCompany.length < 2) {
    nextErrors.personOrCompany = "Kim / Tashkilot kamida 2 ta belgidan iborat bo'lsin."
  }

  if (normalized.category.length < 2) {
    nextErrors.category = 'Kategoriya kamida 2 ta belgidan iborat bo\'lsin.'
  }

  if (normalized.reason.length < 3) {
    nextErrors.reason = "Sabab kamida 3 ta belgidan iborat bo'lsin."
  }

  const amount = Number(normalized.amount)

  if (!normalized.amount) {
    nextErrors.amount = "Summa maydonini to'ldiring."
  } else if (!Number.isFinite(amount) || amount <= 0) {
    nextErrors.amount = "Summa 0 dan katta bo'lishi kerak."
  }

  if (!normalized.date) {
    nextErrors.date = "Sana maydonini to'ldiring."
  } else if (!isValidDateString(normalized.date)) {
    nextErrors.date = "Sana formati noto'g'ri."
  }

  if (normalized.dueDate && !isValidDateString(normalized.dueDate)) {
    nextErrors.dueDate = "Muddat formati noto'g'ri."
  }

  if (!normalized.status) {
    nextErrors.status = "Holatni tanlang."
  } else if (!DEBT_STATUS_OPTIONS.some((option) => option.value === normalized.status)) {
    nextErrors.status = "Holat noto'g'ri tanlangan."
  }

  if (normalized.phone && !PHONE_PATTERN.test(normalized.phone)) {
    nextErrors.phone =
      "Telefon raqami faqat raqam, bo'sh joy va +()- belgilaridan iborat bo'lsin."
  }

  return {
    errors: nextErrors,
    normalized,
    isValid: Object.keys(nextErrors).length === 0,
  }
}

function getFilterClass() {
  return 'h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100'
}

export function DebtPage() {
  const { currencyLabel } = useSettings()
  const { showToast } = useToast()
  const [records, setRecords] = useState<DebtRecord[]>(() => readDebts())
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<DebtStatusFilter>(ALL_STATUS_VALUE)
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORY_VALUE)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DebtRecord | null>(null)
  const [values, setValues] = useState<FormValues>(() => createInitialValues())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<DebtRecord | null>(null)

  useEffect(() => {
    const sync = (event?: Event) => {
      const customEvent = event as CustomEvent<{ key?: string }> | undefined

      if (customEvent?.detail?.key && customEvent.detail.key !== STORAGE_KEYS.xonsgarden_debts) {
        return
      }

      const nextRecords = readDebts()

      setRecords((current) =>
        JSON.stringify(current) === JSON.stringify(nextRecords) ? current : nextRecords,
      )
    }

    window.addEventListener(STORAGE_SYNC_EVENT, sync as EventListener)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, sync as EventListener)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const categories = useMemo(() => getDebtCategories(records), [records])
  const summaryItems = useMemo(() => getDebtSummaryItems(records), [records])
  const overdueCount = useMemo(() => getOverdueDebtCount(records), [records])
  const filteredRecords = useMemo(
    () =>
      filterDebts(
        records,
        searchValue,
        statusFilter,
        categoryFilter === ALL_CATEGORY_VALUE ? '' : categoryFilter,
      ),
    [categoryFilter, records, searchValue, statusFilter],
  )
  const hasActiveFilters = Boolean(
    searchValue.trim() || statusFilter !== ALL_STATUS_VALUE || categoryFilter !== ALL_CATEGORY_VALUE,
  )
  const today = getTodayDate()

  const tableContext = useMemo(
    () => ({
      currencyLabel,
    }),
    [currencyLabel],
  )

  const columns = useMemo<TableColumn<DebtRecord>[]>(
    () => [
      {
        key: 'date',
        label: 'Sana',
        render: (row) => (
          <div className="min-w-[8rem]">
            <p className="font-medium text-slate-900">{formatDate(row.date)}</p>
            <p className="mt-1 text-xs text-slate-500">{row.date}</p>
          </div>
        ),
      },
      {
        key: 'personOrCompany',
        label: 'Kim / Tashkilot',
        render: (row) => (
          <div className="min-w-[11rem] max-w-[14rem]">
            <p className="font-semibold text-slate-900">{row.personOrCompany}</p>
            <p className="mt-1 text-xs text-slate-500">{row.phone || 'Telefon yo‘q'}</p>
          </div>
        ),
      },
      {
        key: 'category',
        label: 'Kategoriya',
        render: (row) => (
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {row.category}
          </span>
        ),
      },
      {
        key: 'reason',
        label: 'Sabab',
        render: (row) => (
          <div className="max-w-[18rem] whitespace-normal leading-6 text-slate-600">{row.reason}</div>
        ),
      },
      {
        key: 'amount',
        label: 'Summa',
        render: (row, context) => (
          <span className="font-semibold text-slate-900">
            {formatMoney(row.amount, context.currencyLabel)}
          </span>
        ),
      },
      {
        key: 'dueDate',
        label: 'Muddat',
        render: (row) => {
          const overdue = isDebtOverdue(row, today)

          if (!row.dueDate) {
            return <span className="text-slate-400">Belgilanmagan</span>
          }

          return (
            <div className="min-w-[9rem]">
              <p className={cn('font-medium', overdue ? 'text-rose-700' : 'text-slate-900')}>
                {formatDate(row.dueDate)}
              </p>
              {overdue ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                  <CircleAlert className="h-3.5 w-3.5" />
                  Muddati o'tgan
                </span>
              ) : null}
            </div>
          )
        },
      },
      {
        key: 'status',
        label: 'Holat',
        render: (row) => {
          const meta = DEBT_STATUS_META[row.status]
          const overdue = isDebtOverdue(row, today)

          return (
            <div className="flex flex-col items-start gap-2">
              <span
                className={cn(
                  'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                  meta.badgeClass,
                )}
              >
                {meta.label}
              </span>
              {overdue ? (
                <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                  Nazorat talab
                </span>
              ) : null}
            </div>
          )
        },
      },
      {
        key: 'note',
        label: 'Izoh',
        render: (row) =>
          row.note ? (
            <div className="max-w-[16rem] whitespace-normal leading-6 text-slate-600">{row.note}</div>
          ) : (
            <span className="text-slate-400">-</span>
          ),
      },
    ],
    [today],
  )

  const resetModalState = () => {
    setModalOpen(false)
    setEditingRecord(null)
    setValues(createInitialValues())
    setErrors({})
  }

  const persistRecords = (nextRecords: DebtRecord[]) => {
    setRecords(nextRecords)
    writeDebts(nextRecords)
  }

  const openCreateModal = () => {
    setEditingRecord(null)
    setValues(createInitialValues())
    setErrors({})
    setModalOpen(true)
  }

  const openEditModal = (record: DebtRecord) => {
    setEditingRecord(record)
    setValues(toFormValues(record))
    setErrors({})
    setModalOpen(true)
  }

  const handleFieldChange = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = () => {
    const result = validateDebtForm(values)

    if (!result.isValid) {
      setErrors(result.errors)
      showToast({
        type: 'error',
        title: "Forma tekshiruvdan o'tmadi",
        description: "Maydonlarni tekshiring va xatolarni to'g'rilang.",
      })
      return
    }

    const nextRecord: DebtRecord = {
      id: editingRecord?.id ?? generateId('debt'),
      personOrCompany: result.normalized.personOrCompany,
      category: result.normalized.category,
      reason: result.normalized.reason,
      amount: parseNumber(result.normalized.amount),
      date: result.normalized.date,
      dueDate: result.normalized.dueDate,
      status: result.normalized.status as DebtStatus,
      phone: result.normalized.phone || undefined,
      note: result.normalized.note || undefined,
    }

    const nextRecords = editingRecord
      ? records.map((record) => (record.id === editingRecord.id ? nextRecord : record))
      : [nextRecord, ...records]

    persistRecords(nextRecords)
    resetModalState()
    showToast({
      type: 'success',
      title: editingRecord ? 'Qarz yangilandi' : "Qarz yozuvi qo'shildi",
      description: 'Ma\'lumot saqlandi.',
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) {
      return
    }

    const nextRecords = records.filter((record) => record.id !== deleteTarget.id)

    persistRecords(nextRecords)
    setDeleteTarget(null)
    showToast({
      type: 'success',
      title: "Qarz yozuvi o'chirildi",
      description: 'Ma\'lumot ro\'yxatdan olib tashlandi.',
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(124,45,18,0.92))] p-6 text-white shadow-[0_40px_100px_-55px_rgba(15,23,42,0.95)] md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
              <BadgeDollarSign className="h-4 w-4" />
              Qarzdorlik
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">Qarzdorlik</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">
              Har qanday qarz va majburiyatlarni bitta joyda boshqaring: kimga tegishli,
              nima uchun olingani, summasi, muddati va to'lov holati doimo nazorat ostida bo'ladi.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Ko'rsatilmoqda</p>
              <p className="mt-3 text-2xl font-semibold">{filteredRecords.length} ta</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Muddati o'tgan</p>
              <p className="mt-3 text-2xl font-semibold">{overdueCount} ta</p>
            </div>
          </div>
        </div>
      </section>

      <SummaryCards currencyLabel={currencyLabel} items={summaryItems} />

      <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,0.7fr))_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Kim, kategoriya, sabab, telefon yoki izoh bo'yicha qidiring"
              value={searchValue}
            />
          </div>

          <select
            className={getFilterClass()}
            onChange={(event) => setStatusFilter(event.target.value as DebtStatusFilter)}
            value={statusFilter}
          >
            <option value={ALL_STATUS_VALUE}>Barcha holatlar</option>
            {DEBT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className={getFilterClass()}
            onChange={(event) => setCategoryFilter(event.target.value)}
            value={categoryFilter}
          >
            <option value={ALL_CATEGORY_VALUE}>Barcha kategoriyalar</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!hasActiveFilters}
            onClick={() => {
              setSearchValue('')
              setStatusFilter(ALL_STATUS_VALUE)
              setCategoryFilter(ALL_CATEGORY_VALUE)
            }}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            Tozalash
          </button>

          <button
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            onClick={openCreateModal}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Qo'shish
          </button>
        </div>
      </section>

      {records.length === 0 ? (
        <EmptyState
          actionLabel="Qarz qo'shish"
          description="Bog' yoki biznesga tegishli istalgan qarz va majburiyatlarni shu yerda yuriting."
          icon={PlusCircle}
          onAction={openCreateModal}
          title="Hozircha qarzdorlik yozuvlari yo'q"
        />
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          actionLabel="Filtrlarni tozalash"
          description="Qidiruv yoki filtrlarga mos yozuv topilmadi. Parametrlarni o'zgartirib qayta urinib ko'ring."
          icon={Files}
          onAction={() => {
            setSearchValue('')
            setStatusFilter(ALL_STATUS_VALUE)
            setCategoryFilter(ALL_CATEGORY_VALUE)
          }}
          title="Natija topilmadi"
        />
      ) : (
        <DataTable
          columns={columns}
          context={tableContext}
          onDelete={(row) => setDeleteTarget(row)}
          onEdit={openEditModal}
          rows={filteredRecords}
        />
      )}

      <FormModal
        description="Qarz yoki majburiyat tafsilotlarini kiriting. Majburiy maydonlar belgilangani bilan ko'rsatilgan."
        errors={errors}
        fields={debtFormFields}
        onChange={handleFieldChange}
        onClose={resetModalState}
        onSubmit={handleSubmit}
        open={modalOpen}
        submitLabel={editingRecord ? 'Saqlash' : "Qo'shish"}
        title={editingRecord ? 'Qarzdorlik yozuvini tahrirlash' : "Yangi qarzdorlik qo'shish"}
        values={values}
      />

      <ConfirmDialog
        description={
          deleteTarget
            ? `${deleteTarget.personOrCompany} bo'yicha qarzdorlik yozuvi o'chiriladi. Bu amalni bekor qilib bo'lmaydi.`
            : ''
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        open={Boolean(deleteTarget)}
        title="Qarz yozuvini o'chirmoqchimisiz?"
      />
    </div>
  )
}
