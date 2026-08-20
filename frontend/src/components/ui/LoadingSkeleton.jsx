import React from 'react';

export default function LoadingSkeleton({
  width = '100%',
  height = '20px',
  radius = 'var(--radius-sm)',
  className = ''
}) {
  const style = {
    width,
    height,
    borderRadius: radius,
    background: 'linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeletonShimmer 1.5s infinite',
  };

  return (
    <div style={style} className={className}>
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton key={i} height="14px" width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div style={{ padding: '20px', background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)' }} className={className}>
      <LoadingSkeleton height="40px" width="40px" radius="50%" />
      <div style={{ marginTop: '16px' }}>
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

export function SkeletonRow({ className = '' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0' }} className={className}>
      <LoadingSkeleton height="32px" width="32px" radius="50%" />
      <LoadingSkeleton height="16px" width="120px" />
      <LoadingSkeleton height="16px" width="80px" />
    </div>
  );
}
