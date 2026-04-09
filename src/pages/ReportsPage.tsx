import { Download, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import { ChartCard } from '../components/ChartCard'
import { SummaryCards } from '../components/SummaryCards'
import { useRecordsMap } from '../hooks/useRecordsMap'
import {
  categoryMeta,
  getCategorySummaries,
  getMonthlyTrend,
} from '../utils/calculations'
import { formatCurrency } from '../utils/formatDate'

export function ReportsPage() {
  const recordsMap = useRecordsMap()
  const summaries = useMemo(() => getCategorySummaries(recordsMap), [recordsMap])
  const monthlyTrend = useMemo(() => getMonthlyTrend(recordsMap, 8), [recordsMap])

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Analytics
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Hisobotlar va analitika
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              localStorage ma'lumotlari asosida barcha kategoriya bo'yicha xarajat taqsimoti, oylik trendlar va kesimlar shu sahifada hisoblanadi.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            <Download className="h-4 w-4" />
            Frontend hisobot rejimi
          </div>
        </div>
      </section>

      <SummaryCards items={summaries} />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <ChartCard
          description="Kategoriya bo'yicha jami xarajatlar taqqoslanadi."
          title="Xarajatlar taqsimoti"
        >
          <div className="h-[360px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={summaries}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="total" radius={[12, 12, 0, 0]}>
                  {summaries.map((entry) => (
                    <Cell fill={entry.color} key={entry.key} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          description="Har bir bo'limning umumiy ulushi doira ko'rinishida."
          title="Kategoriya ulushi"
        >
          <div className="h-[360px]">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  data={summaries}
                  dataKey="total"
                  nameKey="label"
                  innerRadius={80}
                  outerRadius={125}
                  paddingAngle={3}
                >
                  {summaries.map((entry) => (
                    <Cell fill={entry.color} key={entry.key} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        description="Oylik xarajatlar trendida jami summa va asosiy bo'limlar birgalikda ko'rsatiladi."
        title="Oylik trendlar"
      >
        <div className="h-[380px]">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="totalFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0.04} />
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
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Area
                dataKey="jami"
                fill="url(#totalFill)"
                name="Jami"
                stroke="#0f766e"
                strokeWidth={3}
                type="monotone"
              />
              <Bar dataKey="workers" fill={categoryMeta.workers.color} name="Ishchilar" radius={[8, 8, 0, 0]} />
              <Bar dataKey="fertilizers" fill={categoryMeta.fertilizers.color} name="O'g'it" radius={[8, 8, 0, 0]} />
              <Bar dataKey="transports" fill={categoryMeta.transports.color} name="Transport" radius={[8, 8, 0, 0]} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaries.map((item) => (
          <div
            className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]"
            key={item.key}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-sm text-slate-500">{item.count} ta yozuv</p>
              </div>
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                style={{ backgroundColor: item.color }}
              >
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-5 text-2xl font-semibold text-slate-950">{formatCurrency(item.total)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
