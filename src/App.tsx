/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { UserRole, StadiumZone, TransportStatus, SustainabilityMetrics } from './types';
import {
  INITIAL_ZONES,
  INITIAL_TRANSPORTS,
  INITIAL_SUSTAINABILITY
} from './constants/initialState';
import { useIncidents } from './hooks';

import RecommendationsDashboard from './components/RecommendationsDashboard';

import { ShieldAlert, Compass, Bus, Leaf, User, Activity, Globe as Globe2, Key, Loader as Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ApiKeyOverlay from './components/ApiKeyOverlay';

// Lazy load heavy dashboard components for better initial load performance
const ImpactDashboard = lazy(() => import('./components/ImpactDashboard'));
const CrowdCenter = lazy(() => import('./components/CrowdCenter'));
const NavigationDashboard = lazy(() => import('./components/NavigationDashboard'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));
const TransportationDashboard = lazy(() => import('./components/TransportationDashboard'));
const SustainabilityInsights = lazy(() => import('./components/SustainabilityInsights'));

// Loading fallback component
const DashboardLoader = () => (
  <div className="min-h-[400px] flex flex-col items-center justify-center">
    <div className="w-16 h-16 rounded-full bg-[#66BB6A]/10 flex items-center justify-center border border-[#66BB6A]/30 mb-4">
      <Loader2 className="w-8 h-8 text-[#66BB6A] animate-spin" />
    </div>
    <span className="text-sm text-gray-400">Loading Dashboard...</span>
  </div>
);

// Tab configuration as const for type safety
const TAB_CONFIG = [
  { id: 'impact', name: 'Challenge Overview', icon: Activity },
  { id: 'command', name: 'Command & Incidents', icon: ShieldAlert },
  { id: 'navigation', name: 'Smart Wayfinding', icon: Compass },
  { id: 'assistant', name: 'AI Co-Pilot (Chat)', icon: Globe2 },
  { id: 'transit', name: 'Transit & Parking', icon: Bus },
  { id: 'sustainability', name: 'Sustainability', icon: Leaf },
] as const;

type TabId = typeof TAB_CONFIG[number]['id'];
type UserRoleType = 'fan' | 'volunteer' | 'staff' | 'organizer';

const SESSION_EXPIRY_HOURS = 24;

function getSessionApiKey(): string | null {
  const stored = sessionStorage.getItem('api_key_session');
  if (!stored) return null;

  try {
    const { key, expires } = JSON.parse(stored);
    if (Date.now() > expires) {
      sessionStorage.removeItem('api_key_session');
      return null;
    }
    return key;
  } catch {
    sessionStorage.removeItem('api_key_session');
    return null;
  }
}

function setSessionApiKey(key: string): void {
  const expires = Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000;
  sessionStorage.setItem('api_key_session', JSON.stringify({ key, expires }));
}

function clearSessionApiKey(): void {
  sessionStorage.removeItem('api_key_session');
}

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(() => getSessionApiKey());
  const [userRole, setUserRole] = useState<UserRoleType>('fan');
  const [zones, setZones] = useState<StadiumZone[]>(INITIAL_ZONES);
  const [transports, setTransports] = useState<TransportStatus[]>(INITIAL_TRANSPORTS);
  const [sustainability, setSustainability] = useState<SustainabilityMetrics>(INITIAL_SUSTAINABILITY);
  const [accessibilityNeedsActive, setAccessibilityNeedsActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabId>('impact');

  // Use custom hook for incidents management with polling (suspends when not on command tab)
  const { incidents, fetchIncidents, updateIncidentStatus } = useIncidents({
    pollInterval: 10000,
    isActive: activeTab === 'command',
  });

  const handleKeySubmitted = useCallback((key: string) => {
    setSessionApiKey(key);
    setApiKey(key);
  }, []);

  const handleResetKey = useCallback(() => {
    clearSessionApiKey();
    setApiKey(null);
  }, []);

  const handleRoleChange = useCallback((role: UserRoleType) => {
    setUserRole(role);
  }, []);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  // Memoize user role buttons to prevent recreation
  const userRoleButtons = useMemo(() => {
    return (['fan', 'volunteer', 'staff', 'organizer'] as UserRoleType[]).map((role) => (
      <button
        key={role}
        onClick={() => handleRoleChange(role)}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
          userRole === role
            ? 'bg-gradient-to-r from-[#2E7D32] to-[#0F3D2E] text-white border border-[#66BB6A]/40 shadow-md'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {role}
      </button>
    ));
  }, [userRole, handleRoleChange]);

  // Memoize tab buttons
  const tabButtons = useMemo(() => {
    return TAB_CONFIG.map((tab) => {
      const Icon = tab.icon;
      return (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
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
    });
  }, [activeTab, handleTabChange]);

  return (
    <div className="min-h-screen bg-[#071A12] text-white selection:bg-[#66BB6A] selection:text-black">
      {/* Skip to Content - Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#66BB6A] focus:text-black focus:font-bold focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Dynamic Background Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#0F3D2E]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-[#2E7D32]/10 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6 relative z-10">

        {/* Top Control Bar & Branding */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
          <div>
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
              AI-Powered Stadium Operations & Fan Experience Platform for FIFA World Cup 2026
            </p>
          </div>

          {/* Interactive Persona / Stakeholder Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-black/40 p-2 rounded-xl border border-white/10 w-full md:w-auto">
            <span className="text-xs font-semibold text-gray-400 px-2 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#66BB6A]" /> Active Role:
            </span>
            <div className="grid grid-cols-4 gap-1 w-full sm:w-auto">
              {userRoleButtons}
            </div>
          </div>
        </header>

        {/* Navigation Tabs bar */}
        <nav className="grid grid-cols-2 sm:grid-cols-6 gap-2" aria-label="Command Center Modules">
          {tabButtons}
        </nav>

        {/* Main Tab Panels View Area */}
        <main id="main-content" className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'impact' && (
              <motion.div
                key="impact"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<DashboardLoader />}>
                  <ImpactDashboard
                    zones={zones}
                    transports={transports}
                    sustainability={sustainability}
                    recommendations={[]}
                    userRole={userRole}
                    accessibilityActive={accessibilityNeedsActive}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'command' && (
              <motion.div
                key="command"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<DashboardLoader />}>
                  <CrowdCenter
                    zones={zones}
                    setZones={setZones}
                    incidents={incidents}
                    fetchIncidents={fetchIncidents}
                    updateIncidentStatus={updateIncidentStatus}
                    userRole={userRole}
                  />
                </Suspense>
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
                <Suspense fallback={<DashboardLoader />}>
                  <NavigationDashboard
                    accessibilityActive={accessibilityNeedsActive}
                    setAccessibilityActive={setAccessibilityNeedsActive}
                  />
                </Suspense>
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
                <Suspense fallback={<DashboardLoader />}>
                  <AIAssistant />
                </Suspense>
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
                <Suspense fallback={<DashboardLoader />}>
                  <TransportationDashboard
                    transports={transports}
                    setTransports={setTransports}
                    userRole={userRole}
                  />
                </Suspense>
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
                <Suspense fallback={<DashboardLoader />}>
                  <SustainabilityInsights
                    metrics={sustainability}
                    setMetrics={setSustainability}
                  />
                </Suspense>
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
            <span>&copy; 2026 FIFA World Cup. All rights reserved.</span>
          </div>
        </footer>

        {/* API Key Modal Gate */}
        {!apiKey && <ApiKeyOverlay onKeySubmitted={handleKeySubmitted} />}
      </div>
    </div>
  );
}
