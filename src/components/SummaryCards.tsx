import type { CategorySummary } from '../types'
import { formatCurrency } from '../utils/formatDate'

interface SummaryCardsProps {
  items: CategorySummary[]
}

export function SummaryCards({ items }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-600">{item.label}</span>
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
          </div>
          <p className="mt-4 text-2xl font-semibold text-slate-950">{formatCurrency(item.total)}</p>
          <p className="mt-1 text-sm text-slate-500">{item.count} ta yozuv</p>
        </div>
      ))}
    </div>
  )
}
