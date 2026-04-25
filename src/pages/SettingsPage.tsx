import {
  Building2,
  Download,
  Phone,
  Save,
  Upload,
  UserCircle2,
} from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { RouteLoader } from '../components/RouteLoader'
import { useToast } from '../context/ToastContext'
import { useSettings } from '../hooks/useSettings'
import { migrateLegacyLocalStorageToSupabase } from '../scripts/migrateLocalStorageToSupabase'
import type { AppSettings, AppStorageBackup } from '../types'
import { normalizeCurrencyLabel } from '../utils/formatMoney'
import {
  createStorageBackup,
  parseStorageBackup,
  readSettings,
  restoreStorageBackup,
} from '../utils/localStorage'

type SettingsErrors = Partial<Record<keyof AppSettings, string>>

function pickSettings(source: AppSettings): AppSettings {
  return {
    gardenName: source.gardenName,
    managerName: source.managerName,
    phone: source.phone,
    location: source.location,
    currencyLabel: source.currencyLabel,
  }
}

function getFieldClass(hasError: boolean) {
  return [
    'w-full rounded-2xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4',
    hasError
      ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-100'
      : 'border-slate-200 focus:border-emerald-300 focus:ring-emerald-100',
  ].join(' ')
}

function normalizeSettings(settings: AppSettings): AppSettings {
  return {
    gardenName: settings.gardenName.trim(),
    managerName: settings.managerName.trim(),
    phone: settings.phone.trim(),
    location: settings.location.trim(),
    currencyLabel: normalizeCurrencyLabel(settings.currencyLabel),
  }
}

function validateSettings(settings: AppSettings) {
  const nextErrors: SettingsErrors = {}
  const normalized = normalizeSettings(settings)

  if (normalized.gardenName.length < 3) {
    nextErrors.gardenName = "Loyiha nomi kamida 3 ta belgidan iborat bo'lsin."
  }

  if (normalized.managerName.length < 2) {
    nextErrors.managerName = "Mas'ul shaxs nomi kamida 2 ta belgidan iborat bo'lsin."
  }

  if (!/^[+0-9()\s-]{7,20}$/.test(normalized.phone)) {
    nextErrors.phone = "Telefon raqami faqat raqam, bo'sh joy va +()- belgilaridan iborat bo'lsin."
  }

  if (normalized.currencyLabel.length > 12) {
    nextErrors.currencyLabel = "Valuta yorlig'i juda uzun. Qisqaroq yozing."
  }

  if (normalized.location.length < 5) {
    nextErrors.location = "Joylashuv kamida 5 ta belgidan iborat bo'lsin."
  }

  return {
    errors: nextErrors,
    normalized,
    isValid: Object.keys(nextErrors).length === 0,
  }
}

