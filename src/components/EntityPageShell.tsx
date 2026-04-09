import { useEffect, useMemo, useState } from 'react'
import { Files, PlusCircle } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useCrudCollection } from '../hooks/useCrudCollection'
import type { EntityPageConfig, EntityRecord, FormValues } from '../types'
import { getTodayDate, isValidDateString } from '../utils/helpers'
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
  const { records, saveRecord, deleteRecord } = useCrudCollection<T>(config.storageKey)
  const { showToast } = useToast()
  const [searchValue, setSearchValue] = useState('')
  const [dateValue, setDateValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<T | null>(null)
  const [values, setValues] = useState<FormValues>(() => createInitialValues(config))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350)
    return () => window.clearTimeout(timer)
  }, [])

  const filteredRecords = useMemo(() => {
    return [...records]
      .filter((record) => {
        const query = searchValue.trim().toLowerCase()
        if (!query) {
          return true
        }

        return config.getSearchText(record).toLowerCase().includes(query)
      })
      .filter((record) => (dateValue ? record.date === dateValue : true))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  }, [config, dateValue, records, searchValue])

  const totalAmount = useMemo(
    () => filteredRecords.reduce((sum, record) => sum + config.getAmount(record), 0),
    [config, filteredRecords],
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
        nextErrors[field.name] = "Ushbu maydonni to'ldiring."
        continue
      }

      if (field.type === 'number' && value) {
        const numberValue = Number(value)
        if (Number.isNaN(numberValue)) {
          nextErrors[field.name] = "Raqam to'g'ri kiritilmagan."
        } else if (numberValue < 0) {
          nextErrors[field.name] = "Manfiy qiymat kiritib bo'lmaydi."
        }
      }

      if (field.type === 'date' && value && !isValidDateString(value)) {
        nextErrors[field.name] = "Sana formati noto'g'ri."
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) {
      showToast({
        type: 'error',
        title: "Forma tekshiruvdan o'tmadi",
        description: "Majburiy maydonlar va son qiymatlarini qayta ko'rib chiqing.",
      })
      return
    }

    const record = config.createRecord(values, editingRecord?.id)
    saveRecord(record)
    setModalOpen(false)
    setEditingRecord(null)
    setValues(createInitialValues(config))
    setErrors({})
    showToast({
      type: 'success',
      title: editingRecord ? 'Yozuv yangilandi' : "Yangi yozuv qo'shildi",
      description: `${config.title} bo'limi muvaffaqiyatli saqlandi.`,
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) {
      return
    }

    deleteRecord(deleteTarget.id)
    setDeleteTarget(null)
    showToast({
      type: 'success',
      title: "Yozuv o'chirildi",
      description: `${config.title} bo'limidagi tanlangan yozuv olib tashlandi.`,
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Operatsion bo'lim
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {config.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{config.description}</p>
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
                {new Intl.NumberFormat('uz-UZ').format(totalAmount)} so'm
              </p>
            </div>
          </div>
        </div>
      </section>

      <SearchBar
        addLabel={config.addLabel}
        dateValue={dateValue}
        onAdd={openCreateModal}
        onDateChange={setDateValue}
        onSearchChange={setSearchValue}
        placeholder={config.searchPlaceholder}
        searchValue={searchValue}
      />

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
          onDelete={(row) => setDeleteTarget(row)}
          onEdit={openEditModal}
          rows={filteredRecords}
        />
      ) : null}

      {!loading && records.length > 0 && filteredRecords.length === 0 ? (
        <EmptyState
          actionLabel="Filtrlarni tozalash"
          description="Tanlangan filtrlar bo'yicha natija topilmadi. Qidiruv yoki sanani o'zgartirib ko'ring."
          icon={Files}
          onAction={() => {
            setSearchValue('')
            setDateValue('')
          }}
          title="Natija topilmadi"
        />
      ) : null}

      <FormModal
        description={editingRecord ? 'Mavjud yozuvni yangilang.' : "Yangi ma'lumot qo'shing."}
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
        description="Ushbu amal qaytarib olinmaydi. Yozuv localStorage ichidan ham olib tashlanadi."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        open={Boolean(deleteTarget)}
        title="Yozuvni o'chirmoqchimisiz?"
      />
    </div>
  )
}
