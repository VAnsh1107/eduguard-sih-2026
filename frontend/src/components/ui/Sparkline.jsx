import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Sparkline({
  data = [],
  color = 'var(--accent)',
  height = 24,
  width = 60
}) {
  const chartData = data.map((value, index) => ({ value, index }));
  
  const content = (
    <LineChart data={chartData}>
      <Line
        type="monotone"
        dataKey="value"
        stroke={color}
        strokeWidth={1.5}
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  );

  if (width === '100%') {
    return (
      <div style={{ height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          {content}
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={{ height, width }}>
      {content}
    </div>
  );
}
