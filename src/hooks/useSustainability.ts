/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SustainabilityMetrics } from '../types';

interface UseSustainabilityProps {
  metrics: SustainabilityMetrics;
  setMetrics: React.Dispatch<React.SetStateAction<SustainabilityMetrics>>;
}

export function useSustainability({ metrics, setMetrics }: UseSustainabilityProps) {
  const [pledged, setPledged] = useState(false);

  const wasteDiversionRate = metrics.wasteGeneratedKg > 0 
    ? (metrics.wasteRecycledKg / metrics.wasteGeneratedKg) * 100 
    : 0;

  const scoreBase = (wasteDiversionRate + metrics.renewableEnergyPercentage) / 2;
  const emissionsBonus = Math.max(0, 30 - (metrics.transitEmissionsCo2Kg / 40));
  const sustainabilityScore = Math.min(100, Math.round(scoreBase + emissionsBonus));

  const handleSimulateEcoPledge = () => {
    if (pledged) return;
    
    setPledged(true);
    setMetrics((prev) => ({
      ...prev,
      wasteRecycledKg: prev.wasteRecycledKg + 600,
      renewableEnergyPercentage: Math.min(100, prev.renewableEnergyPercentage + 15),
      transitEmissionsCo2Kg: Math.max(200, prev.transitEmissionsCo2Kg - 150),
    }));
  };

  return {
    pledged,
    wasteDiversionRate,
    sustainabilityScore,
    handleSimulateEcoPledge,
  };
}
