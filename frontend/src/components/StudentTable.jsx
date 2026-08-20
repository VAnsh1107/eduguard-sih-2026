import { useState, useMemo } from 'react'
import { MagnifyingGlass, CaretUp, CaretDown, Eye } from '@phosphor-icons/react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import RiskBadge from './RiskBadge'

function Sparkline({ data, risk }) {
  const chartData = data.map((val, idx) => ({ id: idx, value: val }))
  const strokeColor =
    risk === 'High' ? '#f43f5e' :
    risk === 'Medium' ? '#f59e0b' : '#10b981'

  return (
    <div className="w-14 h-6 opacity-80" onClick={e => e.stopPropagation()}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function StudentTable({
  students = [],
  onViewStudent,
  loading = false,
  search,
  setSearch,
  riskFilter,
  setRiskFilter,
  flashingIds = new Set(),
}) {
  const [sortBy, setSortBy]     = useState('dropout_risk')
  const [sortDir, setSortDir]   = useState('desc')

  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const filtered = useMemo(() => {
    let arr = [...students]
    if (search) {
      const q = search.toLowerCase()
      arr = arr.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q)
      )
    }
    if (riskFilter !== 'all') {
      arr = arr.filter(s => s.risk_label === riskFilter)
    }
    arr.sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
    return arr
  }, [students, search, sortBy, sortDir, riskFilter])

  function SortIcon({ col }) {
    if (sortBy !== col) return <span className="w-3" />
    return sortDir === 'asc'
      ? <CaretUp size={12} className="text-blue-400" />
      : <CaretDown size={12} className="text-blue-400" />
  }

  function Th({ col, label }) {
    return (
      <th
        onClick={() => toggleSort(col)}
        className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide cursor-pointer select-none hover:text-zinc-300 transition-colors"
      >
        <span className="flex items-center gap-1">{label} <SortIcon col={col} /></span>
      </th>
    )
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-12 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-white/[0.08] rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'Low', 'Medium', 'High'].map(r => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                riskFilter === r
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 border border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              {r === 'all' ? 'All Risk' : `${r} Risk`}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-600 font-mono">{filtered.length} students</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-white/[0.06] bg-zinc-900/50">
            <tr>
              <Th col="name"         label="Student"    />
              <Th col="department"   label="Department" />
              <Th col="semester"     label="Sem"        />
              <Th col="gpa"          label="GPA"        />
              <Th col="attendance_rate" label="Attendance" />
              <Th col="dropout_risk" label="Risk & Trend" />
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-zinc-600 text-sm">
                  No students match your filters.
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr
                key={s.student_id}
                className={`transition-colors ${
                  flashingIds.has(s.student_id)
                    ? 'row-flash'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-sm text-zinc-200">{s.name}</div>
                  <div className="text-xs text-zinc-600 font-mono">{s.student_id}</div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">{s.department}</td>
                <td className="px-4 py-3 text-sm text-zinc-400 font-mono">Sem {s.semester}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-mono font-medium ${
                    s.gpa >= 7 ? 'text-emerald-400' :
                    s.gpa >= 5 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {s.gpa.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          s.attendance_rate >= 0.75 ? 'bg-emerald-500' :
                          s.attendance_rate >= 0.60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${s.attendance_rate * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-zinc-500">
                      {Math.round(s.attendance_rate * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <RiskBadge level={s.risk_label} />
                    {s.risk_history && s.risk_history.length > 0 && (
                      <Sparkline data={s.risk_history} risk={s.risk_label} />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onViewStudent?.(s)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 border border-white/[0.06] hover:border-blue-500/30 transition-all"
                  >
                    <Eye size={13} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
