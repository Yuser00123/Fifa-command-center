/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StadiumZone, IncidentReport } from '../types';

interface UseCrowdCenterProps {
  setZones: React.Dispatch<React.SetStateAction<StadiumZone[]>>;
  fetchIncidents: () => Promise<void>;
}

export function useCrowdCenter({ setZones, fetchIncidents }: UseCrowdCenterProps) {
  const [formCategory, setFormCategory] = useState<'medical' | 'security' | 'facility' | 'crowd' | 'accessibility'>('crowd');
  const [formZone, setFormZone] = useState('zone-north');
  const [formSeverity, setFormSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSimulateDensity = (zoneId: string, level: 'low' | 'medium' | 'high' | 'critical') => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === zoneId) {
          let queueTime = 5;
          let occupancy = 35;
          if (level === 'medium') { queueTime = 10; occupancy = 60; }
          if (level === 'high') { queueTime = 20; occupancy = 85; }
          if (level === 'critical') { queueTime = 30; occupancy = 95; }
          return {
            ...z,
            crowdDensity: level,
            queueLengthMin: queueTime,
            occupancyPercentage: occupancy,
            gateStatus: level === 'critical' || level === 'high' ? 'congested' : 'open',
          };
        }
        return z;
      })
    );
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneId: formZone,
          category: formCategory,
          severity: formSeverity,
          description: formDesc,
        }),
      });

      if (response.ok) {
        setFormDesc('');
        await fetchIncidents();
      }
    } catch (err) {
      console.error('Failed to report incident:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'responding' | 'resolved') => {
    try {
      const response = await fetch(`/api/incidents/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          assignedStaffId: newStatus === 'responding' ? 'staff-v' + Math.floor(Math.random() * 50) : undefined,
        }),
      });

      if (response.ok) {
        await fetchIncidents();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return {
    formCategory,
    setFormCategory,
    formZone,
    setFormZone,
    formSeverity,
    setFormSeverity,
    formDesc,
    setFormDesc,
    submitting,
    handleSimulateDensity,
    handleCreateIncident,
    handleUpdateStatus,
  };
}
