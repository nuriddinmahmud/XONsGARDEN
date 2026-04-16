import {
  CalendarRange,
  CircleDollarSign,
  Files,
  Plus,
  PlusCircle,
  RotateCcw,
  Search,
} from 'lucide-react'
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
import type { IncomeRecord } from '../types/income'
import { filterIncomeRecords, getIncomeSummaryItems } from '../utils/incomeCalculations'
import { readIncomeRecords, writeIncomeRecords } from '../utils/incomeStorage'
import { formatDate } from '../utils/formatDate'
import { formatMoney } from '../utils/formatMoney'
import { generateId, getTodayDate, isValidDateString, parseNumber } from '../utils/helpers'

const incomeFormFields: FormField[] = [
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
    name: 'reason',
    label: 'Sabab',
    type: 'textarea',
    required: true,
    placeholder: 'Daromad nima sababdan keldi',
  },
  {
    name: 'sourceLocation',
    label: 'Qayerdan kelgan',
    type: 'text',
    placeholder: 'Manba yoki joylashuv',
    helperText: "Bo'sh qoldirilishi mumkin.",
  },
  {
    name: 'comment',
    label: 'Izoh',
    type: 'textarea',
    placeholder: "Qo'shimcha ma'lumot",
  },
]

function createInitialValues(): FormValues {
  return {
    amount: '',
    reason: '',
    date: getTodayDate(),
    sourceLocation: '',
    comment: '',
  }
}

function toFormValues(record: IncomeRecord): FormValues {
  return {
    amount: String(record.amount),
    reason: record.reason,
    date: record.date,
    sourceLocation: record.sourceLocation ?? '',
    comment: record.comment ?? '',
  }
}

function normalizeValues(values: FormValues) {
  return {
    amount: values.amount.trim(),
    reason: values.reason.trim(),
    date: values.date.trim(),
    sourceLocation: values.sourceLocation.trim(),
    comment: values.comment.trim(),
  }
}

function validateIncomeForm(values: FormValues) {
  const normalized = normalizeValues(values)
  const nextErrors: Record<string, string> = {}
  const amount = Number(normalized.amount)

  if (!normalized.amount) {
    nextErrors.amount = "Summa maydonini to'ldiring."
  } else if (!Number.isFinite(amount) || amount <= 0) {
    nextErrors.amount = "Summa 0 dan katta bo'lishi kerak."
  }

  if (normalized.reason.length < 3) {
    nextErrors.reason = "Sabab kamida 3 ta belgidan iborat bo'lsin."
  }

  if (!normalized.date) {
    nextErrors.date = "Sana maydonini to'ldiring."
  } else if (!isValidDateString(normalized.date)) {
    nextErrors.date = "Sana formati noto'g'ri."
  }

  return {
    errors: nextErrors,
    normalized,
    isValid: Object.keys(nextErrors).length === 0,
  }
}

