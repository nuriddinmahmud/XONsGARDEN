import { ArrowDownUp, CalendarRange, Plus, RotateCcw, Search } from 'lucide-react'

interface SearchBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  dateFromValue: string
  onDateFromChange: (value: string) => void
  dateToValue: string
  onDateToChange: (value: string) => void
  sortValue: string
  onSortChange: (value: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  onAdd: () => void
  addLabel: string
  placeholder: string
}

export function SearchBar({
  searchValue,
  onSearchChange,
  dateFromValue,
  onDateFromChange,
  dateToValue,
  onDateToChange,
  sortValue,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  onAdd,
  addLabel,
  placeholder,
}: SearchBarProps) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,0.6fr))]">
        <div className="relative xl:col-span-2">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={placeholder}
            value={searchValue}
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
          <CalendarRange className="h-4 w-4 text-slate-400" />
          <input
            className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none"
            onChange={(event) => onDateFromChange(event.target.value)}
            type="date"
            value={dateFromValue}
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
          <CalendarRange className="h-4 w-4 text-slate-400" />
          <input
            className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none"
            onChange={(event) => onDateToChange(event.target.value)}
            type="date"
            value={dateToValue}
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
          <ArrowDownUp className="h-4 w-4 text-slate-400" />
          <select
            className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none"
            onChange={(event) => onSortChange(event.target.value)}
            value={sortValue}
          >
            <option value="date_desc">Sana ↓</option>
            <option value="date_asc">Sana ↑</option>
            <option value="amount_desc">Summa ↓</option>
            <option value="amount_asc">Summa ↑</option>
          </select>
        </label>

        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasActiveFilters}
          onClick={onClearFilters}
          type="button"
        >
          <RotateCcw className="h-4 w-4" />
          Tozalash
        </button>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          onClick={onAdd}
          type="button"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>
    </div>
  )
}
