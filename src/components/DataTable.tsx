import { PencilLine, Trash2 } from 'lucide-react'
import type { TableColumn, TableRenderContext } from '../types'

interface DataTableProps<T extends { id: string }> {
  columns: TableColumn<T>[]
  context: TableRenderContext
  rows: T[]
  onEdit: (row: T) => void
  onDelete: (row: T) => void
}

export function DataTable<T extends { id: string }>({
  columns,
  context,
  rows,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th
                    className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                    key={column.key}
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="border-t border-slate-100" key={row.id}>
                  {columns.map((column) => (
                    <td className="px-5 py-4 text-sm text-slate-700" key={column.key}>
                      {column.render(row, context)}
                    </td>
                  ))}
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => onEdit(row)}
                        type="button"
                      >
                        <PencilLine className="h-4 w-4" />
                      </button>
                      <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => onDelete(row)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {rows.map((row) => (
          <div
            className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]"
            key={row.id}
          >
            <div className="space-y-3">
              {columns.map((column) => (
                <div className="flex items-start justify-between gap-4" key={column.key}>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {column.label}
                  </span>
                  <div className="text-right text-sm text-slate-700">
                    {column.render(row, context)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => onEdit(row)}
                type="button"
              >
                <PencilLine className="h-4 w-4" />
                Tahrirlash
              </button>
              <button
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                onClick={() => onDelete(row)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                O'chirish
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
