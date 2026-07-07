/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useCallback } from 'react';
import { StadiumZone } from '../types';
import { DensityBadge } from './ui/DensityBadge';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';

interface IncidentFormProps {
  zones: StadiumZone[];
  category: string;
  setCategory: (cat: string) => void;
  zoneId: string;
  setZoneId: (zone: string) => void;
  severity: string;
  setSeverity: (sev: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const CATEGORIES = ['crowd', 'medical', 'security', 'facility', 'accessibility'] as const;
const SEVERITY_LEVELS = ['low', 'medium', 'high'] as const;

const IncidentForm = memo(function IncidentForm({
  zones,
  category,
  setCategory,
  zoneId,
  setZoneId,
  severity,
  setSeverity,
  description,
  setDescription,
  isSubmitting,
  onSubmit,
}: IncidentFormProps) {
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  }, [onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 mb-6 p-4 rounded-xl border border-white/10 bg-black/20">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Category</label>
          <select
            aria-label="Incident Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs bg-white/5 border border-white/10 rounded-lg p-2 text-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#071A12]">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Sector Zone</label>
          <select
            aria-label="Incident Zone"
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            className="w-full text-xs bg-white/5 border border-white/10 rounded-lg p-2 text-white"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id} className="bg-[#071A12]">
                {z.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Severity</label>
        <div className="grid grid-cols-3 gap-2">
          {SEVERITY_LEVELS.map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverity(sev)}
              className={`py-1 rounded text-xs uppercase font-bold border transition ${
                severity === sev
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Leaking faucet or long queues? Enter details..."
          rows={2}
          className="w-full text-xs bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#66BB6A]"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !description.trim()}
        className="w-full py-2 bg-[#2E7D32] hover:bg-[#66BB6A] text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
      >
        Submit Log to Command Room
      </button>
    </form>
  );
});

export { IncidentForm, CATEGORIES, SEVERITY_LEVELS };
