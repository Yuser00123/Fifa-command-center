/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'fan' | 'volunteer' | 'staff' | 'organizer';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  language?: string;
}

export interface StadiumZone {
  id: string;
  name: string;
  crowdDensity: 'low' | 'medium' | 'high' | 'critical';
  occupancyPercentage: number;
  gateStatus: 'open' | 'congested' | 'closed';
  queueLengthMin: number;
}

export interface IncidentReport {
  id: string;
  zoneId: string;
  category: 'medical' | 'security' | 'facility' | 'crowd' | 'accessibility';
  severity: 'low' | 'medium' | 'high';
  description: string;
  status: 'reported' | 'responding' | 'resolved';
  reportedAt: string;
  assignedStaffId?: string;
}

export interface TransportStatus {
  parkingId: string;
  name: string;
  capacity: number;
  availableSpaces: number;
  status: 'available' | 'filling_fast' | 'full';
  shuttleFrequencyMin: number;
  delayMinutes: number;
}

export interface SustainabilityMetrics {
  wasteGeneratedKg: number;
  wasteRecycledKg: number;
  energyConsumptionKwh: number;
  renewableEnergyPercentage: number;
  transitEmissionsCo2Kg: number;
}

export interface AIRecommendation {
  id: string;
  title: string;
  targetRole: UserRole;
  category: 'navigation' | 'crowd' | 'accessibility' | 'transport' | 'operations' | 'sustainability';
  urgency: 'low' | 'medium' | 'high';
  message: string;
  actionableStep: string;
  timestamp: string;
}

export interface NavigationRoute {
  source: string;
  destination: string;
  estimatedTimeMin: number;
  distanceMeters: number;
  routeSteps: string[];
  accessibilityFriendly: boolean;
  crowdLevel: 'low' | 'medium' | 'high';
}
