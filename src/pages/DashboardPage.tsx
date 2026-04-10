import {
  ArrowUpRight,
  BadgeDollarSign,
  CalendarRange,
  CircleDollarSign,
  Layers3,
  Sparkles,
} from 'lucide-react'
import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from '../components/ChartCard'
import { StatCard } from '../components/StatCard'
import { SummaryCards } from '../components/SummaryCards'
import { useRecordsMap } from '../hooks/useRecordsMap'
import { useSettings } from '../hooks/useSettings'
import {
  categoryMeta,
  getAllTotals,
  getCategorySummaries,
  getCurrentMonthCategoryTotals,
  getCurrentMonthStats,
  getHighestCategory,
  getMonthlyTrend,
  getPreviousMonthTotal,
  getRecentActivities,
} from '../utils/calculations'
import { formatDate, formatShortDate } from '../utils/formatDate'
import { formatCompactMoney, formatMoney } from '../utils/formatMoney'

export function DashboardPage() {
  const recordsMap = useRecordsMap()
  const { currencyLabel } = useSettings()

  const totals = useMemo(() => getAllTotals(recordsMap), [recordsMap])
  const summaries = useMemo(() => getCategorySummaries(recordsMap), [recordsMap])
  const highestCategory = useMemo(() => getHighestCategory(recordsMap), [recordsMap])
  const currentMonth = useMemo(() => getCurrentMonthStats(recordsMap), [recordsMap])
  const previousMonth = useMemo(() => getPreviousMonthTotal(recordsMap), [recordsMap])
  const monthlyTrend = useMemo(() => getMonthlyTrend(recordsMap), [recordsMap])
  const recentActivities = useMemo(() => getRecentActivities(recordsMap), [recordsMap])
  const categoryThisMonth = useMemo(
    () => getCurrentMonthCategoryTotals(recordsMap).filter((item) => item.total > 0),
    [recordsMap],
  )

  const monthDelta =
    previousMonth > 0
      ? `${Math.round((currentMonth.total / previousMonth - 1) * 100)}%`
      : "Yangi oy"

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(15,118,110,0.92))] p-6 text-white shadow-[0_40px_100px_-55px_rgba(15,23,42,0.95)] md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
              <Sparkles className="h-4 w-4" />
              Dashboard
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
              Xarajatlar
            </h1>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Umumiy xarajat</p>
              <p className="mt-3 text-2xl font-semibold">{formatCompactMoney(totals, currencyLabel)}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Joriy oy</p>
              <p className="mt-3 text-2xl font-semibold">
                {formatCompactMoney(currentMonth.total, currencyLabel)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Eng katta bo'lim</p>
              <p className="mt-3 text-2xl font-semibold">{highestCategory?.label ?? '-'}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard
          accent="emerald"
          icon={CircleDollarSign}
          title="Umumiy xarajat"
          value={formatMoney(totals, currencyLabel)}
        />
        <StatCard
          accent="blue"
          icon={CalendarRange}
          title="Joriy oy"
          value={formatMoney(currentMonth.total, currencyLabel)}
        />
        <StatCard
          accent="amber"
          icon={ArrowUpRight}
          title="Taqqoslash"
          value={formatMoney(currentMonth.average, currencyLabel)}
        />
        <StatCard
          accent="rose"
          icon={BadgeDollarSign}
          title="Lider"
          value={highestCategory?.label ?? '-'}
        />
      </div>

      <SummaryCards currencyLabel={currencyLabel} items={summaries} />

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <ChartCard title="Oylik dinamika">
          <div className="h-[320px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                />
                <Tooltip formatter={(value) => formatMoney(Number(value), currencyLabel)} />
                <Bar dataKey="jami" fill="#0f766e" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Kategoriya ulushi">
          <div className="h-[320px]">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={categoryThisMonth}
                  dataKey="total"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {categoryThisMonth.map((entry) => (
                    <Cell
                      fill={categoryMeta[entry.key as keyof typeof categoryMeta]?.color ?? '#0f766e'}
                      key={entry.key}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatMoney(Number(value), currencyLabel)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <ChartCard title="Kategoriyalar">
          <div className="space-y-4">
            {summaries
              .sort((a, b) => b.total - a.total)
              .map((item) => (
                <div
                  className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50/80 p-4"
                  key={item.key}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.count} ta</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatMoney(item.total, currencyLabel)}
                    </p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${totals > 0 ? Math.max((item.total / totals) * 100, 6) : 0}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </ChartCard>

        <ChartCard title="So'nggi yozuvlar">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                className="flex items-start justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-4"
                key={activity.id}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: `${categoryMeta[activity.category].color}18`,
                        color: categoryMeta[activity.category].color,
                      }}
                    >
                      {activity.label}
                    </span>
                    <span className="text-xs text-slate-400">{formatShortDate(activity.date)}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-900">{activity.description}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(activity.date)}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {formatMoney(activity.amount, currencyLabel)}
                </p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Taqqoslash</p>
            </div>
          </div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">{monthDelta}</p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-sm font-semibold text-slate-900">Lider</p>
          <p className="mt-5 text-2xl font-semibold text-slate-950">{highestCategory?.label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {highestCategory ? formatMoney(highestCategory.total, currencyLabel) : '-'}
          </p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-sm font-semibold text-slate-900">Yozuvlar</p>
          <p className="mt-5 text-2xl font-semibold text-slate-950">{currentMonth.count} ta</p>
        </div>
      </div>
    </div>
  )
}
