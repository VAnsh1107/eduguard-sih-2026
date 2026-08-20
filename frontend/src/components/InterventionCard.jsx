import { GraduationCap, Heart, CurrencyDollar, Desktop, BookOpen, Bus, ArrowRight } from '@phosphor-icons/react'

const CATEGORY_ICONS = {
  Academic:      GraduationCap,
  'Mental Health': Heart,
  'Socio-Economic': CurrencyDollar,
  Engagement:    Desktop,
  Logistical:    Bus,
}

const CATEGORY_COLORS = {
  Academic:         'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Mental Health':  'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'Socio-Economic': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Engagement:       'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Logistical:       'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}

export default function InterventionCard({ title, description, category, index }) {
  const Icon = CATEGORY_ICONS[category] || BookOpen
  const colorCls = CATEGORY_COLORS[category] || CATEGORY_COLORS.Academic

  return (
    <div className="glass rounded-xl p-5 flex gap-4 group hover:border-white/[0.10] transition-all">
      {/* Step number + icon */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-xs font-mono text-zinc-500">
          {String(index + 1).padStart(2, '0')}
        </div>
        {/* connector line */}
        <div className="flex-1 w-px bg-white/[0.05] min-h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-start gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${colorCls}`}>
            <Icon size={11} />
            {category}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-zinc-200 mb-1 group-hover:text-white transition-colors">
          {title}
        </h4>
        <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ── String-only intervention list variant (for prediction result) ─────────────
export function InterventionList({ interventions = [] }) {
  if (!interventions.length) return (
    <div className="text-center py-8 text-zinc-600 text-sm">
      No specific interventions required.
    </div>
  )

  return (
    <div className="space-y-2">
      {interventions.map((text, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/50 border border-white/[0.06] group hover:border-blue-500/20 transition-all"
        >
          <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[9px] font-mono font-bold text-blue-400">{i + 1}</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed flex-1">{text}</p>
          <ArrowRight size={13} className="text-zinc-700 flex-shrink-0 mt-0.5 group-hover:text-blue-400 transition-colors" />
        </div>
      ))}
    </div>
  )
}
