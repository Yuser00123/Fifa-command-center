/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useReducedMotion } from '../../hooks';

interface AnimatedIconProps {
  icon: React.ReactNode;
  animation: 'spin' | 'pulse' | 'bounce';
  className?: string;
}

const ANIMATION_CLASSES = {
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
};

export function AnimatedIcon({ icon, animation, className = '' }: AnimatedIconProps): React.ReactElement {
  const reducedMotion = useReducedMotion();
  const animationClass = reducedMotion ? '' : ANIMATION_CLASSES[animation];

  return (
    <span className={`${animationClass} ${className}`.trim()}>
      {icon}
    </span>
  );
}
