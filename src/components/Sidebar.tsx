import { Leaf, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navigationItems } from '../constants/navigation'
import { useSettings } from '../hooks/useSettings'
import { cn } from '../utils/helpers'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const settings = useSettings()

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm transition lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[19rem] flex-col border-r border-white/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.94),_rgba(248,250,252,0.92))] px-5 pb-5 pt-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] transition duration-300 lg:z-30 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Admin
              </p>
              <h1 className="text-lg font-semibold text-slate-950">{settings.gardenName}</h1>
            </div>
          </div>

          <button
            className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 flex-1 overflow-y-auto">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      'group flex items-start gap-3 rounded-3xl px-4 py-3 transition',
                      isActive
                        ? 'bg-slate-950 text-white shadow-[0_20px_45px_-28px_rgba(15,23,42,0.8)]'
                        : 'text-slate-600 hover:bg-white hover:text-slate-950',
                    )
                  }
                  key={item.path}
                  onClick={onClose}
                  to={item.path}
                >
                  <div className="mt-0.5 rounded-2xl bg-white/10 p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{item.label}</div>
                    {item.description ? (
                      <div className="mt-1 text-xs leading-5 text-inherit/75">{item.description}</div>
                    ) : null}
                  </div>
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="rounded-3xl bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">Xarajatlar</p>
        </div>
      </aside>
    </>
  )
}
