import React from 'react';

export default function Avatar({
  name = '',
  size = 'md',
  className = ''
}) {
  const sizes = {
    sm: 24,
    md: 36,
    lg: 64,
    xl: 96
  };
  
  const dim = sizes[size] || sizes.md;
  const fontSize = dim * 0.4;

  const getInitials = (str) => {
    const words = str.trim().split(/\s+/);
    if (!words.length || !words[0]) return '?';
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const getHashColor = (str) => {
    const hues = [
      '#0071E3', // blue
      '#34C759', // green
      '#FF9500', // orange
      '#AF52DE', // purple
      '#FF3B30', // red
      '#5AC8FA'  // teal
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    return hues[hash % hues.length];
  };

  const bgColor = getHashColor(name);
  
  const style = {
    width: `${dim}px`,
    height: `${dim}px`,
    borderRadius: '50%',
    backgroundColor: bgColor,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${fontSize}px`,
    fontWeight: 500,
    flexShrink: 0,
    fontFamily: 'var(--font-sans)'
  };

  return (
    <div style={style} className={className}>
      {getInitials(name)}
    </div>
  );
}
