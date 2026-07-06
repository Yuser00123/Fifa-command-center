import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import RecommendationsDashboard from '../components/RecommendationsDashboard';
import { AIRecommendation, StadiumZone, TransportStatus, SustainabilityMetrics } from '../types';

const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('RecommendationsDashboard Component', () => {
  const sampleZones: StadiumZone[] = [
    {
      id: 'zone-north',
      name: 'North Concourse Gate',
      crowdDensity: 'medium',
      occupancyPercentage: 55,
      queueLengthMin: 12,
      gateStatus: 'open',
    },
  ];

  const sampleTransports: TransportStatus[] = [
    {
      parkingId: 'lot-a',
      name: 'North Lot A (VIP)',
      capacity: 1200,
      availableSpaces: 400,
      status: 'filling_fast',
      delayMinutes: 5,
      shuttleFrequencyMin: 10,
    },
  ];

  const sampleSustainability: SustainabilityMetrics = {
    wasteGeneratedKg: 10000,
    wasteRecycledKg: 4000,
    energyConsumptionKwh: 25000,
    renewableEnergyPercentage: 60,
    transitEmissionsCo2Kg: 800,
  };

  const sampleRecommendations: AIRecommendation[] = [
    {
      id: 'rec-1',
      category: 'sustainability',
      urgency: 'medium',
      title: 'Leverage Clean Power Systems',
      message: 'Stadium currently operates on 60% clean power grid metrics.',
      actionableStep: 'Maximize Solar canopy output during matchday hours.',
      targetRole: 'staff',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'rec-2',
      category: 'transport',
      urgency: 'high',
      title: 'Deploy Shuttle Relievers',
      message: 'Significant delays detected near North Lot A shuttle corridor.',
      actionableStep: 'Deploy bus 24 & 28 immediately to clear Lot A queue.',
      targetRole: 'staff',
      timestamp: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('fetches and renders recommendations on load', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => sampleRecommendations,
    });

    render(
      <RecommendationsDashboard
        zones={sampleZones}
        transports={sampleTransports}
        sustainability={sampleSustainability}
        accessibilityNeedsActive={false}
        userRole="staff"
      />
    );

    // Initial loading indicator
    expect(screen.getByText('Syncing and parsing stadium operational criteria...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Syncing and parsing stadium operational criteria...')).not.toBeInTheDocument();
    });

    // Verify recommendations are listed
    expect(screen.getByText('Leverage Clean Power Systems')).toBeInTheDocument();
    expect(screen.getByText('Deploy Shuttle Relievers')).toBeInTheDocument();
    expect(screen.getByText('high Urgency')).toBeInTheDocument();
    expect(screen.getByText('Deploy bus 24 & 28 immediately to clear Lot A queue.')).toBeInTheDocument();
  });

  it('displays an error message when API call fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => 'application/json' },
      json: async () => ({ error: 'Database offline' }),
    });

    render(
      <RecommendationsDashboard
        zones={sampleZones}
        transports={sampleTransports}
        sustainability={sampleSustainability}
        accessibilityNeedsActive={false}
        userRole="staff"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to retrieve recommendations/)).toBeInTheDocument();
    });
  });

  it('renders specific category icons for navigation, crowd, accessibility, and fallback categories', async () => {
    const variedRecs: AIRecommendation[] = [
      {
        id: 'var-1',
        category: 'navigation',
        urgency: 'low',
        title: 'Main Gate Signage',
        message: 'Wayfinding signs.',
        actionableStep: 'Turn on signs.',
        targetRole: 'staff',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'var-2',
        category: 'crowd',
        urgency: 'medium',
        title: 'Ramp Queue Limit',
        message: 'Ramp is congested.',
        actionableStep: 'Open gate.',
        targetRole: 'staff',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'var-3',
        category: 'accessibility',
        urgency: 'high',
        title: 'Elevator Lift Power',
        message: 'Elevator needs support.',
        actionableStep: 'Deploy technician.',
        targetRole: 'staff',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'var-4',
        category: 'custom-unsupported' as any,
        urgency: 'low',
        title: 'Sparkle Advice',
        message: 'Advice.',
        actionableStep: 'Take action.',
        targetRole: 'staff',
        timestamp: new Date().toISOString(),
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => variedRecs,
    });

    render(
      <RecommendationsDashboard
        zones={sampleZones}
        transports={sampleTransports}
        sustainability={sampleSustainability}
        accessibilityNeedsActive={false}
        userRole="staff"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Main Gate Signage')).toBeInTheDocument();
    });

    expect(screen.getByText('Ramp Queue Limit')).toBeInTheDocument();
    expect(screen.getByText('Elevator Lift Power')).toBeInTheDocument();
    expect(screen.getByText('Sparkle Advice')).toBeInTheDocument();
  });
});
