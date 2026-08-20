import React from 'react';
import { motion } from 'framer-motion';

export default function Card({
  variant = 'default',
  padding = 20,
  children,
  className = '',
  style = {},
  onClick
}) {
  const isHover = variant === 'hover';
  const Component = isHover ? motion.div : 'div';
  
  const getStyles = () => {
    const base = {
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    };

    const variants = {
      default: {
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: `${padding}px`,
      },
      featured: {
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        padding: '28px',
      },
      inset: {
        background: 'var(--surface-2)',
        borderRadius: 'var(--radius-md)',
        padding: `${padding}px`,
      },
      hover: {
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: `${padding}px`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 200ms var(--ease-apple)'
      }
    };

    return { ...base, ...variants[variant], ...style };
  };

  const extraProps = isHover ? {
    whileHover: { y: -2, boxShadow: 'var(--shadow-md)' },
    transition: { duration: 0.2, ease: 'easeOut' }
  } : {};

  return (
    <Component
      style={getStyles()}
      className={className}
      onClick={onClick}
      {...extraProps}
    >
      {children}
    </Component>
  );
}
