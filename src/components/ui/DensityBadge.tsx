/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface DensityBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  size?: 'sm' | 'md';
}

const DENSITY_STYLES = {
  low: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400 animate-pulse',
} as const;

const SIZE_STYLES = {
  sm: 'text-[9px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
} as const;

export const DensityBadge = React.memo(function DensityBadge({ level, size = 'sm' }: DensityBadgeProps) {
  return (
    <span className={`font-bold tracking-wider uppercase rounded ${DENSITY_STYLES[level]} ${SIZE_STYLES[size]}`}>
      {level}
    </span>
  );
});
