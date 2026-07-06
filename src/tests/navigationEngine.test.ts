import { describe, it, expect } from 'vitest';
import { getFallbackNavigation } from '../services/ai/fallbackStrategy';

describe('navigationEngine/fallback strategy tests', () => {
  it('tests routing step generation for regular mode', () => {
    const route = getFallbackNavigation('Gate A', 'Sector 14', false);
    
    expect(route.source).toBe('Gate A');
    expect(route.destination).toBe('Sector 14');
    expect(route.accessibilityFriendly).toBe(false);
    expect(route.estimatedTimeMin).toBe(8);
    expect(route.routeSteps).toContain('Depart from Gate A using the express pedestrian stairs.');
    expect(route.routeSteps).toContain('Arrive at Sector 14.');
  });

  it('tests routing step generation for wheelchair (accessible) mode', () => {
    const route = getFallbackNavigation('Gate A', 'Sector 14', true);
    
    expect(route.source).toBe('Gate A');
    expect(route.destination).toBe('Sector 14');
    expect(route.accessibilityFriendly).toBe(true);
    expect(route.estimatedTimeMin).toBe(12); // wheelchair time is different
    expect(route.routeSteps).toContain('Depart from Gate A heading toward Main Concourse Elevator Lobby A.');
    expect(route.routeSteps).toContain('Arrive safely at Sector 14 with step-free access.');
  });

  it('confirms appropriate distance and estimated times are produced', () => {
    const routeRegular = getFallbackNavigation('Gate A', 'Sector 14', false);
    const routeAccessible = getFallbackNavigation('Gate A', 'Sector 14', true);
    
    expect(routeRegular.distanceMeters).toBe(450);
    expect(routeAccessible.distanceMeters).toBe(450);
    expect(routeAccessible.estimatedTimeMin).toBeGreaterThan(routeRegular.estimatedTimeMin);
  });
});
