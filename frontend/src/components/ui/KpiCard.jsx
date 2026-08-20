import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import Badge from './Badge'

export default function KpiCard({
  title,
  value,
  icon: Icon,
  iconBg = 'var(--accent-light)',
  iconColor = 'var(--accent)',
  suffix = '',
  prefix = '',
  delta,
  decimals = 0
}) {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { stiffness: 90, damping: 22 })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    motionValue.set(num)
  }, [num, motionValue])

  useEffect(() => {
    return springValue.on('change', (v) => {
      setDisplayValue(decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString())
    })
  }, [springValue, decimals])

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: 'var(--shadow-hover)' }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-card)',
        padding: '22px 24px',
        border: '0.5px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-tertiary)',
          fontWeight: 700,
          margin: 0
        }}>
          {title}
        </h3>
        {Icon && (
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <Icon size={19} />
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1 }}>
          {prefix}{displayValue}{suffix}
        </div>
        {delta && (
          <Badge variant={delta.positive ? 'low' : 'high'}>
            {delta.positive ? '+' : ''}{delta.value}%
          </Badge>
        )}
      </div>
    </motion.div>
  )
}
