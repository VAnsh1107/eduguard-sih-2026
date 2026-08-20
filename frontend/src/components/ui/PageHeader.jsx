import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  children
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
      <div>
        <h2 style={{ fontSize: '28px', fontWeight: 600, lineHeight: '34px', color: 'var(--text-primary)', letterSpacing: '-0.002em', margin: 0 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '15px' }}>
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}
