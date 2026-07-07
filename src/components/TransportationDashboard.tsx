/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TransportStatus } from '../types';
import { 
  Bus, 
  ArrowRightLeft, 
  Sparkles, 
  Loader2 
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTransportation } from '../hooks/useTransportation';
import { TransitStatusCard } from './TransitStatusCard';

interface Props {
  transports: TransportStatus[];
  setTransports: React.Dispatch<React.SetStateAction<TransportStatus[]>>;
  userRole: string;
}

export default function TransportationDashboard({ transports, setTransports, userRole }: Props) {
  const {
    journeyType,
    setJourneyType,
    travelMode,
    setTravelMode,
    routeAdvice,
    loading,
    handleSimulateDelay,
    handleGenerateTravelAdvice,
  } = useTransportation({ transports, setTransports });

  return (
    <div id="transportation-dashboard-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Parking & Transit Status Panels */}
      <div className="lg:col-span-7 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <h3 className="text-lg font-semibold text-white mb-1.5 flex items-center gap-2">
            <Bus className="w-5 h-5 text-[#66BB6A]" /> Stadium Transport Status
          </h3>
          <p className="text-xs text-gray-400 mb-5 text-left">
            Real-time monitor of parking structures, metropolitan transit terminals, and automated shuttle frequencies.
          </p>

          <div className="space-y-4">
            {transports.map((t) => (
              <TransitStatusCard
                key={t.parkingId}
                t={t}
                userRole={userRole}
                onSimulateDelay={handleSimulateDelay}
              />
            ))}
          </div>
        </div>
      </div>

      {/* AI Travel Planner (Feature 5) */}
      <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#66BB6A]" /> AI Transit Assistant
          </h3>
          <p className="text-xs text-gray-400 mb-6 text-left">
            Input travel parameters to receive a custom AI travel route, arrival recommendation, or departure guide.
          </p>

          <div className="space-y-4">
            {/* Journey Type */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#66BB6A]" /> Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setJourneyType('arrival')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    journeyType === 'arrival'
                      ? 'bg-[#2E7D32]/20 border-[#66BB6A] text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Arrival to Stadium
                </button>
                <button
                  onClick={() => setJourneyType('departure')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    journeyType === 'departure'
                      ? 'bg-[#2E7D32]/20 border-[#66BB6A] text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Stadium Departure
                </button>
              </div>
            </div>

            {/* Travel Mode */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-gray-300">Transportation Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'metro', name: 'Metro / Rail', icon: RefreshCw },
                  { id: 'shuttle', name: 'Bus Shuttle', icon: Bus },
                  { id: 'car', name: 'Drive / Park', icon: Car },
                ] as const).map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setTravelMode(mode.id)}
                      className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                        travelMode === mode.id
                          ? 'bg-[#2E7D32]/20 border-[#66BB6A] text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#66BB6A]" />
                      <span className="text-[10px] font-bold">{mode.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Output Container */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="p-4 rounded-xl border border-white/15 bg-white/5 flex flex-col items-center justify-center text-center py-8">
                  <Loader2 className="w-6 h-6 text-[#66BB6A] animate-spin mb-2" />
                  <span className="text-xs text-gray-400">Consulting real-time parking spaces and traffic channels...</span>
                </div>
              ) : routeAdvice ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl border border-[#66BB6A]/30 bg-gradient-to-br from-[#0F3D2E]/40 to-black/40 text-xs text-left"
                >
                  <span className="font-bold text-[#66BB6A] block mb-1 uppercase tracking-wider">AI Travel Advice</span>
                  <p className="text-gray-200 leading-relaxed text-xs">{routeAdvice}</p>
                </motion.div>
              ) : (
                <div className="p-4 rounded-xl border border-white/10 bg-black/10 text-center text-xs text-gray-400">
                  Select parameters above to generate specialized instructions.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={handleGenerateTravelAdvice}
          disabled={loading}
          className="w-full mt-6 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#66BB6A] text-white text-xs font-bold transition-all"
        >
          {loading ? 'Consulting Traffic...' : 'Generate AI Routing Advice'}
        </button>
      </div>
    </div>
  );
}

// Simple wrapper for icons
function RefreshCw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

function Car(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}
