import React from 'react';
import { motion } from 'framer-motion';

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  onClick,
  children,
  className = '',
  style = {},
  type = 'button',
}) {
  const getStyles = () => {
    const base = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
      transition: 'all 200ms var(--ease-apple)',
      fontFamily: 'var(--font-sans)',
      opacity: disabled || loading ? 0.6 : 1,
      pointerEvents: disabled || loading ? 'none' : 'auto',
    };

    const variants = {
      primary: {
        background: 'var(--accent)',
        color: 'var(--white)',
        borderRadius: '980px',
        height: '36px',
        padding: '0 20px',
        fontSize: '15px',
      },
      secondary: {
        background: 'var(--surface-2)',
        color: 'var(--text-primary)',
        border: '0.5px solid var(--border-strong)',
        borderRadius: '980px',
        height: '36px',
        padding: '0 20px',
        fontSize: '15px',
      },
      destructive: {
        background: 'var(--danger-light)',
        color: 'var(--danger)',
        borderRadius: '980px',
        height: '36px',
        padding: '0 20px',
        fontSize: '15px',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--text-secondary)',
        border: 'none',
        borderRadius: '980px',
        height: '36px',
        padding: '0 20px',
        fontSize: '15px',
      },
      icon: {
        background: 'var(--surface-2)',
        color: 'var(--text-primary)',
        border: '0.5px solid var(--border)',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        padding: 0,
      }
    };

    return { ...base, ...variants[variant], ...style };
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      style={getStyles()}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderBottomColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: children ? '8px' : '0'
          }}
        />
      ) : null}
      {children}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.button>
  );
}
