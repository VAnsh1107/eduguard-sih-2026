import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export default function Tooltip({
  content,
  children,
  side = 'top'
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={500}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={4}
            style={{
              backgroundColor: '#1D1D1F',
              color: 'white',
              borderRadius: '6px',
              fontSize: '12px',
              padding: '4px 8px',
              zIndex: 100,
              fontFamily: 'var(--font-sans)'
            }}
          >
            {content}
            <TooltipPrimitive.Arrow style={{ fill: '#1D1D1F' }} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
