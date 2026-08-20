import React from 'react';

export default function Input({
  label,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  error,
  errorText,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled,
  className = '',
  ...props
}) {
  const baseStyle = {
    height: '36px',
    backgroundColor: 'var(--surface-2)',
    border: `0.5px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
    borderRadius: 'var(--radius-sm)',
    padding: `0 ${RightIcon ? '36px' : '12px'} 0 ${LeftIcon ? '36px' : '12px'}`,
    fontSize: '15px',
    color: 'var(--text-primary)',
    width: '100%',
    outline: 'none',
    transition: 'all 200ms var(--ease-apple)',
    boxShadow: error ? '0 0 0 3px rgba(255,59,48,0.15)' : 'none'
  };

  return (
    <div className={`flex-col flex ${className}`} style={{ width: '100%' }}>
      {label && (
        <label style={{ fontSize: '12px', marginBottom: '4px', color: 'var(--text-primary)', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {LeftIcon && (
          <div style={{ position: 'absolute', left: '12px', color: 'var(--text-tertiary)', display: 'flex' }}>
            <LeftIcon size={16} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          style={baseStyle}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--accent)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0,113,227,0.15)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--border-strong)';
              e.target.style.boxShadow = 'none';
            }
          }}
          {...props}
        />
        {RightIcon && (
          <div style={{ position: 'absolute', right: '12px', color: 'var(--text-tertiary)', display: 'flex' }}>
            <RightIcon size={16} />
          </div>
        )}
      </div>
      {error && errorText && (
        <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>
          {errorText}
        </span>
      )}
    </div>
  );
}
