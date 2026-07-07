/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StadiumZone } from '../types';
import { Clock } from 'lucide-react';

interface CrowdZoneCardProps {
  zone: StadiumZone;
  userRole: string;
  onSimulateDensity: (zoneId: string, level: 'low' | 'medium' | 'high' | 'critical') => void;
}

export const CrowdZoneCard = React.memo(function CrowdZoneCard({
  zone,
  userRole,
  onSimulateDensity,
}: CrowdZoneCardProps) {
  const getDensityClass = (density: string) => {
    switch (density) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-red-500/20 text-red-400 animate-pulse';
    }
  };

  const getProgressClass = (density: string) => {
    switch (density) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-black/20 flex flex-col justify-between transition-all duration-200 hover:border-white/20">
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold text-white block truncate">{zone.name}</span>
          <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${getDensityClass(zone.crowdDensity)}`}>
            {zone.crowdDensity}
          </span>
        </div>

        <div className="mt-3.5 space-y-1">
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Area Occupancy</span>
            <span className="text-white font-mono">{zone.occupancyPercentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getProgressClass(zone.crowdDensity)}`}
              style={{ width: `${zone.occupancyPercentage}%` }}
            />
          </div>
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

      {['staff', 'organizer'].includes(userRole) && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1 justify-between">
          <span className="text-[9px] text-gray-400 uppercase font-mono">Simulate:</span>
          <div className="flex gap-1">
            {(['low', 'medium', 'high', 'critical'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onSimulateDensity(zone.id, lvl)}
                className={`text-[9px] px-1.5 py-0.5 rounded uppercase ${
                  lvl === 'low' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' :
                  lvl === 'medium' ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' :
                  lvl === 'high' ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' :
                  'bg-red-500/10 text-red-400 hover:bg-red-500/20 animate-pulse'
                }`}
                title={`Simulate ${lvl} density`}
              >
                {lvl[0]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
