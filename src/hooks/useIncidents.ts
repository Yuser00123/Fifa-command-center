/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { IncidentReport } from '../types';

interface UseIncidentsReturn {
  incidents: IncidentReport[];
  loading: boolean;
  error: string | null;
  fetchIncidents: () => Promise<void>;
  updateIncidentStatus: (id: string, status: 'responding' | 'resolved', staffId?: string) => Promise<boolean>;
}

export function useIncidents(pollInterval: number = 10000): UseIncidentsReturn {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      const response = await fetch('/api/incidents');
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setIncidents(data);
        setError(null);
      } else {
        console.warn('Non-JSON response from /api/incidents:', response.status);
        setError('Failed to load incidents');
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      setError(err instanceof Error ? err.message : 'Network error');
    }
  }, []);

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

  // Initial fetch and polling
  useEffect(() => {
    setLoading(true);
    fetchIncidents().finally(() => setLoading(false));

    if (pollInterval > 0) {
      const interval = setInterval(fetchIncidents, pollInterval);
      return () => clearInterval(interval);
    }
  }, [fetchIncidents, pollInterval]);

  return {
    incidents,
    loading,
    error,
    fetchIncidents,
    updateIncidentStatus,
  };
}
