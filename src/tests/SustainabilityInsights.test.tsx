import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SustainabilityInsights from '../components/SustainabilityInsights';
import { SustainabilityMetrics } from '../types';

describe('SustainabilityInsights Component', () => {
  const initialMetrics: SustainabilityMetrics = {
    wasteGeneratedKg: 10000,
    wasteRecycledKg: 4000,
    energyConsumptionKwh: 25000,
    renewableEnergyPercentage: 60,
    transitEmissionsCo2Kg: 800,
  };

  it('calculates the Green Operations Index score and trash diversion rate correctly', () => {
    const setMetrics = vi.fn();
    render(
      <SustainabilityInsights
        metrics={initialMetrics}
        setMetrics={setMetrics}
      />
    );

    // Trash diversion rate is (4000 / 10000) * 100 = 40.0%
    expect(screen.getByText('40.0%')).toBeInTheDocument();

    // Check Sustainability Score is visible (scoreBase = (40 + 60)/2 = 50. emissionsBonus = 30 - 800/40 = 10. score = 60/100)
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it('triggers eco pledge and updates parent state', () => {
    const setMetrics = vi.fn();
    render(
      <SustainabilityInsights
        metrics={initialMetrics}
        setMetrics={setMetrics}
      />
    );

    const button = screen.getByText('Launch Eco Pledge');
    fireEvent.click(button);

    // expect setMetrics callback to be called to raise metrics
    expect(setMetrics).toHaveBeenCalledTimes(1);

    // expect button to transition to pledged state
    expect(screen.getByText('Pledge Campaign Live')).toBeInTheDocument();
    expect(screen.getByText('Pledge Campaign Live')).toBeDisabled();
  });

  it('handles zero waste generated safely to avoid division by zero', () => {
    const setMetrics = vi.fn();
    const zeroMetrics: SustainabilityMetrics = {
      wasteGeneratedKg: 0,
      wasteRecycledKg: 0,
      energyConsumptionKwh: 30000,
      renewableEnergyPercentage: 30,
      transitEmissionsCo2Kg: 2000,
    };

    render(
      <SustainabilityInsights
        metrics={zeroMetrics}
        setMetrics={setMetrics}
      />
    );

    // Trash diversion rate is 0.0%
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    // Eco rating should represent Low Target alert because renewable is 30% and emissions are high
    expect(screen.getByText('Alert: Low Target')).toBeInTheDocument();
  });
});
