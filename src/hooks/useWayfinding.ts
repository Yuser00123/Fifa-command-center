/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { NavigationRoute } from '../types';
import { getApiKey } from '../utils/apiKey';

type ShortcutCategory = 'medical' | 'food' | 'lift' | 'seat';

interface ShortcutDestination {
  destination: string;
  enableAccessibility?: boolean;
}

const SHORTCUT_DESTINATIONS: Record<ShortcutCategory, ShortcutDestination> = {
  medical: { destination: 'Medical Station Alpha (West)' },
  food: { destination: 'Food Court West Plaza' },
  lift: { destination: 'Main Accessibility Lift Lobby 3', enableAccessibility: true },
  seat: { destination: 'Sector 122 Standard Seating' },
};

interface UseWayfindingReturn {
  source: string;
  destination: string;
  route: NavigationRoute | null;
  loading: boolean;
  error: string | null;
  setSource: (source: string) => void;
  setDestination: (destination: string) => void;
  calculateRoute: (src: string, dest: string, accessibility: boolean) => Promise<void>;
  handleShortcut: (category: ShortcutCategory, accessibilityActive: boolean) => { newDestination: string; shouldEnableAccessibility: boolean };
  clearRoute: () => void;
}

export function useWayfinding(
  initialSource: string,
  initialDestination: string
): UseWayfindingReturn {
  const [source, setSource] = useState(initialSource);
  const [destination, setDestination] = useState(initialDestination);
  const [route, setRoute] = useState<NavigationRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = useCallback(async (
    src: string,
    dest: string,
    accessibility: boolean
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const userKey = getApiKey();
      if (userKey) headers['x-gemini-api-key'] = userKey;

      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers,
        body: JSON.stringify({ source: src, destination: dest, accessibility }),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('Could not calculate route or received non-JSON format.');
      }

      const data = await response.json();
      setRoute(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleShortcut = useCallback((
    category: ShortcutCategory,
    accessibilityActive: boolean
  ): { newDestination: string; shouldEnableAccessibility: boolean } => {
    const shortcut = SHORTCUT_DESTINATIONS[category];
    setDestination(shortcut.destination);

    return {
      newDestination: shortcut.destination,
      shouldEnableAccessibility: shortcut.enableAccessibility ?? false,
    };
  }, []);

  const clearRoute = useCallback(() => {
    setRoute(null);
    setError(null);
  }, []);

  return {
    source,
    destination,
    route,
    loading,
    error,
    setSource,
    setDestination,
    calculateRoute,
    handleShortcut,
    clearRoute,
  };
}
