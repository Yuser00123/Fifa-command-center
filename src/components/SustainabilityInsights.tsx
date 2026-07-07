/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SustainabilityMetrics } from '../types';
import { 
  Leaf, 
  Trash2, 
  Zap, 
  Flame, 
  AlertCircle, 
  TrendingDown, 
  Sparkles,
  Award
} from 'lucide-react';
import { useSustainability } from '../hooks/useSustainability';

interface Props {
  metrics: SustainabilityMetrics;
  setMetrics: React.Dispatch<React.SetStateAction<SustainabilityMetrics>>;
}

export default function SustainabilityInsights({ metrics, setMetrics }: Props) {
  const {
    pledged,
    wasteDiversionRate,
    sustainabilityScore,
    handleSimulateEcoPledge,
  } = useSustainability({ metrics, setMetrics });

  const ecoRecommendations = [
    {
      title: 'Deploy Concourse Trash Sort Assistants',
      desc: 'Position green-campaign volunteers at Sector 104 and 122 food concession zones to increase PET recycling rates.',
      impact: '+5% Recycled Ratio'
    },
    {
      title: 'Power-down Sector B Standby Systems',
      desc: 'Dim backup stadium concourse arrays during daylight windows, saving approximately 1,200 kWh energy load per matchday.',
      impact: '10% Power Savings'
    },
    {
      title: 'Divert Fans to Olympic Park Subway',
      desc: 'Utilize big-screens to guide arriving drivers toward Park & Ride shuttle lines, shrinking carbon emissions footprint.',
      impact: '-150 kg CO2 emissions'
    }
  ];

  return (
    <div id="sustainability-insights-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Metrics Dashboard */}
      <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1.5 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#66BB6A]" /> Sustainability Insights
          </h3>
          <p className="text-xs text-gray-400 text-left">
            Real-time assessment of waste diversion targets, clean power grids, and mass transit carbon emission reduction programs.
          </p>
        </div>

        {/* Big Score / KPI */}
        <div className="p-5 rounded-xl border border-[#66BB6A]/20 bg-gradient-to-r from-[#0F3D2E]/40 to-black/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#66BB6A]/10 border border-[#66BB6A]/30 flex items-center justify-center text-[#66BB6A]">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-gray-400 block uppercase font-bold">FIFA Stadium Performance Rating</span>
              <span className="text-xl font-bold text-white">Green Operations Index</span>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-3xl font-extrabold text-white font-mono block">
              {sustainabilityScore} <span className="text-xs text-gray-400 font-normal">/ 100</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-[#66BB6A]">
              {sustainabilityScore > 75 ? 'Excellent Eco Rating' : sustainabilityScore > 50 ? 'Medium Performance' : 'Alert: Low Target'}
            </span>
          </div>
        </div>

        {/* Progress Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Waste diversion progress */}
          <div className="p-4 rounded-xl border border-white/10 bg-black/20 space-y-3">
            <div className="flex items-center gap-2 text-[#66BB6A]">
              <Trash2 className="w-4 h-4" />
              <span className="text-xs font-semibold text-white">Trash Diversion</span>
            </div>
            <div className="text-left">
              <span className="text-lg font-bold text-white block font-mono">
                {wasteDiversionRate.toFixed(1)}%
              </span>
              <span className="text-[10px] text-gray-400 block">
                {metrics.wasteRecycledKg} kg of {metrics.wasteGeneratedKg} kg
              </span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#66BB6A] rounded-full" style={{ width: `${wasteDiversionRate}%` }} />
            </div>
          </div>

          {/* Clean Energy Grid */}
          <div className="p-4 rounded-xl border border-white/10 bg-black/20 space-y-3">
            <div className="flex items-center gap-2 text-yellow-400">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold text-white">Renewable Energy</span>
            </div>
            <div className="text-left">
              <span className="text-lg font-bold text-white block font-mono">
                {metrics.renewableEnergyPercentage}%
              </span>
              <span className="text-[10px] text-gray-400 block">
                Stadium power: {metrics.energyConsumptionKwh} kWh
              </span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400/80 rounded-full" style={{ width: `${metrics.renewableEnergyPercentage}%` }} />
            </div>
          </div>

          {/* Transit Emissions footprint */}
          <div className="p-4 rounded-xl border border-white/10 bg-black/20 space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-semibold text-white">Carbon Footprint</span>
            </div>
            <div className="text-left">
              <span className="text-lg font-bold text-white block font-mono">
                {metrics.transitEmissionsCo2Kg} kg
              </span>
              <span className="text-[10px] text-gray-400 block">
                Emissions from local travel
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#66BB6A] font-semibold mt-1">
              <TrendingDown className="w-3.5 h-3.5" /> -12% vs last match
            </div>
          </div>
        </div>

        {/* Interactive Eco Pledge Activator */}
        <div className="p-4 rounded-xl border border-dashed border-[#66BB6A]/30 bg-green-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-sm font-semibold text-white block flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-[#66BB6A] animate-bounce" /> Stadium Zero-Waste Pledge
            </span>
            <p className="text-[11px] text-gray-400 max-w-md mt-0.5">
              Launch public zero-plastic campaign guidelines. Simulates mass-fan engagement and recycling shifts instantly.
            </p>
          </div>

          <button
            onClick={handleSimulateEcoPledge}
            disabled={pledged}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              pledged 
                ? 'bg-[#2E7D32]/20 text-gray-400 border border-[#2E7D32]/30 cursor-not-allowed'
                : 'bg-[#2E7D32] hover:bg-[#66BB6A] text-white shadow-lg shadow-[#2E7D32]/20'
            }`}
          >
            {pledged ? 'Pledge Campaign Live' : 'Launch Eco Pledge'}
          </button>
        </div>
      </div>

      {/* AI Eco Actions list */}
      <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1.5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#66BB6A]" /> Sustainability Recommendations
          </h3>
          <p className="text-xs text-gray-400 mb-5 text-left">
            Gemini-generated actionable strategies to lower carbon intensity, divert waste, and decrease power grids.
          </p>

          <div className="space-y-4">
            {ecoRecommendations.map((rec, index) => (
              <div key={index} className="p-3.5 rounded-xl border border-white/5 bg-black/15 flex gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-[#66BB6A]/10 border border-[#66BB6A]/20 flex items-center justify-center text-[#66BB6A] flex-shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                  <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">{rec.desc}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-[#66BB6A] bg-[#66BB6A]/10 px-2 py-0.5 rounded">
                    {rec.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2.5 mt-6 text-[11px] text-gray-400 text-left">
          <AlertCircle className="w-4 h-4 text-[#66BB6A]" />
          <span>All targets are synchronized with standard FIFA World Cup Green legacy metrics.</span>
        </div>
      </div>
    </div>
  );
}
