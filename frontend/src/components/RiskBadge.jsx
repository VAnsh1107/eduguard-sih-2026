import clsx from 'clsx'

const CONFIG = {
  Low:    { cls: 'risk-low',    dot: 'bg-emerald-500' },
  Medium: { cls: 'risk-medium', dot: 'bg-amber-500'   },
  High:   { cls: 'risk-high',   dot: 'bg-rose-500'    },
}

export default function RiskBadge({ level, size = 'sm' }) {
  const cfg = CONFIG[level] || CONFIG['Low']

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        cfg.cls,
        size === 'sm' && 'text-xs px-2.5 py-1',
        size === 'md' && 'text-sm px-3 py-1.5',
        size === 'lg' && 'text-base px-4 py-2',
      )}
    >
      <span
        className={clsx(
          'rounded-full animate-pulse-slow',
          cfg.dot,
          size === 'sm' && 'w-1.5 h-1.5',
          size === 'md' && 'w-2 h-2',
          size === 'lg' && 'w-2.5 h-2.5',
        )}
      />
      {level} Risk
    </span>
  )
}