export function IncomePage() {
  const { currencyLabel } = useSettings()
  const { showToast } = useToast()
  const [records, setRecords] = useState<IncomeRecord[]>(() => readIncomeRecords())
  const [searchValue, setSearchValue] = useState('')
  const [dateFromValue, setDateFromValue] = useState('')
  const [dateToValue, setDateToValue] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null)
  const [values, setValues] = useState<FormValues>(() => createInitialValues())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<IncomeRecord | null>(null)

  useEffect(() => {
    const sync = (event?: Event) => {
      const customEvent = event as CustomEvent<{ key?: string }> | undefined

      if (customEvent?.detail?.key && customEvent.detail.key !== STORAGE_KEYS.xonsgarden_income) {
        return
      }

      const nextRecords = readIncomeRecords()

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

  const today = getTodayDate()
  const summaryItems = useMemo(() => getIncomeSummaryItems(records, today), [records, today])
  const filteredRecords = useMemo(
    () => filterIncomeRecords(records, searchValue, dateFromValue, dateToValue),
    [dateFromValue, dateToValue, records, searchValue],
  )
  const hasActiveFilters = Boolean(searchValue.trim() || dateFromValue || dateToValue)

  const tableContext = useMemo(
    () => ({
      currencyLabel,
    }),
    [currencyLabel],
  )

  const columns = useMemo<TableColumn<IncomeRecord>[]>(
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
        key: 'amount',
        label: 'Summa',
        render: (row, context) => (
          <span className="font-semibold text-emerald-700">
            {formatMoney(row.amount, context.currencyLabel)}
          </span>
        ),
      },
      {
        key: 'reason',
        label: 'Sabab',
        render: (row) => (
          <div className="max-w-[18rem] whitespace-normal leading-6 text-slate-700">{row.reason}</div>
        ),
      },
      {
        key: 'sourceLocation',
        label: 'Qayerdan kelgan',
        render: (row) =>
          row.sourceLocation ? (
            <div className="max-w-[14rem] whitespace-normal leading-6 text-slate-600">
              {row.sourceLocation}
            </div>
          ) : (
            <span className="text-slate-400">Ko'rsatilmagan</span>
          ),
      },
      {
        key: 'comment',
        label: 'Izoh',
        render: (row) =>
          row.comment ? (
            <div className="max-w-[16rem] whitespace-normal leading-6 text-slate-600">{row.comment}</div>
          ) : (
            <span className="text-slate-400">-</span>
          ),
      },
    ],
    [],
  )

  const persistRecords = (nextRecords: IncomeRecord[]) => {
    setRecords(nextRecords)
    writeIncomeRecords(nextRecords)
  }

  const resetModalState = () => {
    setModalOpen(false)
    setEditingRecord(null)
    setValues(createInitialValues())
    setErrors({})
  }

  const openCreateModal = () => {
    setEditingRecord(null)
    setValues(createInitialValues())
    setErrors({})
    setModalOpen(true)
  }

  const openEditModal = (record: IncomeRecord) => {
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
    const result = validateIncomeForm(values)

    if (!result.isValid) {
      setErrors(result.errors)
      showToast({
        type: 'error',
        title: "Forma tekshiruvdan o'tmadi",
        description: "Maydonlarni tekshiring va xatolarni to'g'rilang.",
      })
      return
    }

    const nextRecord: IncomeRecord = {
      id: editingRecord?.id ?? generateId('inc'),
      amount: parseNumber(result.normalized.amount),
      reason: result.normalized.reason,
      date: result.normalized.date,
      sourceLocation: result.normalized.sourceLocation || undefined,
      comment: result.normalized.comment || undefined,
      createdAt: editingRecord?.createdAt ?? new Date().toISOString(),
    }

    const nextRecords = editingRecord
      ? records.map((record) => (record.id === editingRecord.id ? nextRecord : record))
      : [nextRecord, ...records]

    persistRecords(nextRecords)
    resetModalState()
    showToast({
      type: 'success',
      title: editingRecord ? 'Daromad yangilandi' : "Daromad yozuvi qo'shildi",
      description: "Ma'lumot saqlandi.",
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
      title: "Daromad yozuvi o'chirildi",
      description: "Ma'lumot ro'yxatdan olib tashlandi.",
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,_rgba(6,95,70,0.96),_rgba(15,23,42,0.94))] p-6 text-white shadow-[0_40px_100px_-55px_rgba(15,23,42,0.95)] md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
              <CircleDollarSign className="h-4 w-4" />
              Daromad
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">Daromad</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">
              Qo'lingizga yoki biznesga kelgan barcha tushumlarni bitta bo'limda yuriting:
              summa, sabab, sana va kerak bo'lsa qayerdan kelgani hamda izohi bilan.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Jami yozuv</p>
              <p className="mt-3 text-2xl font-semibold">{records.length} ta</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Ko'rsatilmoqda</p>
              <p className="mt-3 text-2xl font-semibold">{filteredRecords.length} ta</p>
            </div>
          </div>
        </div>
      </section>

      <SummaryCards currencyLabel={currencyLabel} items={summaryItems} />

      <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_repeat(2,minmax(0,0.7fr))_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Sabab, manba, izoh yoki summa bo'yicha qidiring"
              value={searchValue}
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
            <CalendarRange className="h-4 w-4 text-slate-400" />
            <input
              className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none"
              onChange={(event) => setDateFromValue(event.target.value)}
              type="date"
              value={dateFromValue}
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
            <CalendarRange className="h-4 w-4 text-slate-400" />
            <input
              className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none"
              onChange={(event) => setDateToValue(event.target.value)}
              type="date"
              value={dateToValue}
            />
          </label>

          <button
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!hasActiveFilters}
            onClick={() => {
              setSearchValue('')
              setDateFromValue('')
              setDateToValue('')
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
          actionLabel="Daromad qo'shish"
          description="Biznesga yoki qo'lingizga kelgan har qanday pul tushumlarini shu yerda yozib boring."
          icon={PlusCircle}
          onAction={openCreateModal}
          title="Hozircha daromad yozuvlari yo'q"
        />
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          actionLabel="Filtrlarni tozalash"
          description="Qidiruv yoki sana filtrlari bo'yicha mos yozuv topilmadi. Parametrlarni o'zgartirib qayta urinib ko'ring."
          icon={Files}
          onAction={() => {
            setSearchValue('')
            setDateFromValue('')
            setDateToValue('')
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
        description="Daromad yozuvini kiriting. Majburiy maydonlar belgilangani bilan ko'rsatilgan."
        errors={errors}
        fields={incomeFormFields}
        onChange={handleFieldChange}
        onClose={resetModalState}
        onSubmit={handleSubmit}
        open={modalOpen}
        submitLabel={editingRecord ? 'Saqlash' : "Qo'shish"}
        title={editingRecord ? 'Daromad yozuvini tahrirlash' : "Yangi daromad qo'shish"}
        values={values}
      />

      <ConfirmDialog
        description={
          deleteTarget
            ? `${formatMoney(deleteTarget.amount, currencyLabel)} miqdordagi daromad yozuvi o'chiriladi. Bu amalni bekor qilib bo'lmaydi.`
            : ''
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        open={Boolean(deleteTarget)}
        title="Daromad yozuvini o'chirmoqchimisiz?"
      />
    </div>
  )
}
