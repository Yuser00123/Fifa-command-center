/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIRecommendation, StadiumZone, TransportStatus, SustainabilityMetrics, UserRole } from '../../types';
import { generateContentWithResilience } from '../ai/aiProvider';
import { getFallbackRecommendation } from '../ai/fallbackStrategy';

export interface RecommendationInput {
  zones: StadiumZone[];
  transports: TransportStatus[];
  sustainability: SustainabilityMetrics;
  accessibilityNeedsActive: boolean;
  userRole: UserRole;
}

export async function generateRecommendations(input: RecommendationInput): Promise<AIRecommendation[]> {
  const { zones, transports, sustainability, accessibilityNeedsActive, userRole } = input;
  
  // Rule-based base recommendation lists
  const baseRecommendations: AIRecommendation[] = [];

  // Zone overcrowding triggers
  const highDensityZones = zones.filter(z => z.crowdDensity === 'high' || z.crowdDensity === 'critical');
  for (const zone of highDensityZones) {
    if (userRole === 'fan') {
      baseRecommendations.push({
        id: `rule-fan-crowd-${zone.id}`,
        title: `Congestion Alert: ${zone.name}`,
        targetRole: 'fan',
        category: 'crowd',
        urgency: zone.crowdDensity === 'critical' ? 'high' : 'medium',
        message: `${zone.name} is experiencing extremely heavy traffic. Consider taking alternative routes.`,
        actionableStep: 'Use secondary corridors or rest in the Chill Zone until density subsides.',
        timestamp: new Date().toISOString()
      });
    } else if (userRole === 'volunteer') {
      baseRecommendations.push({
        id: `rule-vol-crowd-${zone.id}`,
        title: `Support Needed in ${zone.name}`,
        targetRole: 'volunteer',
        category: 'crowd',
        urgency: 'high',
        message: `${zone.name} density has hit ${zone.occupancyPercentage}%. Help guide pedestrian movement.`,
        actionableStep: 'Direct fans to the North/South perimeter walkways and separate oncoming streams.',
        timestamp: new Date().toISOString()
      });
    } else if (userRole === 'staff' || userRole === 'organizer') {
      baseRecommendations.push({
        id: `rule-staff-crowd-${zone.id}`,
        title: `Resource Deployment: ${zone.name}`,
        targetRole: userRole,
        category: 'crowd',
        urgency: 'high',
        message: `${zone.name} is congested. Average queue times are ${zone.queueLengthMin} minutes.`,
        actionableStep: 'Redeploy auxiliary stanchions and activate backup ticket scanner lanes.',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Transport delay triggers
  const delayedTransports = transports.filter(t => t.delayMinutes > 5 || t.status === 'full');
  for (const t of delayedTransports) {
    if (userRole === 'fan') {
      baseRecommendations.push({
        id: `rule-fan-transit-${t.parkingId}`,
        title: `Transit Delay: ${t.name}`,
        targetRole: 'fan',
        category: 'transport',
        urgency: 'medium',
        message: `${t.name} is filling up quickly and delays are currently ${t.delayMinutes} minutes.`,
        actionableStep: 'Board the Green Express Shuttle from Gate G instead for 3-minute transit times.',
        timestamp: new Date().toISOString()
      });
    } else if (userRole === 'organizer' || userRole === 'staff') {
      baseRecommendations.push({
        id: `rule-staff-transit-${t.parkingId}`,
        title: `Traffic Surge: ${t.name}`,
        targetRole: userRole,
        category: 'transport',
        urgency: 'medium',
        message: `${t.name} has exceeded capacity limits. Backlog is impacting Gate C ingress.`,
        actionableStep: 'Dispatch additional traffic control staff to Lot G and divert incoming parkers.',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Accessibility triggers
  if (accessibilityNeedsActive) {
    baseRecommendations.push({
      id: 'rule-acc-active',
      title: 'Step-Free Routing Activated',
      targetRole: 'fan',
      category: 'accessibility',
      urgency: 'low',
      message: 'Wheelchair elevators at North Entrance Lift Lobby 2 are fully operational.',
      actionableStep: 'Take Concourse Ramp 3 for step-free access straight to seat rows.',
      timestamp: new Date().toISOString()
    });
  }

  // Sustainability triggers
  const recyclingRate = sustainability.wasteGeneratedKg > 0 
    ? (sustainability.wasteRecycledKg / sustainability.wasteGeneratedKg) * 100 
    : 0;
  if (recyclingRate < 50 && (userRole === 'organizer' || userRole === 'staff')) {
    baseRecommendations.push({
      id: 'rule-sust-low-recycle',
      title: 'Action Required: Trash Diversion',
      targetRole: userRole,
      category: 'sustainability',
      urgency: 'medium',
      message: `Current recycling rate is at ${recyclingRate.toFixed(1)}%, failing to meet the FIFA 75% target.`,
      actionableStep: 'Deploy eco-volunteers with green sorting bins to Sector B concession stalls.',
      timestamp: new Date().toISOString()
    });
  }

  // Prompt Gemini API for enhanced context-aware recommendation synthesis if available
  try {
    const prompt = `
      You are the FIFA World Cup 2026 AI Command Center.
      Synthesize a set of 2 additional highly specific and smart recommendations for a "${userRole}" based on current stadium metrics.
      
      Metrics Context:
      - Stadium Zones: ${JSON.stringify(zones)}
      - Transport Systems: ${JSON.stringify(transports)}
      - Sustainability: Waste Recycling Rate: ${recyclingRate.toFixed(1)}%, Energy: ${sustainability.energyConsumptionKwh} kWh
      - Accessibility Mode Active: ${accessibilityNeedsActive}

      Your recommendations should be professional, actionable, safety-first, and aligned with FIFA World Cup 2026 guidelines.
      
      Respond STRICTLY in JSON format as a list of AIRecommendation objects matching this schema:
      [
        {
          "id": "ai-rec-[unique-string]",
          "title": "[Short action title]",
          "targetRole": "${userRole}",
          "category": "navigation" | "crowd" | "accessibility" | "transport" | "operations" | "sustainability",
          "urgency": "low" | "medium" | "high",
          "message": "[Short, informative description of the issue & scenario]",
          "actionableStep": "[Precise action the ${userRole} should take right now]",
          "timestamp": "${new Date().toISOString()}"
        }
      ]
    `;

    const responseText = await generateContentWithResilience(
      prompt,
      'You are a professional tournament management assistant. Output valid JSON array only.',
      true
    );

    if (responseText && responseText.trim() !== '{}' && responseText.trim() !== '') {
      const aiRecs: AIRecommendation[] = JSON.parse(responseText);
      if (Array.isArray(aiRecs)) {
        return [...baseRecommendations, ...aiRecs];
      }
    }
  } catch (err) {
    console.warn('AI Recommendation generation failed, proceeding with rule-based recommendations only:', err);
  }

  // Fallback fallback if no rules triggered or to ensure rich variety
  if (baseRecommendations.length === 0) {
    baseRecommendations.push(getFallbackRecommendation('navigation', userRole));
    baseRecommendations.push(getFallbackRecommendation('crowd', userRole));
  }

  return baseRecommendations;
}
