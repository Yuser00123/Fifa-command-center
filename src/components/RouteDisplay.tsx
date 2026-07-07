/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavigationRoute } from '../types';
import { 
  Accessibility, 
  CheckCircle, 
  Clock, 
  Milestone, 
  AlertTriangle, 
  Compass, 
  Loader2 
} from 'lucide-react';
import { motion } from 'motion/react';

interface RouteDisplayProps {
  loading: boolean;
  error: string | null;
  route: NavigationRoute | null;
}

export const RouteDisplay = React.memo(function RouteDisplay({
  loading,
  error,
  route,
}: RouteDisplayProps) {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[#66BB6A]/10 flex items-center justify-center border border-[#66BB6A]/30 mb-4 animate-pulse">
          <Loader2 className="w-8 h-8 text-[#66BB6A] animate-spin" />
        </div>
        <h4 className="text-white font-semibold mb-1">Synthesizing Smart Directions</h4>
        <p className="text-xs text-gray-400 max-w-sm">
          Evaluating current stadium queue levels, crowd heatmaps, and accessibility lobbies to safely map your optimal path...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h4 className="text-white font-semibold mb-1">Calculation Issue</h4>
        <p className="text-xs text-gray-400 max-w-xs">{error}</p>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-center h-full">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4 mx-auto">
          <Compass className="w-8 h-8 text-gray-400" />
        </div>
        <h4 className="text-white font-semibold mb-1">Ready for Navigation</h4>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          Select your source location and target destination service to map your journey across the FIFA arena.
        </p>
      </div>
    );
  }

  const getDensityBadgeClass = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/20 border-green-500/40 text-green-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
      default: return 'bg-red-500/20 border-red-500/40 text-red-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6 flex-1 flex flex-col justify-between"
    >
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

          <div className="flex gap-2">
            {route.accessibilityFriendly && (
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-sky-500/20 border border-sky-500/40 text-sky-400 rounded-full flex items-center gap-1">
                <Accessibility className="w-3 h-3" /> Step-Free Path
              </span>
            )}
            <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 ${getDensityBadgeClass(route.crowdLevel)}`}>
              <CheckCircle className="w-3 h-3" /> {route.crowdLevel} Density
            </span>
          </div>
        </div>

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

        <div className="mt-6 space-y-4">
          <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider">Navigation Instructions</span>
          <div className="relative pl-6 border-l border-white/15 space-y-4">
            {route.routeSteps.map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#66BB6A] bg-[#071A12] flex items-center justify-center group-hover:scale-110 transition duration-200" />
                
                <div className="p-2.5 rounded-lg hover:bg-white/5 transition duration-200 text-left">
                  <span className="text-[10px] font-mono text-[#66BB6A] block">STEP {idx + 1}</span>
                  <p className="text-sm text-gray-200">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {route.crowdLevel === 'high' && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl text-xs flex gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>Caution:</strong> This path contains sections of higher-than-average density near concession lines. Walk with care.
          </span>
        </div>
      )}
    </motion.div>
  );
});
