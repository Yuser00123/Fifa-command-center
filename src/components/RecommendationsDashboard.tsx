/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AIRecommendation, StadiumZone, TransportStatus, SustainabilityMetrics, UserRole } from '../types';
import { 
  Sparkles, 
  Map, 
  Users, 
  Accessibility, 
  Bus, 
  CheckCircle, 
  Leaf, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  zones: StadiumZone[];
  transports: TransportStatus[];
  sustainability: SustainabilityMetrics;
  accessibilityNeedsActive: boolean;
  userRole: UserRole;
}

export default function RecommendationsDashboard({ 
  zones, 
  transports, 
  sustainability, 
  accessibilityNeedsActive,
  userRole 
}: Props) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zones,
          transports,
          sustainability,
          accessibilityNeedsActive,
          userRole
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('Failed to retrieve recommendations or received non-JSON format.');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [zones, transports, sustainability, accessibilityNeedsActive, userRole]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'navigation': return <Map className="w-4 h-4 text-[#66BB6A]" />;
      case 'crowd': return <Users className="w-4 h-4 text-orange-400" />;
      case 'accessibility': return <Accessibility className="w-4 h-4 text-sky-400" />;
      case 'transport': return <Bus className="w-4 h-4 text-blue-400" />;
      case 'sustainability': return <Leaf className="w-4 h-4 text-[#66BB6A]" />;
      default: return <Sparkles className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div id="recommendations-dashboard-wrapper" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#66BB6A]" /> Gemini Personalized Recommendations
          </h3>
          <p className="text-xs text-gray-400">
            Intelligent tactics synthesized specifically for the <strong className="text-[#66BB6A] uppercase">{userRole}</strong> user group.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-[#66BB6A] font-semibold transition"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Refresh Engine
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading && recommendations.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#66BB6A] animate-spin mb-3" />
            <span className="text-sm text-gray-400">Syncing and parsing stadium operational criteria...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {error}. Retrying local guidelines.
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {recommendations.map((rec) => (
              <div 
                key={rec.id}
                className="p-5 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-black/30 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all duration-200"
              >
                <div>
                  {/* Category & Urgency Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-xs text-white/80 font-bold capitalize">
                      {getCategoryIcon(rec.category)}
                      {rec.category}
                    </span>
                    
                    <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                      rec.urgency === 'high'
                        ? 'bg-red-500/20 text-red-400 animate-pulse'
                        : rec.urgency === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {rec.urgency} Urgency
                    </span>
                  </div>

                  {/* Message Title & text */}
                  <h4 className="text-sm font-bold text-white mb-1.5">{rec.title}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">{rec.message}</p>
                </div>

                {/* Actionable Step Card */}
                <div className="p-3 rounded-lg bg-[#0F3D2E]/40 border border-[#2E7D32]/30 space-y-1">
                  <span className="text-[9px] text-[#66BB6A] uppercase font-bold tracking-wide block">Actionable Protocol</span>
                  <p className="text-xs text-white font-medium">{rec.actionableStep}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
