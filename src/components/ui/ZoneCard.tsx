/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useCallback } from 'react';
import { StadiumZone } from '../../types';
import { DensityBadge } from './DensityBadge';
import { ProgressBar } from './ProgressBar';
import { Clock } from 'lucide-react';

interface ZoneCardProps {
  zone: StadiumZone;
  showSimulator?: boolean;
  onSimulate?: (zoneId: string, level: 'low' | 'medium' | 'high' | 'critical') => void;
}

const ZoneCard = memo(function ZoneCard({ zone, showSimulator = false, onSimulate }: ZoneCardProps) {
  const handleSimulate = useCallback((level: 'low' | 'medium' | 'high' | 'critical') => {
    onSimulate?.(zone.id, level);
  }, [zone.id, onSimulate]);

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-black/20 flex flex-col justify-between transition-all duration-200 hover:border-white/20">
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold text-white block truncate">{zone.name}</span>
          <DensityBadge level={zone.crowdDensity} />
        </div>

        <div className="mt-3.5 space-y-1">
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Area Occupancy</span>
            <span className="text-white font-mono">{zone.occupancyPercentage}%</span>
          </div>
          <ProgressBar value={zone.occupancyPercentage} densityLevel={zone.crowdDensity} />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-xs">
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold">Line Queue</span>
            <span className="text-sm font-semibold text-white flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" /> {zone.queueLengthMin} mins
            </span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold">Gate Mode</span>
            <span className={`text-xs font-semibold block mt-0.5 capitalize ${
              zone.gateStatus === 'open' ? 'text-green-400' : 'text-orange-400'
            }`}>
              {zone.gateStatus}
            </span>
          </div>
        </div>
      </div>

      {showSimulator && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1 justify-between">
          <span className="text-[9px] text-gray-400 uppercase font-mono">Simulate:</span>
          <div className="flex gap-1">
            <button
              onClick={() => handleSimulate('low')}
              className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20"
              title="Simulate low density"
            >
              L
            </button>
            <button
              onClick={() => handleSimulate('medium')}
              className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
              title="Simulate medium density"
            >
              M
            </button>
            <button
              onClick={() => handleSimulate('high')}
              className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
              title="Simulate high density"
            >
              H
            </button>
            <button
              onClick={() => handleSimulate('critical')}
              className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 animate-pulse"
              title="Simulate critical density"
            >
              C
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export { ZoneCard };
