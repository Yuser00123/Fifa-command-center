/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'green' | 'yellow' | 'orange' | 'red' | 'auto';
  densityLevel?: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

const COLOR_MAP = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
} as const;

const DENSITY_COLOR_MAP = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
} as const;

export const ProgressBar = React.memo(function ProgressBar({
  value,
  max = 100,
  color = 'auto',
  densityLevel,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const barColor = color === 'auto' && densityLevel
    ? DENSITY_COLOR_MAP[densityLevel]
    : color !== 'auto'
    ? COLOR_MAP[color]
    : 'bg-[#66BB6A]';

  return (
    <div className={`h-1.5 w-full bg-white/5 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});
