/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { StadiumZone } from '../types';

type DensityLevel = 'low' | 'medium' | 'high' | 'critical';

interface DensityConfig {
  queueTime: number;
  occupancy: number;
  gateStatus: 'open' | 'congested';
}

const DENSITY_CONFIGS: Record<DensityLevel, DensityConfig> = {
  low: { queueTime: 5, occupancy: 35, gateStatus: 'open' },
  medium: { queueTime: 10, occupancy: 60, gateStatus: 'open' },
  high: { queueTime: 20, occupancy: 85, gateStatus: 'congested' },
  critical: { queueTime: 30, occupancy: 95, gateStatus: 'congested' },
} as const;

export function useDensitySimulation(
  setZones: React.Dispatch<React.SetStateAction<StadiumZone[]>>
) {
  const simulateDensity = useCallback((zoneId: string, level: DensityLevel) => {
    const config = DENSITY_CONFIGS[level];
    setZones((prev) =>
      prev.map((zone) => {
        if (zone.id === zoneId) {
          return {
            ...zone,
            crowdDensity: level,
            queueLengthMin: config.queueTime,
            occupancyPercentage: config.occupancy,
            gateStatus: config.gateStatus,
          };
        }
        return zone;
      })
    );
  }, [setZones]);

  return { simulateDensity, DENSITY_CONFIGS };
}
