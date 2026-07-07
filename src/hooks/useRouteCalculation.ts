/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { NavigationRoute } from '../types';
import { getApiKey } from '../utils/apiKey';

interface UseRouteCalculationReturn {
  route: NavigationRoute | null;
  loading: boolean;
  error: string | null;
  calculateRoute: (source: string, destination: string, accessibility: boolean) => Promise<void>;
  clearRoute: () => void;
}

export function useRouteCalculation(): UseRouteCalculationReturn {
  const [route, setRoute] = useState<NavigationRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = useCallback(async (
    source: string,
    destination: string,
    accessibility: boolean
  ) => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const userKey = getApiKey();
      if (userKey) headers['x-gemini-api-key'] = userKey;

      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers,
        body: JSON.stringify({ source, destination, accessibility }),
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

  const clearRoute = useCallback(() => {
    setRoute(null);
    setError(null);
  }, []);

  return { route, loading, error, calculateRoute, clearRoute };
}
