import React from 'react';

export default function Badge({
  variant = 'neutral',
  children,
  className = '',
  pulse = false
}) {
  const getStyles = () => {
    const base = {
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: '980px',
      fontSize: '12px',
      padding: '2px 8px',
      fontWeight: 500,
      fontFamily: 'var(--font-sans)',
      whiteSpace: 'nowrap'
    };

    const variants = {
      high: { background: 'var(--danger-light)', color: 'var(--danger)' },
      medium: { background: 'var(--warning-light)', color: 'var(--warning)' },
      low: { background: 'var(--success-light)', color: 'var(--success)' },
      info: { background: 'var(--accent-light)', color: 'var(--accent)' },
      neutral: { background: 'var(--surface-2)', color: 'var(--text-secondary)' }
    };

    const animation = pulse && variant === 'high' ? { animation: 'badgePulse 2s infinite' } : {};

    return { ...base, ...variants[variant], ...animation };
  };

  return (
    <span style={getStyles()} className={className}>
      {children}
      {pulse && variant === 'high' && (
        <style>{`
          @keyframes badgePulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}</style>
      )}
    </span>
  );
}
