/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense } from 'react';
import { UserRole, StadiumZone, TransportStatus, SustainabilityMetrics, IncidentReport } from './types';
import { 
  INITIAL_ZONES, 
  INITIAL_TRANSPORTS, 
  INITIAL_SUSTAINABILITY 
} from './constants/initialState';

import CrowdCenter from './components/CrowdCenter';
import NavigationDashboard from './components/NavigationDashboard';
import AIAssistant from './components/AIAssistant';
import TransportationDashboard from './components/TransportationDashboard';
import SustainabilityInsights from './components/SustainabilityInsights';
import ImpactDashboard from './components/ImpactDashboard';

import RecommendationsDashboard from './components/RecommendationsDashboard';

import { 
  ShieldAlert, 
  Compass, 
  Users, 
  Bus, 
  Leaf, 
  User, 
  Activity, 
  Globe2,
  Key,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ApiKeyOverlay from './components/ApiKeyOverlay';

// High-fidelity loading skeleton to satisfy visual feedback requirements during dynamic loading
function LoadingSkeleton() {
  return (
    <div className="w-full min-h-[400px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center animate-pulse">
      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-4">
        <svg className="w-6 h-6 animate-spin text-[#66BB6A]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <span className="text-sm font-semibold text-white block">Loading Operations Hub...</span>
      <p className="text-xs text-gray-400 max-w-xs mt-1">
        Synchronizing with regional FIFA transit systems, cloud routing matrix, and local command logs...
      </p>
    </div>
  );
}

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('user_gemini_api_key'));
  const [userRole, setUserRole] = useState<UserRole>('fan');
  const [zones, setZones] = useState<StadiumZone[]>(INITIAL_ZONES);
  const [transports, setTransports] = useState<TransportStatus[]>(INITIAL_TRANSPORTS);
  const [sustainability, setSustainability] = useState<SustainabilityMetrics>(INITIAL_SUSTAINABILITY);
  const [accessibilityNeedsActive, setAccessibilityNeedsActive] = useState<boolean>(false);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [activeTab, setActiveTab] = useState<'command' | 'navigation' | 'assistant' | 'transit' | 'sustainability' | 'impact'>('command');

  const handleKeySubmitted = (key: string) => {
    localStorage.setItem('user_gemini_api_key', key);
    setApiKey(key);
  };

  const handleResetKey = () => {
    localStorage.removeItem('user_gemini_api_key');
    setApiKey(null);
  };

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/incidents');
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setIncidents(data);
      } else {
        console.warn('Received non-JSON response from /api/incidents:', response.status);
      }
    } catch (err) {
      console.error('Failed to load incidents from server:', err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  // Simple router capability to intercept /impact directly as requested in Phase 4
  useEffect(() => {
    if (window.location.pathname === '/impact' || window.location.hash === '#/impact') {
      setActiveTab('impact');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#071A12] text-white selection:bg-[#66BB6A] selection:text-black">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#0F3D2E]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-[#2E7D32]/10 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6 relative z-10">
        
        {/* Top Control Bar & Branding */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
          <div className="text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#66BB6A] bg-[#66BB6A]/10 px-2.5 py-0.5 rounded-full border border-[#66BB6A]/20">
                Live Tournament Ops
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-sky-400 bg-sky-400/10 px-2.5 py-0.5 rounded-full border border-sky-400/20">
                FIFA World Cup 2026
              </span>
              {apiKey && (
                <button
                  onClick={handleResetKey}
                  className="text-[10px] uppercase font-extrabold tracking-widest text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 px-2.5 py-0.5 rounded-full border border-yellow-400/20 transition flex items-center gap-1.5"
                  title="Click to reset or modify your Gemini API key"
                >
                  <Key className="w-2.5 h-2.5" /> Reset API Key
                </button>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
              FIFA COMMAND CENTER AI
            </h1>
            <p className="text-xs text-gray-300 mt-1">
              "AI-Powered Stadium Operations & Fan Experience Platform for FIFA World Cup 2026"
            </p>
          </div>

          {/* Interactive Persona / Stakeholder Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-black/40 p-2 rounded-xl border border-white/10 w-full md:w-auto">
            <span className="text-xs font-semibold text-gray-400 px-2 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#66BB6A]" /> Active Role:
            </span>
            <div className="grid grid-cols-4 gap-1 w-full sm:w-auto">
              {(['fan', 'volunteer', 'staff', 'organizer'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRole(role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                    userRole === role
                      ? 'bg-gradient-to-r from-[#2E7D32] to-[#0F3D2E] text-white border border-[#66BB6A]/40 shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Navigation Tabs bar - Beautiful Six Column Grid */}
        <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2" aria-label="Command Center Modules">
          {([
            { id: 'command', name: 'Command & Incidents', icon: ShieldAlert },
            { id: 'navigation', name: 'Smart Wayfinding', icon: Compass },
            { id: 'assistant', name: 'AI Co-Pilot (Chat)', icon: Globe2 },
            { id: 'transit', name: 'Transit & Parking', icon: Bus },
            { id: 'sustainability', name: 'Sustainability', icon: Leaf },
            { id: 'impact', name: 'Impact & Alignment', icon: Award },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  activeTab === tab.id
                    ? 'bg-[#0F3D2E] border-[#66BB6A] text-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#66BB6A]' : 'text-gray-400'}`} />
                <span className="text-xs font-bold text-center tracking-wide">{tab.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Main Tab Panels View Area */}
        <main className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'command' && (
              <motion.div
                key="command"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CrowdCenter 
                  zones={zones} 
                  setZones={setZones} 
                  incidents={incidents} 
                  fetchIncidents={fetchIncidents} 
                  userRole={userRole} 
                />
              </motion.div>
            )}

            {activeTab === 'navigation' && (
              <motion.div
                key="navigation"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <NavigationDashboard 
                  accessibilityActive={accessibilityNeedsActive} 
                  setAccessibilityActive={setAccessibilityNeedsActive} 
                />
              </motion.div>
            )}

            {activeTab === 'assistant' && (
              <motion.div
                key="assistant"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AIAssistant />
              </motion.div>
            )}

            {activeTab === 'transit' && (
              <motion.div
                key="transit"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TransportationDashboard 
                  transports={transports} 
                  setTransports={setTransports} 
                  userRole={userRole} 
                />
              </motion.div>
            )}

            {activeTab === 'sustainability' && (
              <motion.div
                key="sustainability"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SustainabilityInsights 
                  metrics={sustainability} 
                  setMetrics={setSustainability} 
                />
              </motion.div>
            )}

            {activeTab === 'impact' && (
              <motion.div
                key="impact"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ImpactDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Unified Intelligent Recommendations Row (Feature 8) */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <RecommendationsDashboard 
            zones={zones}
            transports={transports}
            sustainability={sustainability}
            accessibilityNeedsActive={accessibilityNeedsActive}
            userRole={userRole}
          />
        </section>

        {/* Footer Area */}
        <footer className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#66BB6A] animate-pulse" />
            <span>FIFA Command Center AI — Secure Operations Environment</span>
          </div>
          <div>
            <span>© 2026 FIFA World Cup. All rights reserved.</span>
          </div>
        </footer>

        {/* API Key Modal Gate */}
        {!apiKey && <ApiKeyOverlay onKeySubmitted={handleKeySubmitted} />}
      </div>
    </div>
  );
}
