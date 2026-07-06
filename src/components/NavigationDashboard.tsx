/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavigationRoute } from '../types';
import { NAVIGATION_LOCATIONS } from '../constants/initialState';
import { 
  MapPin, 
  Compass, 
  Accessibility, 
  Loader2, 
  Clock, 
  Milestone, 
  Utensils, 
  PlusCircle, 
  AlertTriangle, 
  Activity, 
  CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  accessibilityActive: boolean;
  setAccessibilityActive: (active: boolean) => void;
}

export default function NavigationDashboard({ accessibilityActive, setAccessibilityActive }: Props) {
  const [source, setSource] = useState(NAVIGATION_LOCATIONS[0]);
  const [destination, setDestination] = useState(NAVIGATION_LOCATIONS[8]);
  const [route, setRoute] = useState<NavigationRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = async (src: string, dest: string, isAcc: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const userKey = localStorage.getItem('user_gemini_api_key');
      if (userKey) {
        headers['x-gemini-api-key'] = userKey;
      }

      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers,
        body: JSON.stringify({ source: src, destination: dest, accessibility: isAcc }),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('Could not calculate route or received non-JSON format.');
      }

      const data = await response.json();
      setRoute(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleShortcutClick = (category: string) => {
    let src = source;
    let dest = destination;

    if (category === 'medical') {
      dest = 'Medical Station Alpha (West)';
    } else if (category === 'food') {
      dest = 'Food Court West Plaza';
    } else if (category === 'lift') {
      dest = 'Main Accessibility Lift Lobby 3';
      setAccessibilityActive(true);
    } else if (category === 'seat') {
      dest = 'Sector 122 Standard Seating';
    }

    setDestination(dest);
    calculateRoute(src, dest, accessibilityActive);
  };

  return (
    <div id="navigation-dashboard-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Route Finder Setup */}
      <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#66BB6A]" /> Intelligent Stadium Wayfinding
          </h3>
          <p className="text-xs text-gray-400 mb-6">
            Get personalized, wheelchair-accessible, and congestion-aware routes generated instantly by Gemini AI.
          </p>

          <div className="space-y-4">
            {/* Start Point */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400" /> Start Point / Gate
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full text-sm bg-black/40 border border-white/10 focus:border-[#66BB6A] rounded-xl px-3 py-2.5 text-white outline-none"
              >
                {NAVIGATION_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-[#071A12] text-white">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#66BB6A]" /> Destination Service
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full text-sm bg-black/40 border border-white/10 focus:border-[#66BB6A] rounded-xl px-3 py-2.5 text-white outline-none"
              >
                {NAVIGATION_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-[#071A12] text-white">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Accessibility Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-black/20">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${accessibilityActive ? 'bg-sky-500/20 text-sky-400' : 'bg-white/5 text-gray-400'}`}>
                  <Accessibility className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block">Step-Free Pathway Mode</span>
                  <span className="text-[10px] text-gray-400">Avoid steps, stairs, escalators, and crowded ramps</span>
                </div>
              </div>
              <button
                role="checkbox"
                aria-checked={accessibilityActive}
                onClick={() => setAccessibilityActive(!accessibilityActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  accessibilityActive ? 'bg-sky-500' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    accessibilityActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Quick Discover Shortcuts */}
          <div className="mt-6">
            <span className="text-xs font-semibold text-gray-400 block mb-2.5">Quick Discovery Filters:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleShortcutClick('medical')}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs text-[#66BB6A] font-medium transition duration-200 text-left"
              >
                <Activity className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                Medical Stalls
              </button>
              <button
                onClick={() => handleShortcutClick('food')}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs text-[#66BB6A] font-medium transition duration-200 text-left"
              >
                <Utensils className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                Food Courts
              </button>
              <button
                onClick={() => handleShortcutClick('lift')}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs text-[#66BB6A] font-medium transition duration-200 text-left"
              >
                <Accessibility className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                Elevator Lift
              </button>
              <button
                onClick={() => handleShortcutClick('seat')}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs text-[#66BB6A] font-medium transition duration-200 text-left"
              >
                <PlusCircle className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                Find Seat Gate
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => calculateRoute(source, destination, accessibilityActive)}
          disabled={loading}
          className="w-full mt-6 py-3 px-4 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#0F3D2E] hover:from-[#66BB6A] hover:to-[#2E7D32] text-white font-semibold shadow-lg hover:shadow-[#66BB6A]/20 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Sequencing Route...
            </>
          ) : (
            'Generate Congestion-Aware Route'
          )}
        </button>
      </div>

      {/* Route Display Panel */}
      <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col justify-between min-h-[460px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#66BB6A]/10 flex items-center justify-center border border-[#66BB6A]/30 mb-4 animate-pulse">
                <Loader2 className="w-8 h-8 text-[#66BB6A] animate-spin" />
              </div>
              <h4 className="text-white font-semibold mb-1">Synthesizing Smart Directions</h4>
              <p className="text-xs text-gray-400 max-w-sm">
                Evaluating current stadium queue levels, crowd heatmaps, and accessibility lobbies to safely map your optimal path...
              </p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-white font-semibold mb-1">Calculation Issue</h4>
              <p className="text-xs text-gray-400 max-w-xs">{error}</p>
            </div>
          ) : route ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 flex-1 flex flex-col justify-between"
            >
              {/* Route Summary Stats */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                      Route Mapping: <span className="text-[#66BB6A]">Active</span>
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      {route.source} → {route.destination}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2">
                    {route.accessibilityFriendly && (
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-sky-500/20 border border-sky-500/40 text-sky-400 rounded-full flex items-center gap-1">
                        <Accessibility className="w-3 h-3" /> Step-Free Path
                      </span>
                    )}
                    <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                      route.crowdLevel === 'low'
                        ? 'bg-green-500/20 border-green-500/40 text-green-400'
                        : route.crowdLevel === 'medium'
                        ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                        : 'bg-red-500/20 border-red-500/40 text-red-400'
                    }`}>
                      <CheckCircle className="w-3 h-3" /> {route.crowdLevel} Density
                    </span>
                  </div>
                </div>

                {/* Duration / Distance KPI Rows */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#66BB6A]" />
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Estimated Walk</span>
                      <span className="text-lg font-bold text-white">{route.estimatedTimeMin} mins</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <Milestone className="w-5 h-5 text-[#66BB6A]" />
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Total Distance</span>
                      <span className="text-lg font-bold text-white">{route.distanceMeters} meters</span>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Directions */}
                <div className="mt-6 space-y-4">
                  <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider">Navigation Instructions</span>
                  <div className="relative pl-6 border-l border-white/15 space-y-4">
                    {route.routeSteps.map((step, idx) => (
                      <div key={idx} className="relative group">
                        {/* Node marker */}
                        <div className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#66BB6A] bg-[#071A12] flex items-center justify-center group-hover:scale-110 transition duration-200" />
                        
                        <div className="p-2.5 rounded-lg hover:bg-white/5 transition duration-200">
                          <span className="text-[10px] font-mono text-[#66BB6A] block">STEP {idx + 1}</span>
                          <p className="text-sm text-gray-200">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Congestion Notice footer */}
              {route.crowdLevel === 'high' && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl text-xs flex gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    <strong>Caution:</strong> This path contains sections of higher-than-average density near concession lines. Walk with care.
                  </span>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4">
                <Compass className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-white font-semibold mb-1">Ready for Navigation</h4>
              <p className="text-xs text-gray-400 max-w-sm">
                Select your source location and target destination service to map your journey across the FIFA arena.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
