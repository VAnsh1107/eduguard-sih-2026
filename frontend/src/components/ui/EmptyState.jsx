import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  heading,
  body,
  cta
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      height: '100%',
      width: '100%'
    }}>
      {Icon && (
        <div style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }}>
          <Icon size={48} />
        </div>
      )}
      <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {heading}
      </h3>
      {body && (
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: cta ? '24px' : '0' }}>
          {body}
        </p>
      )}
      {cta && (
        <Button onClick={cta.onClick} variant="primary">
          {cta.label}
        </Button>
      )}
    </div>
  );
}