export function SettingsPage() {
  const settingsResource = useSettings()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [settings, setSettings] = useState<AppSettings>(() => pickSettings(settingsResource))
  const [errors, setErrors] = useState<SettingsErrors>({})
  const [pendingRestore, setPendingRestore] = useState<{
    backup: AppStorageBackup
    fileName: string
  } | null>(null)
  const [pendingMigration, setPendingMigration] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)

  useEffect(() => {
    if (settingsResource.loading) {
      return
    }

    setSettings({
      gardenName: settingsResource.gardenName,
      managerName: settingsResource.managerName,
      phone: settingsResource.phone,
      location: settingsResource.location,
      currencyLabel: settingsResource.currencyLabel,
    })
  }, [
    settingsResource.currencyLabel,
    settingsResource.gardenName,
    settingsResource.loading,
    settingsResource.location,
    settingsResource.managerName,
    settingsResource.phone,
  ])

  if (settingsResource.loading) {
    return <RouteLoader />
  }

  const updateField = (key: keyof AppSettings, value: string) => {
    setSettings((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = validateSettings(settings)

    if (!result.isValid) {
      setErrors(result.errors)
      showToast({
        type: 'error',
        title: "Sozlamalar saqlanmadi",
        description: "Forma maydonlarini tekshirib, xatolarni to'g'rilang.",
      })
      return
    }

    setIsSaving(true)

    try {
      setErrors({})
      const nextSettings = await settingsResource.saveSettings(result.normalized)
      setSettings(nextSettings)
      showToast({
        type: 'success',
        title: 'Sozlamalar saqlandi',
        description: 'Yangilandi.',
      })
    } catch (saveError) {
      showToast({
        type: 'error',
        title: "Sozlamalar saqlanmadi",
        description: saveError instanceof Error ? saveError.message : 'Qayta urinib ko\'ring.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const backup = await createStorageBackup()
      const fileName = `xons-garden-backup-${new Date().toISOString().slice(0, 10)}.json`
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)

      showToast({
        type: 'success',
        title: 'Zaxira fayli yaratildi',
        description: fileName,
      })
    } catch (exportError) {
      showToast({
        type: 'error',
        title: 'Eksport amalga oshmadi',
        description: exportError instanceof Error ? exportError.message : 'Qayta urinib ko\'ring.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      const rawText = await file.text()
      const parsed = parseStorageBackup(rawText)

      if (!parsed.success) {
        showToast({
          type: 'error',
          title: 'Import amalga oshmadi',
          description: parsed.message,
        })
        return
      }

      setPendingRestore({
        backup: parsed.backup,
        fileName: file.name,
      })
    } catch {
      showToast({
        type: 'error',
        title: "Faylni o'qib bo'lmadi",
        description: 'Faylni tekshiring.',
      })
    }
  }

  const confirmRestore = async () => {
    if (!pendingRestore) {
      return
    }

    const result = await restoreStorageBackup(pendingRestore.backup)

    if (!result.success) {
      showToast({
        type: 'error',
        title: 'Tiklash amalga oshmadi',
        description: result.message,
      })
      return
    }

    const nextSettings = await readSettings()

    setSettings(nextSettings)
    setErrors({})
    setPendingRestore(null)
    showToast({
      type: 'success',
      title: "Ma'lumotlar tiklandi",
      description: pendingRestore.fileName,
    })
  }

  const confirmMigration = async () => {
    setIsMigrating(true)

    try {
      const result = await migrateLegacyLocalStorageToSupabase()

      if (!result.success) {
        showToast({
          type: 'error',
          title: 'Migratsiya amalga oshmadi',
          description: result.message,
        })
        return
      }

      const nextSettings = await readSettings()
      setSettings(nextSettings)
      setErrors({})
      setPendingMigration(false)
      showToast({
        type: 'success',
        title: 'localStorage ma\'lumotlari ko\'chirildi',
        description: 'Supabase jadvallari yangilandi.',
      })
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Sozlamalar</h1>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form
          className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]"
          onSubmit={handleSave}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Loyiha nomi</span>
              <input
                className={`${getFieldClass(Boolean(errors.gardenName))} h-12`}
                onChange={(event) => updateField('gardenName', event.target.value)}
                value={settings.gardenName}
              />
              {errors.gardenName ? (
                <span className="mt-2 block text-xs font-medium text-rose-600">
                  {errors.gardenName}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Mas'ul shaxs</span>
              <input
                className={`${getFieldClass(Boolean(errors.managerName))} h-12`}
                onChange={(event) => updateField('managerName', event.target.value)}
                value={settings.managerName}
              />
              {errors.managerName ? (
                <span className="mt-2 block text-xs font-medium text-rose-600">
                  {errors.managerName}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Telefon</span>
              <input
                className={`${getFieldClass(Boolean(errors.phone))} h-12`}
                onChange={(event) => updateField('phone', event.target.value)}
                value={settings.phone}
              />
              {errors.phone ? (
                <span className="mt-2 block text-xs font-medium text-rose-600">{errors.phone}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Valuta yorlig'i</span>
              <input
                className={`${getFieldClass(Boolean(errors.currencyLabel))} h-12`}
                onChange={(event) => updateField('currencyLabel', event.target.value)}
                value={settings.currencyLabel}
              />
              {errors.currencyLabel ? (
                <span className="mt-2 block text-xs font-medium text-rose-600">
                  {errors.currencyLabel}
                </span>
              ) : null}
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Joylashuv</span>
              <textarea
                className={`${getFieldClass(Boolean(errors.location))} min-h-[130px] py-3`}
                onChange={(event) => updateField('location', event.target.value)}
                value={settings.location}
              />
              {errors.location ? (
                <span className="mt-2 block text-xs font-medium text-rose-600">
                  {errors.location}
                </span>
              ) : null}
            </label>
          </div>

          <button
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            disabled={isSaving}
            type="submit"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </form>

        <div className="space-y-4">
          {settingsResource.error ? (
            <div className="rounded-[32px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {settingsResource.error}
            </div>
          ) : null}

          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-950">{settings.gardenName}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{settings.location}</p>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{settings.managerName}</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <Phone className="h-4 w-4" />
              {settings.phone}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">JSON</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Eksport va import.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                disabled={isExporting}
                onClick={handleExport}
                type="button"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Eksport...' : 'Eksport'}
              </button>

              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
            </div>

            <input
              accept="application/json"
              className="hidden"
              onChange={handleImportChange}
              ref={fileInputRef}
              type="file"
            />

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Import joriy ma'lumotni almashtiradi.
            </p>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]">
            <p className="text-sm font-semibold text-slate-900">Legacy migratsiya</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Brauzer localStorage ichidagi eski yozuvlarni Supabase jadvallariga ko'chiradi.
            </p>

            <button
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              disabled={isMigrating}
              onClick={() => setPendingMigration(true)}
              type="button"
            >
              <Upload className="h-4 w-4" />
              {isMigrating ? 'Ko\'chirilmoqda...' : 'localStorage -> Supabase'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        cancelLabel="Bekor qilish"
        confirmLabel="Tiklash"
        description={
          pendingRestore
            ? `${pendingRestore.fileName} bilan joriy ma'lumotlar almashtiriladi.`
            : ''
        }
        onCancel={() => setPendingRestore(null)}
        onConfirm={confirmRestore}
        open={Boolean(pendingRestore)}
        title="JSON tiklash"
      />

      <ConfirmDialog
        cancelLabel="Bekor qilish"
        confirmLabel="Ko'chirish"
        description="Brauzer localStorage ma'lumotlari Supabase jadvallari bilan almashtiriladi."
        onCancel={() => setPendingMigration(false)}
        onConfirm={confirmMigration}
        open={pendingMigration}
        title="Legacy ma'lumotlarni ko'chirish"
      />
    </div>
  )
}
