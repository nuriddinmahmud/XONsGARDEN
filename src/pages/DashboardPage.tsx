import {
  AlertTriangle,
  ArrowDownUp,
  BadgeDollarSign,
  CalendarRange,
  CircleDollarSign,
  Coins,
  Layers3,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { useMemo } from 'react'
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
import { StatCard } from '../components/StatCard'
import { SummaryCards } from '../components/SummaryCards'
import { useFinancialRecords } from '../hooks/useFinancialRecords'
import { useSettings } from '../hooks/useSettings'
import {
  getAllTotals,
  getCategorySummaries,
  getCurrentMonthStats,
  getHighestCategory,
} from '../utils/calculations'
import {
  getDashboardAlerts,
  getDashboardSummaryItems,
  getDebtStatusDistribution,
  getFinancialHighlights,
  getIncomeTrendByDate,
  getMonthlyIncomeVsDebtComparison,
  getRecentDebtItems,
  getRecentIncomeItems,
} from '../utils/dashboardCalculations'
import { getOverdueDebtCount } from '../utils/debtCalculations'
import { formatDate, formatShortDate } from '../utils/formatDate'
import { formatCompactMoney, formatMoney } from '../utils/formatMoney'

function EmptyChartState({ text }: { text: string }) {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center text-sm leading-6 text-slate-500">
      {text}
    </div>
  )
}

