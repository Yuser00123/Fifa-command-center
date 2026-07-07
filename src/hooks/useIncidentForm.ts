/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { IncidentReport } from '../types';

const INCIDENT_CATEGORIES = ['medical', 'security', 'facility', 'crowd', 'accessibility'] as const;
const SEVERITY_LEVELS = ['low', 'medium', 'high'] as const;

type IncidentCategory = typeof INCIDENT_CATEGORIES[number];
type SeverityLevel = typeof SEVERITY_LEVELS[number];

interface UseIncidentFormOptions {
  defaultZone?: string;
  onSubmitSuccess?: () => void;
}

interface UseIncidentFormReturn {
  category: IncidentCategory;
  setCategory: (cat: IncidentCategory) => void;
  zoneId: string;
  setZoneId: (zone: string) => void;
  severity: SeverityLevel;
  setSeverity: (sev: SeverityLevel) => void;
  description: string;
  setDescription: (desc: string) => void;
  isSubmitting: boolean;
  submitIncident: () => Promise<boolean>;
  resetForm: () => void;
}

export function useIncidentForm(options: UseIncidentFormOptions = {}): UseIncidentFormReturn {
  const { defaultZone = 'zone-north', onSubmitSuccess } = options;

  const [category, setCategory] = useState<IncidentCategory>('crowd');
  const [zoneId, setZoneId] = useState(defaultZone);
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitIncident = useCallback(async (): Promise<boolean> => {
    if (!description.trim()) return false;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneId,
          category,
          severity,
          description: description.trim(),
        }),
      });

      if (response.ok) {
        setDescription('');
        onSubmitSuccess?.();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to submit incident:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [zoneId, category, severity, description, onSubmitSuccess]);

  const resetForm = useCallback(() => {
    setCategory('crowd');
    setZoneId(defaultZone);
    setSeverity('medium');
    setDescription('');
  }, [defaultZone]);

  return {
    category,
    setCategory,
    zoneId,
    setZoneId,
    severity,
    setSeverity,
    description,
    setDescription,
    isSubmitting,
    submitIncident,
    resetForm,
  };
}

export { INCIDENT_CATEGORIES, SEVERITY_LEVELS };
