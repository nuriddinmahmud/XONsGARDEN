import type { LucideIcon } from 'lucide-react'
import { cn } from '../utils/helpers'

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
  accent?: 'emerald' | 'blue' | 'amber' | 'slate' | 'rose'
}

const accentClasses = {
  emerald: 'from-emerald-500/15 to-emerald-100 text-emerald-700',
  blue: 'from-blue-500/15 to-blue-100 text-blue-700',
  amber: 'from-amber-500/15 to-amber-100 text-amber-700',
  slate: 'from-slate-500/15 to-slate-100 text-slate-700',
  rose: 'from-rose-500/15 to-rose-100 text-rose-700',
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = 'emerald',
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>

        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br',
            accentClasses[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
