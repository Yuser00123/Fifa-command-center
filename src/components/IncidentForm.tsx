/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StadiumZone } from '../types';
import { Plus } from 'lucide-react';

interface IncidentFormProps {
  formCategory: 'medical' | 'security' | 'facility' | 'crowd' | 'accessibility';
  setFormCategory: (val: any) => void;
  formZone: string;
  setFormZone: (val: string) => void;
  formSeverity: 'low' | 'medium' | 'high';
  setFormSeverity: (val: 'low' | 'medium' | 'high') => void;
  formDesc: string;
  setFormDesc: (val: string) => void;
  submitting: boolean;
  zones: StadiumZone[];
  onSubmit: (e: React.FormEvent) => void;
}

export const IncidentForm = React.memo(function IncidentForm({
  formCategory,
  setFormCategory,
  formZone,
  setFormZone,
  formSeverity,
  setFormSeverity,
  formDesc,
  setFormDesc,
  submitting,
  zones,
  onSubmit,
}: IncidentFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3.5 mb-6 p-4 rounded-xl border border-white/10 bg-black/20">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Category</label>
          <select
            aria-label="Incident Category"
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
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
          {(['low', 'medium', 'high'] as const).map((sev) => (
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
  );
});
