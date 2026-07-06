/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIRecommendation, NavigationRoute } from '../../types';

export function getFallbackRecommendation(category: string, role: string): AIRecommendation {
  const nowStr = new Date().toISOString();
  
  const recommendations: Record<string, Record<string, AIRecommendation>> = {
    navigation: {
      fan: {
        id: 'fb-nav-fan',
        title: 'Gate D Fast Track',
        targetRole: 'fan',
        category: 'navigation',
        urgency: 'medium',
        message: 'Main Gate A is currently experiencing high entry traffic. Proceed to Gate D which has minimal wait times.',
        actionableStep: 'Follow signage for South Perimeter walk to Gate D.',
        timestamp: nowStr,
      },
      volunteer: {
        id: 'fb-nav-vol',
        title: 'Redirect West Concourse Flow',
        targetRole: 'volunteer',
        category: 'navigation',
        urgency: 'high',
        message: 'Crowd density near West Food Court is slowing movement. Guide fans towards the wider Outer Promenade.',
        actionableStep: 'Deploy direction arrows and guide fans toward exit gates 10-12.',
        timestamp: nowStr,
      },
    },
    crowd: {
      organizer: {
        id: 'fb-crowd-org',
        title: 'Open Auxiliary Turnstiles',
        targetRole: 'organizer',
        category: 'crowd',
        urgency: 'high',
        message: 'Security checkpoints at Zone 4 are reaching 85% capacity limits.',
        actionableStep: 'Authorize opening of 4 auxiliary lanes at Gate B immediately.',
        timestamp: nowStr,
      },
      staff: {
        id: 'fb-crowd-staff',
        title: 'Queue Control at Restroom C',
        targetRole: 'staff',
        category: 'crowd',
        urgency: 'medium',
        message: 'Queue length at Sector C restroom has exceeded 12 minutes.',
        actionableStep: 'Reposition stanchions and activate alternative sector signs.',
        timestamp: nowStr,
      },
    },
    accessibility: {
      fan: {
        id: 'fb-acc-fan',
        title: 'Elevator Lobby Priority',
        targetRole: 'fan',
        category: 'accessibility',
        urgency: 'low',
        message: 'Wheelchair-accessible path via Ramp 2 is clear. Elevated lifts at Sector B are fully functional with zero wait.',
        actionableStep: 'Use Lobby 3 Elevator for direct suite level access.',
        timestamp: nowStr,
      },
    },
    sustainability: {
      organizer: {
        id: 'fb-sust-org',
        title: 'Optimize Waste Sorting Lanes',
        targetRole: 'organizer',
        category: 'sustainability',
        urgency: 'medium',
        message: 'Recycling diversion rates in West Plaza are below the 75% target due to high plastic bottle volume.',
        actionableStep: 'Deploy green-team volunteers to the main recycling stations near Gate D.',
        timestamp: nowStr,
      },
    },
  };

  const catRecs = recommendations[category] || recommendations['navigation'];
  const roleRec = catRecs[role] || Object.values(catRecs)[0];
  
  return roleRec || {
    id: `fb-generic-${Date.now()}`,
    title: 'Stadium Operations Alert',
    targetRole: (role as any) || 'fan',
    category: (category as any) || 'operations',
    urgency: 'low',
    message: 'Operations are proceeding normally. Maintain general security protocols.',
    actionableStep: 'Check visual command map for immediate updates.',
    timestamp: nowStr,
  };
}

export function getFallbackNavigation(source: string, destination: string, accessibility: boolean): NavigationRoute {
  return {
    source,
    destination,
    estimatedTimeMin: accessibility ? 12 : 8,
    distanceMeters: 450,
    routeSteps: accessibility
      ? [
          `Depart from ${source} heading toward Main Concourse Elevator Lobby A.`,
          'Take Elevator to Level 2 (Suite & Accessible walkway).',
          'Proceed along the anti-slip tactile pathway bypass to Sector 14.',
          `Arrive safely at ${destination} with step-free access.`
        ]
      : [
          `Depart from ${source} using the express pedestrian stairs.`,
          'Follow signs toward Mid-Level Concourse Gate B.',
          'Walk past the West Food Court to Sector 14.',
          `Arrive at ${destination}.`
        ],
    accessibilityFriendly: accessibility,
    crowdLevel: 'medium',
  };
}

export function getFallbackChatResponse(message: string, language: string = 'en'): string {
  const greetings: Record<string, string> = {
    en: 'Hello! Welcome to the FIFA World Cup 2026 Stadium Command Assistant. How can I help you navigate or manage your stadium experience today?',
    es: '¡Hola! Bienvenido al Asistente de Comando del Estadio de la Copa Mundial de la FIFA 2026. ¿Cómo puedo ayudarte hoy?',
    fr: 'Bonjour! Bienvenue dans l\'assistant de commandement du stade de la Coupe du Monde de la FIFA 2026. Comment puis-je vous aider aujourd\'hui?',
    pt: 'Olá! Bem-vindo ao Assistente de Comando do Estádio da Copa do Mundo da FIFA 2026. Como posso ajudar você hoje?',
    hi: 'नमस्ते! फीफा विश्व कप 2026 स्टेडियम कमांड असिस्टेंट में आपका स्वागत है। आज मैं आपकी कैसे मदद कर सकता हूँ?',
  };

  const lowercase = message.toLowerCase();
  
  if (lowercase.includes('gate') || lowercase.includes('entrada') || lowercase.includes('porte')) {
    if (language === 'es') return 'Las puertas principales abren 3 horas antes del partido. Te recomendamos usar la Puerta D si vienes en transporte público para evitar retrasos.';
    if (language === 'fr') return 'Les portes principales ouvrent 3 heures avant le match. Nous vous conseillons d\'utiliser la Porte D pour éviter les retards.';
    return 'Main Gates open 3 hours prior to kickoff. We highly recommend entering through Gate D if arriving via public transit, as it currently has the shortest queue times (under 5 minutes).';
  }

  if (lowercase.includes('toilet') || lowercase.includes('restroom') || lowercase.includes('baño') || lowercase.includes('toilette')) {
    return 'Premium restrooms are located behind Sectors 104, 122, and 205. Sector 122 restrooms feature fully enhanced accessible facilities and family-changing areas.';
  }

  if (lowercase.includes('metro') || lowercase.includes('train') || lowercase.includes('transport') || lowercase.includes('estacionamiento') || lowercase.includes('parking')) {
    return 'The Olympic Park Subway Station is a 5-minute walk from Gate G. Shuttles are operating every 3 minutes from Lot B directly to the accessible entrance lobby.';
  }

  return greetings[language] || greetings['en'];
}
