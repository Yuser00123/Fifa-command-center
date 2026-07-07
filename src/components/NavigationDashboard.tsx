/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NAVIGATION_LOCATIONS } from '../constants/initialState';
import { 
  MapPin, 
  Compass, 
  Accessibility, 
  Utensils, 
  PlusCircle, 
  Activity 
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useNavigation } from '../hooks/useNavigation';
import { RouteDisplay } from './RouteDisplay';

interface Props {
  accessibilityActive: boolean;
  setAccessibilityActive: (active: boolean) => void;
}

export default function NavigationDashboard({ accessibilityActive, setAccessibilityActive }: Props) {
  const {
    source,
    setSource,
    destination,
    setDestination,
    route,
    loading,
    error,
    calculateRoute,
    handleShortcutClick,
  } = useNavigation({ accessibilityActive, setAccessibilityActive });

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
            <div className="space-y-1.5 text-left">
              <label htmlFor="nav-start-select" className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400" /> Start Point / Gate
              </label>
              <select
                id="nav-start-select"
                aria-label="Start Location"
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
            <div className="space-y-1.5 text-left">
              <label htmlFor="nav-dest-select" className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#66BB6A]" /> Destination Service
              </label>
              <select
                id="nav-dest-select"
                aria-label="Destination Location"
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
                <div className="text-left">
                  <span className="text-sm font-semibold text-white block">Step-Free Pathway Mode</span>
                  <span className="text-[10px] text-gray-400">Avoid steps, stairs, escalators, and crowded ramps</span>
                </div>
              </div>
              <button
                role="checkbox"
                aria-label="Accessibility Mode Switch"
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
          <div className="mt-6 text-left">
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
          {loading ? 'Sequencing Route...' : 'Generate Congestion-Aware Route'}
        </button>
      </div>

      {/* Route Display Panel */}
      <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col justify-between min-h-[460px]">
        <AnimatePresence mode="wait">
          <RouteDisplay
            loading={loading}
            error={error}
            route={route}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
