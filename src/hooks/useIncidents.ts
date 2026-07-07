/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { IncidentReport } from '../types';

interface UseIncidentsReturn {
  incidents: IncidentReport[];
  loading: boolean;
  error: string | null;
  fetchIncidents: () => Promise<void>;
  updateIncidentStatus: (id: string, status: 'responding' | 'resolved', staffId?: string) => Promise<boolean>;
}

interface UseIncidentsOptions {
  pollInterval?: number;
  isActive?: boolean;
}

const MAX_BACKOFF_INTERVAL = 60000;
const INITIAL_POLL_INTERVAL = 10000;

export function useIncidents(options: UseIncidentsOptions = {}): UseIncidentsReturn {
  const { pollInterval = INITIAL_POLL_INTERVAL, isActive = true } = options;

  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consecutiveFailuresRef = useRef(0);
  const currentBackoffRef = useRef(pollInterval);

  const fetchIncidents = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/incidents');
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setIncidents(data);
        setError(null);
        consecutiveFailuresRef.current = 0;
        currentBackoffRef.current = pollInterval;
      } else {
        console.warn('Non-JSON response from /api/incidents:', response.status);
        setError('Failed to load incidents');
        consecutiveFailuresRef.current++;
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      setError(err instanceof Error ? err.message : 'Network error');
      consecutiveFailuresRef.current++;
    }

    if (consecutiveFailuresRef.current > 0) {
      currentBackoffRef.current = Math.min(
        pollInterval * Math.pow(2, consecutiveFailuresRef.current - 1),
        MAX_BACKOFF_INTERVAL
      );
    }
  }, [pollInterval]);

  const updateIncidentStatus = useCallback(async (
    id: string,
    status: 'responding' | 'resolved',
    staffId?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/incidents/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assignedStaffId: status === 'responding' ? staffId || `staff-v${Math.floor(Math.random() * 50)}` : undefined,
        }),
      });

      if (response.ok) {
        await fetchIncidents();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update incident status:', err);
      return false;
    }
  }, [fetchIncidents]);

  useEffect(() => {
    if (!isActive) return;

    setLoading(true);
    fetchIncidents().finally(() => setLoading(false));

    if (pollInterval > 0) {
      const interval = setInterval(fetchIncidents, currentBackoffRef.current);
      return () => clearInterval(interval);
    }
  }, [fetchIncidents, pollInterval, isActive]);

  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible' && isActive) {
        fetchIncidents();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchIncidents, isActive]);

  return {
    incidents,
    loading,
    error,
    fetchIncidents,
    updateIncidentStatus,
  };
}
