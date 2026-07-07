/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { IncidentReport, StadiumZone } from '../types';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';

interface IncidentLogItemProps {
  inc: IncidentReport;
  zones: StadiumZone[];
  userRole: string;
  onUpdateStatus: (id: string, newStatus: 'responding' | 'resolved') => void;
}

export const IncidentLogItem = React.memo(function IncidentLogItem({
  inc,
  zones,
  userRole,
  onUpdateStatus,
}: IncidentLogItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-3 rounded-lg border border-white/5 bg-black/15 text-xs flex flex-col justify-between animate-fade-in"
    >
      <div className="flex items-start justify-between gap-1">
        <div>
          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase mr-1.5 ${
            inc.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {inc.severity} Severity
          </span>
          <span className="font-semibold text-gray-200">
            {inc.category.toUpperCase()} Log
          </span>
        </div>
        <span className={`text-[9px] font-semibold uppercase ${
          inc.status === 'resolved' ? 'text-green-400' : inc.status === 'responding' ? 'text-blue-400' : 'text-orange-400'
        }`}>
          {inc.status}
        </span>
      </div>

      <p className="text-gray-300 mt-1.5 text-xs italic">{inc.description}</p>
      
      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
        <span>
          {zones.find(z => z.id === inc.zoneId)?.name || inc.zoneId}
        </span>
        {inc.assignedStaffId && (
          <span className="text-[#66BB6A]">Assigned: {inc.assignedStaffId}</span>
        )}
      </div>

      {inc.status !== 'resolved' && ['staff', 'organizer', 'volunteer'].includes(userRole) && (
        <div className="mt-2.5 flex justify-end gap-1.5">
          {inc.status === 'reported' && (
            <button
              onClick={() => onUpdateStatus(inc.id, 'responding')}
              className="px-2 py-0.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-[10px] font-bold rounded border border-blue-500/40"
            >
              Acknowledge & Deploy
            </button>
          )}
          <button
            onClick={() => onUpdateStatus(inc.id, 'resolved')}
            className="px-2 py-0.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-[10px] font-bold rounded border border-green-500/40 flex items-center gap-0.5"
          >
            <Check className="w-2.5 h-2.5" /> Resolve Log
          </button>
        </div>
      )}
    </motion.div>
  );
});
