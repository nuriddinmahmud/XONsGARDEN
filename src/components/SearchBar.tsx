import { Plus, Search } from 'lucide-react'

interface SearchBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  dateValue: string
  onDateChange: (value: string) => void
  onAdd: () => void
  addLabel: string
  placeholder: string
}

export function SearchBar({
  searchValue,
  onSearchChange,
  dateValue,
  onDateChange,
  onAdd,
  addLabel,
  placeholder,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)] sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          value={searchValue}
        />
      </div>

      <input
        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        onChange={(event) => onDateChange(event.target.value)}
        type="date"
        value={dateValue}
      />

      <button
        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        onClick={onAdd}
        type="button"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  )
}
