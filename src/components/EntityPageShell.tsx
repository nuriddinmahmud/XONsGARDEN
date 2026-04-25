import { useMemo, useState } from 'react'
import { Files, PlusCircle } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useCrudCollection } from '../hooks/useCrudCollection'
import { useSettings } from '../hooks/useSettings'
import type { EntityPageConfig, EntityRecord, FormValues } from '../types'
import { getTodayDate, isValidDateString } from '../utils/helpers'
import { formatMoney } from '../utils/formatMoney'
import { ConfirmDialog } from './ConfirmDialog'
import { DataTable } from './DataTable'
import { EmptyState } from './EmptyState'
import { FormModal } from './FormModal'
import { SearchBar } from './SearchBar'

function createInitialValues<T extends EntityRecord>(config: EntityPageConfig<T>) {
  const values: FormValues = {}

  for (const field of config.fields) {
    values[field.name] = field.name === 'date' ? getTodayDate() : ''
  }

  return config.deriveValues ? config.deriveValues(values) : values
}

function createLoadingRows() {
  return Array.from({ length: 3 }).map((_, index) => (
    <div
      className="h-32 animate-pulse rounded-3xl border border-white/70 bg-white/70"
      key={index}
    />
  ))
}

export function EntityPageShell<T extends EntityRecord>({
  config,
}: {
  config: EntityPageConfig<T>
}) {
  const { records, saveRecord, deleteRecord, loading, error } = useCrudCollection<T>(config.storageKey)
  const { showToast } = useToast()
  const { currencyLabel } = useSettings()
  const [searchValue, setSearchValue] = useState('')
  const [dateFromValue, setDateFromValue] = useState('')
  const [dateToValue, setDateToValue] = useState('')
  const [sortValue, setSortValue] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>(
    'date_desc',
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<T | null>(null)
  const [values, setValues] = useState<FormValues>(() => createInitialValues(config))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null)

  const filteredRecords = useMemo(() => {
    const filtered = [...records]
      .filter((record) => {
        const query = searchValue.trim().toLowerCase()
        if (!query) {
          return true
        }

        return config.getSearchText(record).toLowerCase().includes(query)
      })
      .filter((record) => (dateFromValue ? record.date >= dateFromValue : true))
      .filter((record) => (dateToValue ? record.date <= dateToValue : true))

    filtered.sort((a, b) => {
      if (sortValue === 'date_asc') {
        return +new Date(a.date) - +new Date(b.date)
      }

      if (sortValue === 'amount_desc') {
        return config.getAmount(b) - config.getAmount(a)
      }

      if (sortValue === 'amount_asc') {
        return config.getAmount(a) - config.getAmount(b)
      }

      return +new Date(b.date) - +new Date(a.date)
    })

    return filtered
  }, [config, dateFromValue, dateToValue, records, searchValue, sortValue])

  const totalAmount = useMemo(
    () => filteredRecords.reduce((sum, record) => sum + config.getAmount(record), 0),
    [config, filteredRecords],
  )
  const hasActiveFilters = Boolean(
    searchValue.trim() || dateFromValue || dateToValue || sortValue !== 'date_desc',
  )
  const tableContext = useMemo(
    () => ({
      currencyLabel,
    }),
    [currencyLabel],
  )

  const openCreateModal = () => {
    setEditingRecord(null)
    setErrors({})
    setValues(createInitialValues(config))
    setModalOpen(true)
  }

  const openEditModal = (record: T) => {
    setEditingRecord(record)
    setErrors({})
    setValues(config.toFormValues(record))
    setModalOpen(true)
  }

  const handleChange = (name: string, value: string) => {
    setValues((current) => {
      const next = { ...current, [name]: value }
      return config.deriveValues ? config.deriveValues(next) : next
    })
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    for (const field of config.fields) {
      const value = values[field.name]?.trim() ?? ''

      if (field.required && !value) {
        nextErrors[field.name] = `${field.label} maydonini to'ldiring.`
        continue
      }

      if ((field.type === 'text' || field.type === 'textarea') && field.required && value.length > 0 && value.length < 2) {
        nextErrors[field.name] = `${field.label} kamida 2 ta belgidan iborat bo'lsin.`
        continue
      }

      if (field.type === 'number' && value) {
        const numberValue = Number(value)
        if (Number.isNaN(numberValue)) {
          nextErrors[field.name] = `${field.label} uchun to'g'ri raqam kiriting.`
        } else if (!Number.isFinite(numberValue)) {
          nextErrors[field.name] = `${field.label} qiymati juda katta.`
        } else if (field.min !== undefined && numberValue < field.min) {
          nextErrors[field.name] = `${field.label} kamida ${field.min} bo'lishi kerak.`
        }
      }

      if (field.type === 'date' && value && !isValidDateString(value)) {
        nextErrors[field.name] = "Sana formati noto'g'ri."
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      showToast({
        type: 'error',
        title: "Forma tekshiruvdan o'tmadi",
        description: "Maydonlarni tekshiring.",
      })
      return
    }

    try {
      const record = config.createRecord(values, editingRecord?.id)
      await saveRecord(record)
      setModalOpen(false)
      setEditingRecord(null)
      setValues(createInitialValues(config))
      setErrors({})
      showToast({
        type: 'success',
        title: editingRecord ? 'Yozuv yangilandi' : "Yangi yozuv qo'shildi",
        description: 'Saqlandi.',
      })
    } catch (submitError) {
      showToast({
        type: 'error',
        title: 'Saqlash amalga oshmadi',
        description:
          submitError instanceof Error ? submitError.message : 'Yozuvni saqlab bo\'lmadi.',
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    try {
      await deleteRecord(deleteTarget.id)
      setDeleteTarget(null)
      showToast({
        type: 'success',
        title: "Yozuv o'chirildi",
        description: "O'chirildi.",
      })
    } catch (deleteError) {
      showToast({
        type: 'error',
        title: "O'chirish amalga oshmadi",
        description:
          deleteError instanceof Error ? deleteError.message : "Yozuvni o'chirib bo'lmadi.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{config.title}</h1>
            {config.description ? (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{config.description}</p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Yozuvlar
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{filteredRecords.length}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Jami summa
              </p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900">
                {formatMoney(totalAmount, currencyLabel)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <SearchBar
        addLabel={config.addLabel}
        dateFromValue={dateFromValue}
        dateToValue={dateToValue}
        hasActiveFilters={hasActiveFilters}
        onAdd={openCreateModal}
        onClearFilters={() => {
          setSearchValue('')
          setDateFromValue('')
          setDateToValue('')
          setSortValue('date_desc')
        }}
        onDateFromChange={setDateFromValue}
        onDateToChange={setDateToValue}
        onSearchChange={setSearchValue}
        onSortChange={(value) =>
          setSortValue(value as 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc')
        }
        placeholder={config.searchPlaceholder}
        searchValue={searchValue}
        sortValue={sortValue}
      />

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? <div className="grid gap-4">{createLoadingRows()}</div> : null}

      {!loading && records.length === 0 ? (
        <EmptyState
          actionLabel={config.addLabel}
          description={config.emptyDescription}
          icon={PlusCircle}
          onAction={openCreateModal}
          title={config.emptyTitle}
        />
      ) : null}

      {!loading && filteredRecords.length > 0 ? (
        <DataTable
          columns={config.columns}
          context={tableContext}
          onDelete={(row) => setDeleteTarget(row)}
          onEdit={openEditModal}
          rows={filteredRecords}
        />
      ) : null}

      {!loading && records.length > 0 && filteredRecords.length === 0 ? (
        <EmptyState
          actionLabel="Filtrlarni tozalash"
          description="Filtrlarni o'zgartiring."
          icon={Files}
          onAction={() => {
            setSearchValue('')
            setDateFromValue('')
            setDateToValue('')
            setSortValue('date_desc')
          }}
          title="Natija topilmadi"
        />
      ) : null}

      <FormModal
        errors={errors}
        fields={config.fields}
        onChange={handleChange}
        onClose={() => {
          setModalOpen(false)
          setEditingRecord(null)
          setErrors({})
        }}
        onSubmit={handleSubmit}
        open={modalOpen}
        submitLabel={editingRecord ? 'Saqlash' : "Qo'shish"}
        title={editingRecord ? `${config.title} yozuvini tahrirlash` : config.addLabel}
        values={values}
      />

      <ConfirmDialog
        description="Bu amalni bekor qilib bo'lmaydi."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        open={Boolean(deleteTarget)}
        title="Yozuvni o'chirmoqchimisiz?"
      />
    </div>
  )
}
