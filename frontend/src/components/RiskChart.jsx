import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

const COLORS = {
  Low:    '#10b981',
  Medium: '#f59e0b',
  High:   '#f43f5e',
}

// ── Donut / Pie chart for risk distribution ───────────────────────────────────
export function RiskDonut({ distribution = {} }) {
  const data = Object.entries(distribution).map(([name, value]) => ({ name, value }))

  const CustomLabel = ({ cx, cy }) => (
    <>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#f4f4f5" className="text-xl font-bold" fontSize={26} fontWeight={700}>
        {Object.values(distribution).reduce((a, b) => a + b, 0).toLocaleString()}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#71717a" fontSize={12}>
        students
      </text>
    </>
  )

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={68}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={CustomLabel}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] || '#3b82f6'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f4f4f5' }}
          formatter={(val, name) => [`${val} students`, `${name} Risk`]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Department bar chart ──────────────────────────────────────────────────────
export function DeptBarChart({ data = [] }) {
  const sliced = data.slice(0, 7)
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={sliced} layout="vertical" margin={{ left: 16, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="department" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f4f4f5' }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
        <Bar dataKey="low"    name="Low"    fill={COLORS.Low}    radius={[0,2,2,0]} stackId="a" />
        <Bar dataKey="medium" name="Medium" fill={COLORS.Medium} radius={[0,0,0,0]} stackId="a" />
        <Bar dataKey="high"   name="High"   fill={COLORS.High}   radius={[0,2,2,0]} stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Student radar chart (6 dimensions) ───────────────────────────────────────
export function StudentRadar({ features = {} }) {
  const data = [
    { subject: 'Attendance',   value: Math.round((features.attendance_rate || 0) * 100) },
    { subject: 'GPA',          value: Math.round((features.gpa || 0) * 10) },
    { subject: 'Assignments',  value: Math.round((features.assignment_submission_rate || 0) * 100) },
    { subject: 'LMS Usage',    value: Math.min(Math.round((features.lms_login_frequency || 0) * 4.76), 100) },
    { subject: 'Socio-Eco.',   value: Math.round((features.socioeconomic_score || 0) * 10) },
    { subject: 'Wellbeing',    value: Math.round((features.mental_health_score || 0) * 10) },
  ]

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.07)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 9 }} />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f4f4f5' }}
          formatter={(v) => [`${v}%`, 'Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// ── Simple progress bar metric ────────────────────────────────────────────────
export function MetricBar({ label, value, max = 100, color = '#3b82f6', suffix = '%' }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">{label}</span>
        <span className="text-xs font-mono text-zinc-300">{value}{suffix}</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
