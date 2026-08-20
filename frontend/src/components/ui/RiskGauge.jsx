import React from 'react'
import { motion } from 'framer-motion'

export default function RiskGauge({
  value = 0,
  riskLevel,
  size = 160,
  label
}) {
  const getColor = () => {
    if (riskLevel) {
      const norm = riskLevel.toLowerCase()
      if (norm === 'low') return 'var(--success)'
      if (norm === 'medium') return 'var(--warning)'
      if (norm === 'high') return 'var(--danger)'
    }
    if (value < 50) return 'var(--success)'
    if (value < 75) return 'var(--warning)'
    return 'var(--danger)'
  }

  const numericVal = typeof value === 'number' ? value : (parseFloat(value) || 0)
  const displayVal = Math.round(numericVal)
  const color = getColor()
  const strokeWidth = 16
  const radius = 80
  const circumference = 2 * Math.PI * radius
  // Arc 270 degrees
  const arcOffset = circumference * 0.25
  const dashArray = `${circumference - arcOffset} ${circumference}`
  const strokeDashoffset = (circumference - arcOffset) * (1 - Math.min(numericVal, 100) / 100)

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 200 200"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(135deg)' }}
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dashArray}
        />
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          initial={{ strokeDashoffset: circumference - arcOffset }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0 }}
        />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1, marginTop: '20px' }}>
        <div style={{ fontSize: `${Math.round(size * 0.26)}px`, fontWeight: 700, color, lineHeight: 1 }}>
          {displayVal}%
        </div>
        {label && (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>
            {label}
          </div>
        )}
      </div>
    </div>
  )
}
