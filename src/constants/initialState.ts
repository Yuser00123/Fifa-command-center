/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StadiumZone, TransportStatus, SustainabilityMetrics } from '../types';

export const INITIAL_ZONES: StadiumZone[] = [
  {
    id: 'zone-north',
    name: 'North Entrance (Gate A & B)',
    crowdDensity: 'high',
    occupancyPercentage: 82,
    gateStatus: 'congested',
    queueLengthMin: 18,
  },
  {
    id: 'zone-east',
    name: 'East Promenade (Gate C)',
    crowdDensity: 'medium',
    occupancyPercentage: 55,
    gateStatus: 'open',
    queueLengthMin: 8,
  },
  {
    id: 'zone-south',
    name: 'South Concourse (Gate D & E)',
    crowdDensity: 'low',
    occupancyPercentage: 35,
    gateStatus: 'open',
    queueLengthMin: 4,
  },
  {
    id: 'zone-west',
    name: 'West Concourse (Gate F & G)',
    crowdDensity: 'critical',
    occupancyPercentage: 94,
    gateStatus: 'congested',
    queueLengthMin: 28,
  },
  {
    id: 'zone-food-west',
    name: 'Food Court West & Sector 104',
    crowdDensity: 'high',
    occupancyPercentage: 88,
    gateStatus: 'open',
    queueLengthMin: 15,
  },
  {
    id: 'zone-food-east',
    name: 'Food Court East & Sector 122',
    crowdDensity: 'low',
    occupancyPercentage: 40,
    gateStatus: 'open',
    queueLengthMin: 5,
  },
];

export const INITIAL_TRANSPORTS: TransportStatus[] = [
  {
    parkingId: 'lot-a',
    name: 'North VIP Lot A',
    capacity: 500,
    availableSpaces: 12,
    status: 'full',
    shuttleFrequencyMin: 5,
    delayMinutes: 15,
  },
  {
    parkingId: 'lot-b',
    name: 'General Public Lot B',
    capacity: 2500,
    availableSpaces: 340,
    status: 'filling_fast',
    shuttleFrequencyMin: 3,
    delayMinutes: 6,
  },
  {
    parkingId: 'lot-c',
    name: 'West Express Lot C',
    capacity: 1200,
    availableSpaces: 710,
    status: 'available',
    shuttleFrequencyMin: 4,
    delayMinutes: 0,
  },
  {
    parkingId: 'transit-metro',
    name: 'Olympic Park Metro Station',
    capacity: 15000,
    availableSpaces: 9000, // capacity indicator for trains
    status: 'available',
    shuttleFrequencyMin: 2,
    delayMinutes: 2,
  },
];

export const INITIAL_SUSTAINABILITY: SustainabilityMetrics = {
  wasteGeneratedKg: 4250,
  wasteRecycledKg: 2850, // approx 67%
  energyConsumptionKwh: 12450,
  renewableEnergyPercentage: 42,
  transitEmissionsCo2Kg: 850,
};

export const NAVIGATION_LOCATIONS = [
  'Main Entrance Gate A',
  'Main Entrance Gate B',
  'East Plaza Gate C',
  'South Entrance Gate D',
  'South Entrance Gate E',
  'West Gate F',
  'West Gate G',
  'Sector 104 Suite Seating',
  'Sector 122 Standard Seating',
  'Sector 205 Elevated Seating',
  'Food Court West Plaza',
  'Food Court East Plaza',
  'Medical Station Alpha (West)',
  'Medical Station Beta (East)',
  'Main Accessibility Lift Lobby 3',
];
