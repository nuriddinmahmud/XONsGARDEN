import { LogOut, Menu, ShieldCheck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'
import { navigationItems } from '../constants/navigation'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSettings } from '../hooks/useSettings'
import { formatDate } from '../utils/formatDate'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { showToast } = useToast()
  const settings = useSettings()
  const gardenName = settings.gardenName || "XON's Garden"

  const currentItem = navigationItems.find((item) => item.path === location.pathname)

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/70 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-start gap-3">
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="rounded-2xl border border-white/70 bg-white/85 px-3 py-2 shadow-sm">
            <BrandLogo className="h-9" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {currentItem?.label ?? 'Boshqaruv'}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {currentItem?.description ?? gardenName}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{settings.managerName}</p>
                <p className="text-xs text-slate-500">{formatDate(new Date().toISOString())}</p>
              </div>
            </div>
          </div>

          <button
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            onClick={async () => {
              try {
                await logout()
                navigate('/login')
                showToast({
                  type: 'info',
                  title: 'Sessiya yakunlandi',
                  description: 'Admin paneldan xavfsiz chiqildi.',
                })
              } catch (error) {
                showToast({
                  type: 'error',
                  title: 'Chiqishda xatolik',
                  description: error instanceof Error ? error.message : 'Qayta urinib ko\'ring.',
                })
              }
            }}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Chiqish
          </button>
        </div>
      </div>
    </header>
  )
}