export function DashboardPage() {
  const { recordsMap, debts, incomeRecords } = useFinancialRecords()
  const { currencyLabel } = useSettings()

  const expensesTotal = useMemo(() => getAllTotals(recordsMap), [recordsMap])
  const expenseSummaries = useMemo(
    () => getCategorySummaries(recordsMap).filter((item) => item.total > 0),
    [recordsMap],
  )
  const highestCategory = useMemo(() => getHighestCategory(recordsMap), [recordsMap])
  const currentMonthExpenses = useMemo(() => getCurrentMonthStats(recordsMap), [recordsMap])
  const financialSummaryItems = useMemo(
    () => getDashboardSummaryItems(incomeRecords, debts),
    [incomeRecords, debts],
  )
  const recentIncomeItems = useMemo(() => getRecentIncomeItems(incomeRecords), [incomeRecords])
  const recentDebtItems = useMemo(() => getRecentDebtItems(debts), [debts])
  const incomeTrend = useMemo(() => getIncomeTrendByDate(incomeRecords), [incomeRecords])
  const debtStatusDistribution = useMemo(() => getDebtStatusDistribution(debts), [debts])
  const monthlyComparison = useMemo(
    () => getMonthlyIncomeVsDebtComparison(incomeRecords, debts),
    [incomeRecords, debts],
  )
  const alerts = useMemo(() => getDashboardAlerts(incomeRecords, debts), [incomeRecords, debts])
  const highlights = useMemo(
    () => getFinancialHighlights(incomeRecords, debts, expensesTotal),
    [debts, expensesTotal, incomeRecords],
  )
  const overdueCount = useMemo(() => getOverdueDebtCount(debts), [debts])

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(5,150,105,0.92))] p-6 text-white shadow-[0_40px_100px_-55px_rgba(15,23,42,0.95)] md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
              <Sparkles className="h-4 w-4" />
              Dashboard
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
              Moliyaviy markaz
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">
              Daromad, qarzdorlik va mavjud xarajat bo'limlari endi bir sahifada ko'rinadi.
              Kundalik pul oqimi, qarz holati va asosiy ogohlantirishlarni shu yerda kuzating.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Umumiy daromad</p>
              <p className="mt-3 text-2xl font-semibold">
                {formatCompactMoney(highlights.totalIncome, currencyLabel)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Umumiy xarajat</p>
              <p className="mt-3 text-2xl font-semibold">
                {formatCompactMoney(expensesTotal, currencyLabel)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Sof balans</p>
              <p className="mt-3 text-2xl font-semibold">
                {formatCompactMoney(highlights.netBalance, currencyLabel)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <SummaryCards currencyLabel={currencyLabel} items={financialSummaryItems} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          accent="emerald"
          icon={CircleDollarSign}
          title="Joriy oy daromadi"
          value={formatMoney(highlights.currentMonthIncome, currencyLabel)}
        />
        <StatCard
          accent="rose"
          icon={CalendarRange}
          title="Joriy oy xarajati"
          value={formatMoney(currentMonthExpenses.total, currencyLabel)}
        />
        <StatCard
          accent={highlights.netBalance >= 0 ? 'blue' : 'amber'}
          icon={ArrowDownUp}
          title="So'nggi 30 kun daromadi"
          value={formatMoney(highlights.last30DaysIncome, currencyLabel)}
        />
        <StatCard
          accent={overdueCount > 0 ? 'rose' : 'slate'}
          icon={BadgeDollarSign}
          title="Muddati o'tgan qarzlar"
          value={`${overdueCount} ta`}
          description={formatMoney(highlights.unpaidDebtTotal, currencyLabel)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <ChartCard
          description="So'nggi 10 kunlik tushumlar bo'yicha kunlik trend."
          title="Daromad trendi"
        >
          {incomeTrend.some((item) => item.total > 0) ? (
            <div className="h-[320px]">
              <ResponsiveContainer height="100%" width="100%">
                <AreaChart data={incomeTrend}>
                  <defs>
                    <linearGradient id="incomeTrendFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.34} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                  />
                  <Tooltip formatter={(value) => formatMoney(Number(value), currencyLabel)} />
                  <Area
                    dataKey="total"
                    fill="url(#incomeTrendFill)"
                    name="Daromad"
                    stroke="#10b981"
                    strokeWidth={3}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState text="Daromad trendini chizish uchun hali yetarli yozuv yo'q." />
          )}
        </ChartCard>

        <ChartCard
          description="Qarzdorliklar holati bo'yicha taqsimot."
          title="Qarzdorlik holati"
        >
          {debtStatusDistribution.length > 0 ? (
            <div className="h-[320px]">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={debtStatusDistribution}
                    dataKey="total"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {debtStatusDistribution.map((entry) => (
                      <Cell fill={entry.color} key={entry.key} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(Number(value), currencyLabel)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState text="Qarzdorlik yozuvlari qo'shilgach holat diagrammasi shu yerda ko'rinadi." />
          )}
        </ChartCard>
      </div>

      <ChartCard
        description="So'nggi 6 oy davomida daromad, umumiy qarzdorlik va faol qarzlar taqqoslanadi."
        title="Oylik daromad va qarz taqqoslanishi"
      >
        {monthlyComparison.some(
          (item) => Number(item.income) > 0 || Number(item.debt) > 0 || Number(item.unpaidDebt) > 0,
        ) ? (
          <div className="h-[360px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={monthlyComparison}>
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
                <Bar dataKey="income" fill="#10b981" name="Daromad" radius={[8, 8, 0, 0]} />
                <Bar dataKey="debt" fill="#b45309" name="Qarzdorlik" radius={[8, 8, 0, 0]} />
                <Bar
                  dataKey="unpaidDebt"
                  fill="#e11d48"
                  name="Faol qarz"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChartState text="Oylik taqqoslash uchun daromad yoki qarzdorlik yozuvlari kutilmoqda." />
        )}
      </ChartCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard description="Eng yangi tushumlar ro'yxati." title="So'nggi daromadlar">
          {recentIncomeItems.length > 0 ? (
            <div className="space-y-4">
              {recentIncomeItems.map((item) => (
                <div
                  className="flex items-start justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-4"
                  key={item.id}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.badgeClass}`}
                      >
                        {item.badgeLabel}
                      </span>
                      <span className="text-xs text-slate-400">{formatShortDate(item.date)}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatMoney(item.amount, currencyLabel)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center text-sm leading-6 text-slate-500">
              Hozircha daromad yozuvlari yo'q.
            </p>
          )}
        </ChartCard>

        <ChartCard description="Eng yangi qarzdorlik yozuvlari." title="So'nggi qarzdorliklar">
          {recentDebtItems.length > 0 ? (
            <div className="space-y-4">
              {recentDebtItems.map((item) => (
                <div
                  className="flex items-start justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-4"
                  key={item.id}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.badgeClass}`}
                      >
                        {item.badgeLabel}
                      </span>
                      <span className="text-xs text-slate-400">{formatShortDate(item.date)}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatMoney(item.amount, currencyLabel)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center text-sm leading-6 text-slate-500">
              Hozircha qarzdorlik yozuvlari yo'q.
            </p>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard
          description={
            highestCategory
              ? `Eng katta xarajat bo'limi: ${highestCategory.label}`
              : 'Xarajat bo\'limlari bo\'yicha holat.'
          }
          title="Xarajat bo'limlari"
        >
          {expenseSummaries.length > 0 ? (
            <div className="space-y-4">
              {expenseSummaries
                .slice()
                .sort((left, right) => right.total - left.total)
                .map((item) => (
                  <div
                    className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50/80 p-4"
                    key={item.key}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
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
                          width: `${expensesTotal > 0 ? Math.max((item.total / expensesTotal) * 100, 6) : 0}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center text-sm leading-6 text-slate-500">
              Xarajat bo'limlari bo'yicha yozuvlar hali mavjud emas.
            </p>
          )}
        </ChartCard>

        <ChartCard description="Muddati o'tgan qarzlar va yirik yozuvlar bu yerda ko'rsatiladi." title="Ogohlantirishlar va eslatmalar">
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => {
                const toneClasses = {
                  rose: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
                  amber: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
                  emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
                  blue: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
                }

                return (
                  <div
                    className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4"
                    key={alert.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[alert.tone]}`}
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Eslatma
                        </span>
                        <p className="mt-3 text-sm font-semibold text-slate-900">{alert.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{alert.description}</p>
                        {alert.date ? (
                          <p className="mt-2 text-xs text-slate-400">{formatDate(alert.date)}</p>
                        ) : null}
                      </div>
                      {alert.amount !== undefined ? (
                        <p className="text-sm font-semibold text-slate-900">
                          {formatMoney(alert.amount, currencyLabel)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center text-sm leading-6 text-slate-500">
              Hozircha kritik ogohlantirishlar aniqlanmadi.
            </p>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Xarajat yozuvlari</p>
            </div>
          </div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">{currentMonthExpenses.count} ta</p>
          <p className="mt-2 text-sm text-slate-500">{formatMoney(currentMonthExpenses.total, currencyLabel)}</p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Sof balans</p>
            </div>
          </div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">
            {formatMoney(highlights.netBalance, currencyLabel)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Daromad minus xarajat va faol qarzlar
          </p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Eng katta bo'lim</p>
            </div>
          </div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">{highestCategory?.label ?? '-'}</p>
          <p className="mt-2 text-sm text-slate-500">
            {highestCategory ? formatMoney(highestCategory.total, currencyLabel) : "Ma'lumot yo'q"}
          </p>
        </div>
      </div>
    </div>
  )
}
