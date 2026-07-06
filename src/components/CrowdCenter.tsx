/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StadiumZone, IncidentReport } from '../types';
import { 
  Users, 
  AlertOctagon, 
  Clock, 
  Plus, 
  Check, 
  Flag, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  Activity, 
  Send 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  zones: StadiumZone[];
  setZones: React.Dispatch<React.SetStateAction<StadiumZone[]>>;
  incidents: IncidentReport[];
  fetchIncidents: () => Promise<void>;
  userRole: string;
}

export default function CrowdCenter({ zones, setZones, incidents, fetchIncidents, userRole }: Props) {
  // New Incident form states
  const [formCategory, setFormCategory] = useState<'medical' | 'security' | 'facility' | 'crowd' | 'accessibility'>('crowd');
  const [formZone, setFormZone] = useState('zone-north');
  const [formSeverity, setFormSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Simulation controls: update zone density
  const handleSimulateDensity = (zoneId: string, level: 'low' | 'medium' | 'high' | 'critical') => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === zoneId) {
          let queueTime = 5;
          let occupancy = 35;
          if (level === 'medium') { queueTime = 10; occupancy = 60; }
          if (level === 'high') { queueTime = 20; occupancy = 85; }
          if (level === 'critical') { queueTime = 30; occupancy = 95; }
          return {
            ...z,
            crowdDensity: level,
            queueLengthMin: queueTime,
            occupancyPercentage: occupancy,
            gateStatus: level === 'critical' || level === 'high' ? 'congested' : 'open',
          };
        }
        return z;
      })
    );
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneId: formZone,
          category: formCategory,
          severity: formSeverity,
          description: formDesc,
        }),
      });

      if (response.ok) {
        setFormDesc('');
        await fetchIncidents();
      }
    } catch (err) {
      console.error('Failed to report incident:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'responding' | 'resolved') => {
    try {
      const response = await fetch(`/api/incidents/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          assignedStaffId: newStatus === 'responding' ? 'staff-v' + Math.floor(Math.random() * 50) : undefined,
        }),
      });

      if (response.ok) {
        await fetchIncidents();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div id="crowd-center-container" className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* Crowd Density Heatmap & Status Cards (Features 2 & 6) */}
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
            {/* Legend indicators */}
            <div className="flex gap-2 text-[9px] font-bold text-gray-300 uppercase">
              <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400">Low</span>
              <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">Medium</span>
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">High</span>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400">Critical</span>
            </div>
          </div>

          {/* Zones Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="p-4 rounded-xl border border-white/10 bg-black/20 flex flex-col justify-between transition-all duration-200 hover:border-white/20"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-white block truncate">{zone.name}</span>
                    <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                      zone.crowdDensity === 'low'
                        ? 'bg-green-500/20 text-green-400'
                        : zone.crowdDensity === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : zone.crowdDensity === 'high'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-red-500/20 text-red-400 animate-pulse'
                    }`}>
                      {zone.crowdDensity}
                    </span>
                  </div>

                  {/* Progress / Percent occupancy */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Area Occupancy</span>
                      <span className="text-white font-mono">{zone.occupancyPercentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          zone.crowdDensity === 'low'
                            ? 'bg-green-500'
                            : zone.crowdDensity === 'medium'
                            ? 'bg-yellow-500'
                            : zone.crowdDensity === 'high'
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${zone.occupancyPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Queue time and Gate State */}
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

                {/* Simulation controls (Staff/Organizer view) */}
                {['staff', 'organizer'].includes(userRole) && (
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1 justify-between">
                    <span className="text-[9px] text-gray-400 uppercase font-mono">Simulate:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSimulateDensity(zone.id, 'low')}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20"
                        title="Simulate low density"
                      >
                        L
                      </button>
                      <button
                        onClick={() => handleSimulateDensity(zone.id, 'medium')}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                        title="Simulate medium density"
                      >
                        M
                      </button>
                      <button
                        onClick={() => handleSimulateDensity(zone.id, 'high')}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                        title="Simulate high density"
                      >
                        H
                      </button>
                      <button
                        onClick={() => handleSimulateDensity(zone.id, 'critical')}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 animate-pulse"
                        title="Simulate critical density"
                      >
                        C
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incident Room & Dispatch Command (Feature 6 & 8) */}
      <div className="xl:col-span-5 space-y-6">
        
        {/* Incident Reporting Form & Logger */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <h3 className="text-lg font-semibold text-white mb-1.5 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" /> Command Incident Center
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Report stadium issues in real-time. System triggers instant AI dispatch protocols.
          </p>

          {/* Form to submit standard Incident */}
          <form onSubmit={handleCreateIncident} className="space-y-3.5 mb-6 p-4 rounded-xl border border-white/10 bg-black/20">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Category</label>
                <select
                  aria-label="Incident Category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as typeof formCategory)}
                  className="w-full text-xs bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                >
                  <option value="crowd" className="bg-[#071A12]">Crowd Queue</option>
                  <option value="medical" className="bg-[#071A12]">Medical Deck</option>
                  <option value="security" className="bg-[#071A12]">Security Guard</option>
                  <option value="facility" className="bg-[#071A12]">Facility/Leaking</option>
                  <option value="accessibility" className="bg-[#071A12]">Accessibility Lift</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Sector Zone</label>
                <select
                  aria-label="Incident Zone"
                  value={formZone}
                  onChange={(e) => setFormZone(e.target.value)}
                  className="w-full text-xs bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id} className="bg-[#071A12]">{z.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Severity</label>
              <div className="grid grid-cols-3 gap-2">
                {([ 'low', 'medium', 'high' ] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setFormSeverity(sev)}
                    className={`py-1 rounded text-xs uppercase font-bold border transition ${
                      formSeverity === sev
                        ? sev === 'high'
                          ? 'bg-red-500/20 border-red-500 text-red-400'
                          : sev === 'medium'
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                          : 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Incident Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Leaking faucet or long queues? Enter details..."
                rows={2}
                className="w-full text-xs bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#66BB6A]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !formDesc.trim()}
              className="w-full py-2 bg-[#2E7D32] hover:bg-[#66BB6A] text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Submit Log to Command Room
            </button>
          </form>

          {/* Active Incidents List */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Live Dispatch Logs:</span>
            
            <AnimatePresence>
              {incidents.map((inc) => (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-lg border border-white/5 bg-black/15 text-xs flex flex-col justify-between"
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

                  {/* Responder Control Actions */}
                  {inc.status !== 'resolved' && ['staff', 'organizer', 'volunteer'].includes(userRole) && (
                    <div className="mt-2.5 flex justify-end gap-1.5">
                      {inc.status === 'reported' && (
                        <button
                          onClick={() => handleUpdateStatus(inc.id, 'responding')}
                          className="px-2 py-0.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-[10px] font-bold rounded border border-blue-500/40"
                        >
                          Acknowledge & Deploy
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(inc.id, 'resolved')}
                        className="px-2 py-0.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-[10px] font-bold rounded border border-green-500/40 flex items-center gap-0.5"
                      >
                        <Check className="w-2.5 h-2.5" /> Resolve Log
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
