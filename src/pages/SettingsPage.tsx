import { Building2, Phone, Save, UserCircle2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useToast } from '../context/ToastContext'
import { useSettings } from '../hooks/useSettings'
import { writeSettings } from '../utils/localStorage'

export function SettingsPage() {
  const initialSettings = useSettings()
  const { showToast } = useToast()
  const [settings, setSettings] = useState(initialSettings)

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    writeSettings(settings)
    showToast({
      type: 'success',
      title: 'Sozlamalar saqlandi',
      description: "Profil va loyiha ma'lumotlari yangilandi.",
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Profil
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Sozlamalar va profil
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Dashboard sarlavhalari, mas'ul shaxs va valuta ko'rsatkichlarini shu yerda boshqarishingiz mumkin.
        </p>
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
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                onChange={(event) =>
                  setSettings((current) => ({ ...current, gardenName: event.target.value }))
                }
                value={settings.gardenName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Mas'ul shaxs</span>
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                onChange={(event) =>
                  setSettings((current) => ({ ...current, managerName: event.target.value }))
                }
                value={settings.managerName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Telefon</span>
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                onChange={(event) =>
                  setSettings((current) => ({ ...current, phone: event.target.value }))
                }
                value={settings.phone}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Valuta yorlig'i</span>
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                onChange={(event) =>
                  setSettings((current) => ({ ...current, currencyLabel: event.target.value }))
                }
                value={settings.currencyLabel}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Joylashuv</span>
              <textarea
                className="min-h-[130px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                onChange={(event) =>
                  setSettings((current) => ({ ...current, location: event.target.value }))
                }
                value={settings.location}
              />
            </label>
          </div>

          <button
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            type="submit"
          >
            <Save className="h-4 w-4" />
            Saqlash
          </button>
        </form>

        <div className="space-y-4">
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
                <p className="text-sm text-slate-500">Panel administratori</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <Phone className="h-4 w-4" />
              {settings.phone}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
