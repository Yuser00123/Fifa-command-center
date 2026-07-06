import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateRecommendations, RecommendationInput } from '../services/recommendations/recommendationEngine';
import { generateContentWithResilience } from '../services/ai/aiProvider';

// Mock aiProvider
vi.mock('../services/ai/aiProvider', () => {
  return {
    generateContentWithResilience: vi.fn(),
  };
});

describe('recommendationEngine.ts logic tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateContentWithResilience).mockRejectedValue(new Error('API failure simulation'));
  });

  it('triggers crowd density recommendations for staff', async () => {
    const input: RecommendationInput = {
      zones: [
        {
          id: 'zone-1',
          name: 'North Gate',
          crowdDensity: 'critical',
          occupancyPercentage: 92,
          queueLengthMin: 22,
          gateStatus: 'open',
        }
      ],
      transports: [],
      sustainability: {
        wasteGeneratedKg: 1000,
        wasteRecycledKg: 800, // 80%
        energyConsumptionKwh: 20000,
        renewableEnergyPercentage: 80,
        transitEmissionsCo2Kg: 500,
      },
      accessibilityNeedsActive: false,
      userRole: 'staff',
    };

    const recs = await generateRecommendations(input);
    
    // Find crowd recommendation
    const crowdRec = recs.find(r => r.category === 'crowd');
    expect(crowdRec).toBeDefined();
    expect(crowdRec?.urgency).toBe('high');
    expect(crowdRec?.title).toBe('Resource Deployment: North Gate');
    expect(crowdRec?.actionableStep).toBe('Redeploy auxiliary stanchions and activate backup ticket scanner lanes.');
  });

  it('triggers transit delay recommendations for fans', async () => {
    const input: RecommendationInput = {
      zones: [],
      transports: [
        {
          parkingId: 'lot-a',
          name: 'VIP Lot A',
          capacity: 1000,
          availableSpaces: 100,
          status: 'full',
          delayMinutes: 15,
          shuttleFrequencyMin: 12,
        }
      ],
      sustainability: {
        wasteGeneratedKg: 1000,
        wasteRecycledKg: 800,
        energyConsumptionKwh: 20000,
        renewableEnergyPercentage: 80,
        transitEmissionsCo2Kg: 500,
      },
      accessibilityNeedsActive: false,
      userRole: 'fan',
    };

    const recs = await generateRecommendations(input);
    
    const transitRec = recs.find(r => r.category === 'transport');
    expect(transitRec).toBeDefined();
    expect(transitRec?.title).toBe('Transit Delay: VIP Lot A');
    expect(transitRec?.actionableStep).toContain('Board the Green Express Shuttle');
  });

  it('triggers transit delay recommendations for organizers and staff', async () => {
    const input: RecommendationInput = {
      zones: [],
      transports: [
        {
          parkingId: 'lot-b',
          name: 'General Lot B',
          capacity: 1000,
          availableSpaces: 10,
          status: 'full',
          delayMinutes: 12,
          shuttleFrequencyMin: 5,
        }
      ],
      sustainability: {
        wasteGeneratedKg: 1000,
        wasteRecycledKg: 800,
        energyConsumptionKwh: 20000,
        renewableEnergyPercentage: 80,
        transitEmissionsCo2Kg: 500,
      },
      accessibilityNeedsActive: false,
      userRole: 'organizer',
    };

    const recs = await generateRecommendations(input);
    const transitRec = recs.find(r => r.category === 'transport');
    expect(transitRec).toBeDefined();
    expect(transitRec?.title).toBe('Traffic Surge: General Lot B');
    expect(transitRec?.actionableStep).toContain('Dispatch additional traffic control staff');
  });

  it('triggers accessibility active recommendations', async () => {
    const input: RecommendationInput = {
      zones: [],
      transports: [],
      sustainability: {
        wasteGeneratedKg: 1000,
        wasteRecycledKg: 800,
        energyConsumptionKwh: 20000,
        renewableEnergyPercentage: 80,
        transitEmissionsCo2Kg: 500,
      },
      accessibilityNeedsActive: true,
      userRole: 'fan',
    };

    const recs = await generateRecommendations(input);
    const accRec = recs.find(r => r.category === 'accessibility');
    expect(accRec).toBeDefined();
    expect(accRec?.title).toBe('Step-Free Routing Activated');
  });

  it('handles zero waste sustainability edge case', async () => {
    const input: RecommendationInput = {
      zones: [],
      transports: [],
      sustainability: {
        wasteGeneratedKg: 0,
        wasteRecycledKg: 0,
        energyConsumptionKwh: 20000,
        renewableEnergyPercentage: 80,
        transitEmissionsCo2Kg: 500,
      },
      accessibilityNeedsActive: false,
      userRole: 'organizer',
    };

    const recs = await generateRecommendations(input);
    expect(recs).toBeDefined();
  });

  it('triggers low recycling rate warnings for organizers', async () => {
    const input: RecommendationInput = {
      zones: [],
      transports: [],
      sustainability: {
        wasteGeneratedKg: 1000,
        wasteRecycledKg: 300, // 30% recycling rate
        energyConsumptionKwh: 20000,
        renewableEnergyPercentage: 80,
        transitEmissionsCo2Kg: 500,
      },
      accessibilityNeedsActive: false,
      userRole: 'organizer',
    };

    const recs = await generateRecommendations(input);
    
    const sustRec = recs.find(r => r.category === 'sustainability');
    expect(sustRec).toBeDefined();
    expect(sustRec?.title).toBe('Action Required: Trash Diversion');
    expect(sustRec?.actionableStep).toBe('Deploy eco-volunteers with green sorting bins to Sector B concession stalls.');
  });

  it('synthesizes AI recommendations successfully when API succeeds', async () => {
    const mockAiRec = {
      id: 'ai-rec-123',
      title: 'AI Smart Ventilation',
      targetRole: 'organizer',
      category: 'operations',
      urgency: 'medium',
      message: 'Temperature spike in east terminal.',
      actionableStep: 'Turn on auxiliary fan cooling grids.',
      timestamp: new Date().toISOString()
    };
    
    vi.mocked(generateContentWithResilience).mockResolvedValueOnce(
      JSON.stringify([mockAiRec])
    );

    const input: RecommendationInput = {
      zones: [],
      transports: [],
      sustainability: {
        wasteGeneratedKg: 1000,
        wasteRecycledKg: 800,
        energyConsumptionKwh: 20000,
        renewableEnergyPercentage: 80,
        transitEmissionsCo2Kg: 500,
      },
      accessibilityNeedsActive: false,
      userRole: 'organizer',
    };

    const recs = await generateRecommendations(input);
    const aiRec = recs.find(r => r.id === 'ai-rec-123');
    expect(aiRec).toBeDefined();
    expect(aiRec?.title).toBe('AI Smart Ventilation');
  });

  it('reverts to default fallback recommendations if no rules trigger and AI fails', async () => {
    const input: RecommendationInput = {
      zones: [],
      transports: [],
      sustainability: {
        wasteGeneratedKg: 1000,
        wasteRecycledKg: 800, // 80% recycling rate
        energyConsumptionKwh: 20000,
        renewableEnergyPercentage: 80,
        transitEmissionsCo2Kg: 500,
      },
      accessibilityNeedsActive: false,
      userRole: 'fan',
    };

    const recs = await generateRecommendations(input);
    expect(recs.length).toBeGreaterThanOrEqual(2);
  });
});
