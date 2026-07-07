/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { StadiumZone, IncidentReport } from '../types';
import { Users, ShieldAlert } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useIncidentForm, useDensitySimulation } from '../hooks';
import { ZoneCard } from './ui/ZoneCard';
import { IncidentForm } from './IncidentForm';
import { IncidentCard } from './IncidentCard';

interface CrowdCenterProps {
  zones: StadiumZone[];
  setZones: React.Dispatch<React.SetStateAction<StadiumZone[]>>;
  incidents: IncidentReport[];
  fetchIncidents: () => Promise<void>;
  updateIncidentStatus: (id: string, status: 'responding' | 'resolved') => Promise<boolean>;
  userRole: string;
}

export default function CrowdCenter({
  zones,
  setZones,
  incidents,
  fetchIncidents,
  updateIncidentStatus,
  userRole,
}: CrowdCenterProps) {
  const { simulateDensity } = useDensitySimulation(setZones);
  const showSimulator = ['staff', 'organizer'].includes(userRole);

  const {
    category,
    setCategory,
    zoneId,
    setZoneId,
    severity,
    setSeverity,
    description,
    setDescription,
    isSubmitting,
    submitIncident,
  } = useIncidentForm({
    onSubmitSuccess: fetchIncidents,
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await submitIncident();
  }, [submitIncident]);

  return (
    <div id="crowd-center-container" className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Crowd Density Heatmap */}
      <div className="xl:col-span-7 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#66BB6A]" /> Active Crowd Density Center
              </h3>
              <p className="text-xs text-gray-400">
                Live monitoring of gate states, sector queuing benchmarks, and localized fan volumes.
              </p>
            </div>
            <div className="flex gap-2 text-[9px] font-bold text-gray-300 uppercase">
              <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400">Low</span>
              <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">Medium</span>
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">High</span>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400">Critical</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {zones.map((zone) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                showSimulator={showSimulator}
                onSimulate={simulateDensity}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Incident Room */}
      <div className="xl:col-span-5 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <h3 className="text-lg font-semibold text-white mb-1.5 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" /> Command Incident Center
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Report stadium issues in real-time. System triggers instant AI dispatch protocols.
          </p>

          <IncidentForm
            zones={zones}
            category={category}
            setCategory={setCategory}
            zoneId={zoneId}
            setZoneId={setZoneId}
            severity={severity}
            setSeverity={setSeverity}
            description={description}
            setDescription={setDescription}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Live Dispatch Logs:</span>
            <AnimatePresence>
              {incidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  zones={zones}
                  userRole={userRole}
                  onUpdateStatus={updateIncidentStatus}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
