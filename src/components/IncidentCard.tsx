/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useCallback } from 'react';
import { IncidentReport, StadiumZone } from '../types';
import { DensityBadge } from './ui/DensityBadge';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';

interface IncidentCardProps {
  incident: IncidentReport;
  zones: StadiumZone[];
  userRole: string;
  onUpdateStatus: (id: string, status: 'responding' | 'resolved') => void;
}

const STATUS_COLORS = {
  resolved: 'text-green-400',
  responding: 'text-blue-400',
  reported: 'text-orange-400',
} as const;

const IncidentCard = memo(function IncidentCard({
  incident,
  zones,
  userRole,
  onUpdateStatus,
}: IncidentCardProps) {
  const handleResponding = useCallback(() => {
    onUpdateStatus(incident.id, 'responding');
  }, [incident.id, onUpdateStatus]);

  const handleResolved = useCallback(() => {
    onUpdateStatus(incident.id, 'resolved');
  }, [incident.id, onUpdateStatus]);

  const zoneName = zones.find((z) => z.id === incident.zoneId)?.name || incident.zoneId;
  const canTakeAction = incident.status !== 'resolved' && ['staff', 'organizer', 'volunteer'].includes(userRole);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-3 rounded-lg border border-white/5 bg-black/15 text-xs flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-1">
        <div>
          <DensityBadge level={incident.severity === 'high' ? 'critical' : incident.severity === 'medium' ? 'high' : 'medium'} size="sm" />
          <span className="font-semibold text-gray-200 ml-2">
            {incident.category.toUpperCase()} Log
          </span>
        </div>
        <span className={`text-[9px] font-semibold uppercase ${STATUS_COLORS[incident.status]}`}>
          {incident.status}
        </span>
      </div>

      <p className="text-gray-300 mt-1.5 text-xs italic">{incident.description}</p>

      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
        <span>{zoneName}</span>
        {incident.assignedStaffId && (
          <span className="text-[#66BB6A]">Assigned: {incident.assignedStaffId}</span>
        )}
      </div>

      {canTakeAction && (
        <div className="mt-2.5 flex justify-end gap-1.5">
          {incident.status === 'reported' && (
            <button
              onClick={handleResponding}
              className="px-2 py-0.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-[10px] font-bold rounded border border-blue-500/40"
            >
              Acknowledge & Deploy
            </button>
          )}
          <button
            onClick={handleResolved}
            className="px-2 py-0.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-[10px] font-bold rounded border border-green-500/40 flex items-center gap-0.5"
          >
            <Check className="w-2.5 h-2.5" /> Resolve Log
          </button>
        </div>
      )}
    </motion.div>
  );
});

export { IncidentCard };
