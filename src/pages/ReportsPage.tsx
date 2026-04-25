import { Download, ExternalLink, Filter, Layers3 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from '../components/ChartCard'
import { DataTable } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { RouteLoader } from '../components/RouteLoader'
import { StatCard } from '../components/StatCard'
import { SummaryCards } from '../components/SummaryCards'
import { useFinancialRecords } from '../hooks/useFinancialRecords'
import { useSettings } from '../hooks/useSettings'
import type { TableColumn } from '../types'
import type { ReportDebtStatusFilter, ReportGroupBy, ReportModuleFilter, ReportRow } from '../types/report'
import { DEBT_STATUS_META, DEBT_STATUS_OPTIONS } from '../utils/debtCalculations'
import { formatDate } from '../utils/formatDate'
import { formatMoney } from '../utils/formatMoney'
import {
  buildReportRows,
  filterReportRows,
  getReportModuleSummaries,
  getReportMonthlyDatasets,
  getReportNetBalance,
  getReportSummaryItems,
  groupReportRows,
  reportGroupOptions,
  reportModuleOptions,
} from '../utils/reportCalculations'

function EmptyChartState({ text }: { text: string }) {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center text-sm leading-6 text-slate-500">
      {text}
    </div>
  )
}

function toCsvValue(value: string | number) {
  const text = String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export function ReportsPage() {
  const navigate = useNavigate()
  const { recordsMap, debts, incomeRecords, loading, error } = useFinancialRecords()
  const { currencyLabel } = useSettings()
  const [searchValue, setSearchValue] = useState('')
  const [moduleFilter, setModuleFilter] = useState<ReportModuleFilter>('all')
  const [debtStatusFilter, setDebtStatusFilter] = useState<ReportDebtStatusFilter>('all')
  const [dateFromValue, setDateFromValue] = useState('')
  const [dateToValue, setDateToValue] = useState('')
  const [groupBy, setGroupBy] = useState<ReportGroupBy>('none')

  const allRows = useMemo(
    () => buildReportRows(recordsMap, incomeRecords, debts),
    [debts, incomeRecords, recordsMap],
  )
  const filteredRows = useMemo(
    () =>
      filterReportRows(
        allRows,
        moduleFilter,
        searchValue,
        dateFromValue,
        dateToValue,
        debtStatusFilter,
      ),
    [allRows, dateFromValue, dateToValue, debtStatusFilter, moduleFilter, searchValue],
  )
  const summaryItems = useMemo(() => getReportSummaryItems(filteredRows), [filteredRows])
  const netBalance = useMemo(() => getReportNetBalance(filteredRows), [filteredRows])
  const moduleSummaries = useMemo(() => getReportModuleSummaries(filteredRows), [filteredRows])
  const monthlyDataset = useMemo(() => getReportMonthlyDatasets(filteredRows), [filteredRows])
  const groupedRows = useMemo(() => groupReportRows(filteredRows, groupBy), [filteredRows, groupBy])
  const hasActiveFilters = Boolean(
    searchValue.trim() ||
      moduleFilter !== 'all' ||
      debtStatusFilter !== 'all' ||
      dateFromValue ||
      dateToValue ||
      groupBy !== 'none',
  )

  const tableContext = useMemo(
    () => ({
      currencyLabel,
    }),
    [currencyLabel],
  )

  const columns = useMemo<TableColumn<ReportRow>[]>(
    () => [
      {
        key: 'date',
        label: 'Sana',
        render: (row) => (
          <div className="min-w-[8rem]">
            <p className="font-medium text-slate-900">{formatDate(row.date)}</p>
            <p className="mt-1 text-xs text-slate-500">{row.date}</p>
          </div>
        ),
      },
      {
        key: 'module',
        label: 'Modul turi',
        render: (row) => (
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${row.badgeClass}`}>
            {row.moduleLabel}
          </span>
        ),
      },
      {
        key: 'title',
        label: 'Nomi / Kim / Sabab',
        render: (row) => (
          <div className="min-w-[12rem] max-w-[18rem]">
            <p className="font-semibold text-slate-900">{row.title}</p>
            <p className="mt-1 text-sm text-slate-500">{row.subtitle || row.moduleLabel}</p>
          </div>
        ),
      },
      {
        key: 'category',
        label: 'Kategoriya / Holat',
        render: (row) =>
          row.moduleType === 'debt' ? (
            <div className="flex flex-col items-start gap-2">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {row.categoryLabel || 'Kategoriya'}
              </span>
              {row.debtStatus ? (
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${DEBT_STATUS_META[row.debtStatus].badgeClass}`}
                >
                  {DEBT_STATUS_META[row.debtStatus].label}
                </span>
              ) : null}
            </div>
          ) : row.categoryLabel ? (
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {row.categoryLabel}
            </span>
          ) : (
            <span className="text-slate-400">-</span>
          ),
      },
      {
        key: 'amount',
        label: 'Summa',
        render: (row, context) => (
          <span className="font-semibold text-slate-900">
            {formatMoney(row.amount, context.currencyLabel)}
          </span>
        ),
      },
      {
        key: 'extra',
        label: "Qo'shimcha ma'lumot",
        render: (row) =>
          row.extraInfo ? (
            <div className="max-w-[18rem] whitespace-normal leading-6 text-slate-600">{row.extraInfo}</div>
          ) : (
            <span className="text-slate-400">-</span>
          ),
      },
    ],
    [],
  )

  if (loading) {
    return <RouteLoader />
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
        {error}
      </div>
    )
  }

  const handleExport = () => {
    if (!filteredRows.length) {
      return
    }

    const rows = [
      ['Sana', 'Modul turi', 'Nomi / Kim / Sabab', 'Kategoriya / Holat', 'Summa', "Qo'shimcha ma'lumot"],
      ...filteredRows.map((row) => [
        row.date,
        row.moduleLabel,
        row.title,
        row.moduleType === 'debt' && row.debtStatus
          ? `${row.categoryLabel || ''} / ${DEBT_STATUS_META[row.debtStatus].label}`
          : row.categoryLabel || '-',
        row.amount,
        row.extraInfo || '',
      ]),
    ]

    const csvContent = rows
      .map((row) => row.map((cell) => toCsvValue(cell)).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `xons-garden-report-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Hisobotlar
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Yig'ma analitika
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Daromad, qarzdorlik va mavjud xarajat bo'limlari bir xil hisobot tizimida ko'rsatiladi.
            </p>
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={!filteredRows.length}
            onClick={handleExport}
            type="button"
          >
            <Download className="h-4 w-4" />
            CSV eksport
          </button>
        </div>
      </section>

      <SummaryCards currencyLabel={currencyLabel} items={summaryItems} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          accent={netBalance >= 0 ? 'emerald' : 'rose'}
          icon={Layers3}
          title="Sof balans"
          value={formatMoney(netBalance, currencyLabel)}
        />
        <StatCard
          accent="blue"
          icon={Filter}
          title="Filtrlangan yozuvlar"
          value={`${filteredRows.length} ta`}
          description={`${moduleSummaries.length} ta modul ko'rinmoqda`}
        />
        <StatCard
          accent="amber"
          icon={Download}
          title="Eksportga tayyor"
          value={`${filteredRows.length} qator`}
          description="Joriy filtr bo'yicha CSV fayl olinadi"
        />
      </div>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_repeat(5,minmax(0,0.68fr))_auto]">
          <div className="relative">
            <input
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Daromad, qarz yoki boshqa modullar bo'yicha qidiring"
              value={searchValue}
            />
          </div>

          <select
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            onChange={(event) => setModuleFilter(event.target.value as ReportModuleFilter)}
            value={moduleFilter}
          >
            {reportModuleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            onChange={(event) => setDebtStatusFilter(event.target.value as ReportDebtStatusFilter)}
            value={debtStatusFilter}
          >
            <option value="all">Barcha qarz holatlari</option>
            {DEBT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            onChange={(event) => setDateFromValue(event.target.value)}
            type="date"
            value={dateFromValue}
          />

          <input
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            onChange={(event) => setDateToValue(event.target.value)}
            type="date"
            value={dateToValue}
          />

          <select
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            onChange={(event) => setGroupBy(event.target.value as ReportGroupBy)}
            value={groupBy}
          >
            {reportGroupOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!hasActiveFilters}
            onClick={() => {
              setSearchValue('')
              setModuleFilter('all')
              setDebtStatusFilter('all')
              setDateFromValue('')
              setDateToValue('')
              setGroupBy('none')
            }}
            type="button"
          >
            Tozalash
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <ChartCard
          description="Filtrlangan yozuvlar bo'yicha modul kesimidagi umumiy summalar."
          title="Modullar kesimida"
        >
          {moduleSummaries.length > 0 ? (
            <div className="h-[360px]">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={moduleSummaries}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                  />
                  <Tooltip formatter={(value) => formatMoney(Number(value), currencyLabel)} />
                  <Bar dataKey="total" radius={[12, 12, 0, 0]}>
                    {moduleSummaries.map((entry) => (
                      <Cell fill={entry.color} key={entry.key} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState text="Modul diagrammasi uchun mos yozuv topilmadi." />
          )}
        </ChartCard>

        <ChartCard description="Filtrlangan yozuvlarning ulushi." title="Ulush">
          {moduleSummaries.length > 0 ? (
            <div className="h-[360px]">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    data={moduleSummaries}
                    dataKey="total"
                    nameKey="label"
                    innerRadius={80}
                    outerRadius={125}
                    paddingAngle={3}
                  >
                    {moduleSummaries.map((entry) => (
                      <Cell fill={entry.color} key={entry.key} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(Number(value), currencyLabel)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState text="Ulush diagrammasi uchun yozuv topilmadi." />
          )}
        </ChartCard>
      </div>

      <ChartCard
        description="So'nggi 6 oy bo'yicha daromad, xarajat, qarzdorlik va balans trendi."
        title="Oylik moliyaviy oqim"
      >
        {monthlyDataset.some(
          (item) =>
            Number(item.income) > 0 ||
            Number(item.expenses) > 0 ||
            Number(item.debt) > 0 ||
            Number(item.balance) !== 0,
        ) ? (
          <div className="h-[380px]">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={monthlyDataset}>
                <defs>
                  <linearGradient id="reportIncomeFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                />
                <Tooltip formatter={(value) => formatMoney(Number(value), currencyLabel)} />
                <Legend />
                <Area
                  dataKey="income"
                  fill="url(#reportIncomeFill)"
                  name="Daromad"
                  stroke="#10b981"
                  strokeWidth={3}
                  type="monotone"
                />
                <Bar dataKey="expenses" fill="#0f766e" name="Xarajat" radius={[8, 8, 0, 0]} />
                <Bar dataKey="debt" fill="#b45309" name="Qarzdorlik" radius={[8, 8, 0, 0]} />
                <Area
                  dataKey="balance"
                  fillOpacity={0}
                  name="Balans"
                  stroke="#2563eb"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChartState text="Oylik oqim grafigi uchun ma'lumot yetarli emas." />
        )}
      </ChartCard>

      {groupedRows.length === 0 ? (
        <EmptyState
          description="Filtrlarni o'zgartiring yoki yangi daromad va qarzdorlik yozuvlari qo'shing."
          icon={Layers3}
          title="Hisobot uchun mos yozuv topilmadi"
        />
      ) : (
        <div className="space-y-6">
          {groupedRows.map((section) => (
            <section className="space-y-3" key={section.key}>
              <div className="flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{section.label}</h3>
                  <p className="mt-1 text-sm text-slate-500">{section.rows.length} ta yozuv</p>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {formatMoney(section.total, currencyLabel)}
                </p>
              </div>

              <DataTable
                actionsLabel="O'tish"
                columns={columns}
                context={tableContext}
                renderActions={(row) => (
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    onClick={() => navigate(row.modulePath)}
                    type="button"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ochish
                  </button>
                )}
                rows={section.rows}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
