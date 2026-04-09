/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import type { Toast } from '../types'

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast: (toast) => {
        const nextToast: Toast = {
          ...toast,
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        }

        setToasts((current) => [...current, nextToast])

        window.setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== nextToast.id))
        }, 3200)
      },
    }),
    [],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type]

          return (
            <div
              key={toast.id}
              className="pointer-events-auto rounded-2xl border border-white/70 bg-white/95 p-4 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.45)] backdrop-blur"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-sm text-slate-500">{toast.description}</p>
                  ) : null}
                </div>
                <button
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  onClick={() =>
                    setToasts((current) => current.filter((item) => item.id !== toast.id))
                  }
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
