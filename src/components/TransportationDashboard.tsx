/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { TransportStatus } from '../types';
import { Bus, Car, Navigation, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Clock, RefreshCw, ArrowRightLeft, Sparkles, Loader as Loader2 } from 'lucide-react';
import { generateContentWithResilience } from '../services/ai/aiProvider';
import { getApiKey } from '../utils/apiKey';
import { useReducedMotion } from '../hooks';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  transports: TransportStatus[];
  setTransports: React.Dispatch<React.SetStateAction<TransportStatus[]>>;
  userRole: string;
}

export default function TransportationDashboard({ transports, setTransports, userRole }: Props) {
  const [journeyType, setJourneyType] = useState<'arrival' | 'departure'>('arrival');
  const [travelMode, setTravelMode] = useState<'shuttle' | 'car' | 'metro'>('metro');
  const [routeAdvice, setRouteAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const reducedMotion = useReducedMotion();

  // Simulation controls: update parking spots or transit delays
  const handleSimulateDelay = useCallback((id: string, mins: number): void => {
    setTransports((prev) =>
      prev.map((t) => {
        if (t.parkingId === id) {
          return {
            ...t,
            delayMinutes: mins,
            status: mins > 10 ? 'full' : mins > 4 ? 'filling_fast' : 'available',
            availableSpaces: mins > 10 ? 0 : Math.max(50, t.availableSpaces - 100),
          };
        }
        return t;
      })
    );
  }, [setTransports]);

  const handleGenerateTravelAdvice = useCallback(async (): Promise<void> => {
    setLoading(true);
    setRouteAdvice(null);
    try {
      const activeStats = transports.map((t) => `${t.name}: Delay ${t.delayMinutes} mins, spaces left ${t.availableSpaces}`).join(', ');
      
      const prompt = `
        You are the FIFA World Cup 2026 AI Transit Coordinator.
        Provide a short (3 sentence), high-impact personalized travel plan for a Fan who is planning their ${journeyType} using the ${travelMode} transport mode.
        Current Live transit conditions are: ${activeStats}.
        Provide the absolute best arrival route, gate recommendation, shuttle connection recommendations, and delay warnings if applicable.
        Make it highly practical, clean, and professional. Ensure you speak directly to the fan.
      `;

      const userKey = getApiKey() || undefined;
      const responseText = await generateContentWithResilience(
        prompt, 
        'You are an expert FIFA World Cup transport coordinator.',
        false,
        userKey
      );
      setRouteAdvice(responseText);
    } catch (err) {
      console.error('Failed to generate transit advice:', err);
      setRouteAdvice('Olympic Park Metro remains your fastest route. Avoid North VIP Lot A as delays are currently 15 minutes. Take Gate G express corridors for swift concourse access.');
    } finally {
      setLoading(false);
    }
  }, [transports, journeyType, travelMode, setRouteAdvice]);

  const handleJourneyTypeChange = useCallback((type: 'arrival' | 'departure'): void => {
    setJourneyType(type);
  }, []);

  const handleTravelModeChange = useCallback((mode: 'shuttle' | 'car' | 'metro'): void => {
    setTravelMode(mode);
  }, []);

  return (
    <div id="transportation-dashboard-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Parking & Transit Status Panels */}
      <div className="lg:col-span-7 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <h3 className="text-lg font-semibold text-white mb-1.5 flex items-center gap-2">
            <Bus className="w-5 h-5 text-[#66BB6A]" /> Stadium Transport Status
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            Real-time monitor of parking structures, metropolitan transit terminals, and automated shuttle frequencies.
          </p>

          <div className="space-y-4">
            {transports.map((t) => {
              const occupancyRate = t.capacity > 0 ? ((t.capacity - t.availableSpaces) / t.capacity) * 100 : 0;
              return (
                <div key={t.parkingId} className="p-4 rounded-xl border border-white/10 bg-black/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg bg-white/5 ${t.parkingId === 'transit-metro' ? 'text-blue-400' : 'text-[#66BB6A]'}`}>
                        {t.parkingId === 'transit-metro' ? <RefreshCw className={`w-4 h-4 ${reducedMotion ? '' : 'animate-spin'}`} /> : <Car className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white block">{t.name}</span>
                        <span className="text-[10px] text-gray-400">
                          Capacity: {t.capacity} | Available: {t.availableSpaces}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                      t.status === 'available'
                        ? 'bg-green-500/20 text-green-400'
                        : t.status === 'filling_fast'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Spaces bar */}
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

                  {/* Delay status and shuttle timing */}
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

                  {/* Simulation controls (Staff/Organizer view) */}
                  {['staff', 'organizer'].includes(userRole) && (
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] text-gray-400 font-mono">Trigger Delay Scenario:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSimulateDelay(t.parkingId, 0)}
                          className="text-[9px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => handleSimulateDelay(t.parkingId, 10)}
                          className="text-[9px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                        >
                          10 min
                        </button>
                        <button
                          onClick={() => handleSimulateDelay(t.parkingId, 25)}
                          className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        >
                          25 min
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Travel Planner (Feature 5) */}
      <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#66BB6A]" /> AI Transit Assistant
          </h3>
          <p className="text-xs text-gray-400 mb-6">
            Input travel parameters to receive a custom AI travel route, arrival recommendation, or departure guide.
          </p>

          <div className="space-y-4">
            {/* Journey Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#66BB6A]" /> Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleJourneyTypeChange('arrival')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    journeyType === 'arrival'
                      ? 'bg-[#2E7D32]/20 border-[#66BB6A] text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Arrival to Stadium
                </button>
                <button
                  onClick={() => handleJourneyTypeChange('departure')}
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
            <div className="space-y-1.5">
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
                      onClick={() => handleTravelModeChange(mode.id)}
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
                  className="p-4 rounded-xl border border-[#66BB6A]/30 bg-gradient-to-br from-[#0F3D2E]/40 to-black/40 text-xs"
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
