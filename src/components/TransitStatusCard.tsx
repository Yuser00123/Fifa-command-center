/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TransportStatus } from '../types';
import { 
  Car, 
  RefreshCw, 
  Clock, 
  AlertTriangle, 
  CheckCircle 
} from 'lucide-react';

interface TransitStatusCardProps {
  t: TransportStatus;
  userRole: string;
  onSimulateDelay: (id: string, mins: number) => void;
}

export const TransitStatusCard = React.memo(function TransitStatusCard({
  t,
  userRole,
  onSimulateDelay,
}: TransitStatusCardProps) {
  const occupancyRate = t.capacity > 0 ? ((t.capacity - t.availableSpaces) / t.capacity) * 100 : 0;

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400';
      case 'filling_fast': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-red-500/20 text-red-400';
    }
  };

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-black/20 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg bg-white/5 ${t.parkingId === 'transit-metro' ? 'text-blue-400' : 'text-[#66BB6A]'}`}>
            {t.parkingId === 'transit-metro' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Car className="w-4 h-4" />}
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-white block">{t.name}</span>
            <span className="text-[10px] text-gray-400">
              Capacity: {t.capacity} | Available: {t.availableSpaces}
            </span>
          </div>
        </div>

        <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${getStatusClass(t.status)}`}>
          {t.status.replace('_', ' ')}
        </span>
      </div>

      {t.parkingId !== 'transit-metro' && (
        <div className="space-y-1">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#66BB6A] rounded-full transition-all duration-300"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
        <span className="text-gray-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-gray-400" /> Shuttle cycle: {t.shuttleFrequencyMin} mins
        </span>
        <span className={`font-semibold flex items-center gap-1 ${t.delayMinutes > 5 ? 'text-red-400' : 'text-green-400'}`}>
          {t.delayMinutes > 0 ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> {t.delayMinutes}m delay
            </>
          ) : (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-green-400" /> No Delays
            </>
          )}
        </span>
      </div>

      {['staff', 'organizer'].includes(userRole) && (
        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] text-gray-400 font-mono">Trigger Delay Scenario:</span>
          <div className="flex gap-1">
            <button
              onClick={() => onSimulateDelay(t.parkingId, 0)}
              className="text-[9px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20"
            >
              Clear
            </button>
            <button
              onClick={() => onSimulateDelay(t.parkingId, 10)}
              className="text-[9px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
            >
              10 min
            </button>
            <button
              onClick={() => onSimulateDelay(t.parkingId, 25)}
              className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
            >
              25 min
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
