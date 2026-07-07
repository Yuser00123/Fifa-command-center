/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { vi } from 'vitest';
import { StadiumZone, TransportStatus, IncidentReport, AIRecommendation, SustainabilityMetrics } from '../types';

// Create shared mock fetch factory
export function createMockFetch() {
  return vi.fn();
}

// Standard mock fetch setup for JSON responses
export function mockFetchSuccess(data: unknown, delay: number = 0) {
  return vi.fn().mockImplementation(async () => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return {
      ok: true,
      headers: {
        get: (name: string) => name.toLowerCase() === 'content-type' ? 'application/json' : null,
      },
      json: async () => data,
    };
  });
}

// Standard mock fetch setup for error responses
export function mockFetchError(status: number = 500, error: string = 'Server error') {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    headers: { get: () => 'application/json' },
    json: async () => ({ error }),
  });
}

// Factory functions for test data
export function createMockZone(overrides: Partial<StadiumZone> = {}): StadiumZone {
  return {
    id: 'zone-test',
    name: 'Test Zone',
    crowdDensity: 'medium',
    occupancyPercentage: 55,
    queueLengthMin: 10,
    gateStatus: 'open',
    ...overrides,
  };
}

export function createMockTransport(overrides: Partial<TransportStatus> = {}): TransportStatus {
  return {
    parkingId: 'lot-test',
    name: 'Test Lot',
    capacity: 1000,
    availableSpaces: 500,
    status: 'available',
    shuttleFrequencyMin: 10,
    delayMinutes: 0,
    ...overrides,
  };
}

export function createMockIncident(overrides: Partial<IncidentReport> = {}): IncidentReport {
  return {
    id: 'inc-test',
    zoneId: 'zone-test',
    category: 'crowd',
    severity: 'medium',
    description: 'Test incident',
    status: 'reported',
    reportedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockRecommendation(overrides: Partial<AIRecommendation> = {}): AIRecommendation {
  return {
    id: 'rec-test',
    title: 'Test Recommendation',
    targetRole: 'fan',
    category: 'navigation',
    urgency: 'low',
    message: 'Test message',
    actionableStep: 'Test action',
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockSustainabilityMetrics(overrides: Partial<SustainabilityMetrics> = {}): SustainabilityMetrics {
  return {
    wasteGeneratedKg: 10000,
    wasteRecycledKg: 8000,
    energyConsumptionKwh: 25000,
    renewableEnergyPercentage: 80,
    transitEmissionsCo2Kg: 500,
    ...overrides,
  };
}

// Local storage mock setup
export function setupLocalStorage() {
  const storage: Record<string, string> = {};

  return {
    setItem: (key: string, value: string) => { storage[key] = value; },
    getItem: (key: string) => storage[key] || null,
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
  };
}
