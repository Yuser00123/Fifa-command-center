/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { NavigationRoute } from '../types';
import { NAVIGATION_LOCATIONS } from '../constants/initialState';

interface UseNavigationProps {
  accessibilityActive: boolean;
  setAccessibilityActive: (active: boolean) => void;
}

export function useNavigation({ accessibilityActive, setAccessibilityActive }: UseNavigationProps) {
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
    const src = source;
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

  return {
    source,
    setSource,
    destination,
    setDestination,
    route,
    setRoute,
    loading,
    error,
    calculateRoute,
    handleShortcutClick,
  };
}
