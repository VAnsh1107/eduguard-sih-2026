import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  className = ''
}) {
  const baseStyle = {
    height: '44px',
    backgroundColor: 'var(--surface)',
    border: '0.5px solid var(--border-strong)',
    borderRadius: 'var(--radius-md)',
    padding: '0 40px',
    fontSize: '15px',
    color: 'var(--text-primary)',
    width: '100%',
    outline: 'none',
    transition: 'all 200ms var(--ease-apple)',
  };

  return (
    <div className={`relative flex items-center ${className}`} style={{ width: '100%' }}>
      <div style={{ position: 'absolute', left: '16px', color: 'var(--text-tertiary)', display: 'flex' }}>
        <Search size={16} />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={baseStyle}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--accent)';
          e.target.style.boxShadow = '0 0 0 3px rgba(0,113,227,0.15)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border-strong)';
          e.target.style.boxShadow = 'none';
        }}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          style={{ position: 'absolute', right: '16px', color: 'var(--text-tertiary)', display: 'flex', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
