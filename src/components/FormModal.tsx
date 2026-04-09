import { X } from 'lucide-react'
import type { FormField, FormValues } from '../types'
import { cn } from '../utils/helpers'

interface FormModalProps {
  open: boolean
  title: string
  description: string
  fields: FormField[]
  values: FormValues
  errors: Record<string, string>
  onChange: (name: string, value: string) => void
  onSubmit: () => void
  onClose: () => void
  submitLabel: string
}

export function FormModal({
  open,
  title,
  description,
  fields,
  values,
  errors,
  onChange,
  onSubmit,
  onClose,
  submitLabel,
}: FormModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/35 p-4 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[30px] border border-white/70 bg-white p-6 shadow-[0_35px_90px_-40px_rgba(15,23,42,0.5)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </div>
            <button
              className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              onClick={onClose}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <label
                className={cn(
                  'flex flex-col gap-2',
                  field.type === 'textarea' ? 'md:col-span-2' : '',
                )}
                key={field.name}
              >
                <span className="text-sm font-semibold text-slate-700">
                  {field.label}
                  {field.required ? <span className="text-rose-500"> *</span> : null}
                </span>

                {field.type === 'textarea' ? (
                  <textarea
                    className={cn(
                      'min-h-[120px] rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4',
                      errors[field.name]
                        ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-emerald-300 focus:ring-emerald-100',
                    )}
                    onChange={(event) => onChange(field.name, event.target.value)}
                    placeholder={field.placeholder}
                    readOnly={field.readOnly}
                    value={values[field.name] ?? ''}
                  />
                ) : field.type === 'select' ? (
                  <select
                    className={cn(
                      'h-12 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4',
                      errors[field.name]
                        ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-emerald-300 focus:ring-emerald-100',
                    )}
                    onChange={(event) => onChange(field.name, event.target.value)}
                    value={values[field.name] ?? ''}
                  >
                    <option value="">Tanlang</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={cn(
                      'h-12 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4',
                      errors[field.name]
                        ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-emerald-300 focus:ring-emerald-100',
                      field.readOnly ? 'cursor-not-allowed bg-slate-100 text-slate-500' : '',
                    )}
                    min={field.min}
                    onChange={(event) => onChange(field.name, event.target.value)}
                    placeholder={field.placeholder}
                    readOnly={field.readOnly}
                    step={field.step}
                    type={field.type}
                    value={values[field.name] ?? ''}
                  />
                )}

                {errors[field.name] ? (
                  <span className="text-xs font-medium text-rose-600">{errors[field.name]}</span>
                ) : field.helperText ? (
                  <span className="text-xs text-slate-500">{field.helperText}</span>
                ) : null}
              </label>
            ))}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              Bekor qilish
            </button>
            <button
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              onClick={onSubmit}
              type="button"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
