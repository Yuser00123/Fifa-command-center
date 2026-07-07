/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TransportStatus } from '../types';
import { generateContentWithResilience } from '../services/ai/aiProvider';

interface UseTransportationProps {
  transports: TransportStatus[];
  setTransports: React.Dispatch<React.SetStateAction<TransportStatus[]>>;
}

export function useTransportation({ transports, setTransports }: UseTransportationProps) {
  const [journeyType, setJourneyType] = useState<'arrival' | 'departure'>('arrival');
  const [travelMode, setTravelMode] = useState<'shuttle' | 'car' | 'metro'>('metro');
  const [routeAdvice, setRouteAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulateDelay = (id: string, mins: number) => {
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
  };

  const handleGenerateTravelAdvice = async () => {
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

      const userKey = localStorage.getItem('user_gemini_api_key') || undefined;
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
  };

  return {
    journeyType,
    setJourneyType,
    travelMode,
    setTravelMode,
    routeAdvice,
    setRouteAdvice,
    loading,
    handleSimulateDelay,
    handleGenerateTravelAdvice,
  };
}
