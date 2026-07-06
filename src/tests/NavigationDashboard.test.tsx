import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import NavigationDashboard from '../components/NavigationDashboard';

const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('NavigationDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('renders and verifies selection updates', () => {
    const setAccessibilityActive = vi.fn();
    render(
      <NavigationDashboard
        accessibilityActive={false}
        setAccessibilityActive={setAccessibilityActive}
      />
    );

    // Verify select elements are present
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(2);

    const sourceSelect = selects[0] as HTMLSelectElement;
    const destSelect = selects[1] as HTMLSelectElement;

    // Simulate change
    fireEvent.change(sourceSelect, { target: { value: 'Main Entrance Gate B' } });
    expect(sourceSelect.value).toBe('Main Entrance Gate B');

    fireEvent.change(destSelect, { target: { value: 'Medical Station Beta (East)' } });
    expect(destSelect.value).toBe('Medical Station Beta (East)');
  });

  it('verifies shortcut button selections and triggers route fetch', async () => {
    const setAccessibilityActive = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        source: 'Gate A - North Concourse',
        destination: 'Medical Station Alpha (West)',
        estimatedTimeMin: 12,
        distanceMeters: 450,
        routeSteps: ['Step 1', 'Step 2'],
        accessibilityFriendly: false,
        crowdLevel: 'medium',
      }),
    });

    render(
      <NavigationDashboard
        accessibilityActive={false}
        setAccessibilityActive={setAccessibilityActive}
      />
    );

    const medicalShortcut = screen.getByText('Medical Stalls');
    fireEvent.click(medicalShortcut);

    // Should fetch the route automatically
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const bodyParsed = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(bodyParsed.destination).toBe('Medical Station Alpha (West)');
  });

  it('verifies all other shortcut filters', async () => {
    const setAccessibilityActive = vi.fn();
    mockFetch.mockResolvedValue({
      ok: true,
      headers: {
        get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        source: 'Gate A - North Concourse',
        destination: 'Main Accessibility Lift Lobby 3',
        estimatedTimeMin: 12,
        distanceMeters: 450,
        routeSteps: ['Take lift'],
        accessibilityFriendly: true,
        crowdLevel: 'low',
      }),
    });

    render(
      <NavigationDashboard
        accessibilityActive={false}
        setAccessibilityActive={setAccessibilityActive}
      />
    );

    // Food shortcut
    const foodShortcut = screen.getByText('Food Courts');
    fireEvent.click(foodShortcut);
    expect(mockFetch).toHaveBeenCalled();
    expect(JSON.parse(mockFetch.mock.calls[0][1].body).destination).toBe('Food Court West Plaza');

    // Lift shortcut (activates accessibility)
    const liftShortcut = screen.getByText('Elevator Lift');
    fireEvent.click(liftShortcut);
    expect(setAccessibilityActive).toHaveBeenCalledWith(true);

    // Seat shortcut
    const seatShortcut = screen.getByText('Find Seat Gate');
    fireEvent.click(seatShortcut);
    expect(JSON.parse(mockFetch.mock.calls[2][1].body).destination).toBe('Sector 122 Standard Seating');
  });

  it('handles route retrieval failures cleanly', async () => {
    const setAccessibilityActive = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => 'application/json' },
      json: async () => ({ error: 'Database down' }),
    });

    render(
      <NavigationDashboard
        accessibilityActive={false}
        setAccessibilityActive={setAccessibilityActive}
      />
    );

    const generateBtn = screen.getByText('Generate Congestion-Aware Route');
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Could not calculate route/)).toBeInTheDocument();
    });
  });

  it('toggles accessibility mode active when checkbox is clicked', () => {
    const setAccessibilityActive = vi.fn();
    render(
      <NavigationDashboard
        accessibilityActive={false}
        setAccessibilityActive={setAccessibilityActive}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(setAccessibilityActive).toHaveBeenCalledWith(true);
  });

  it('verifies loader spinners and success output path display', async () => {
    const setAccessibilityActive = vi.fn();
    
    // Controlled delay promise to test loading spinner
    let resolvePromise: any;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockImplementationOnce(() => fetchPromise);

    render(
      <NavigationDashboard
        accessibilityActive={false}
        setAccessibilityActive={setAccessibilityActive}
      />
    );

    const generateBtn = screen.getByText('Generate Congestion-Aware Route');
    fireEvent.click(generateBtn);

    // Expect loading state to be shown
    expect(screen.getByText('Sequencing Route...')).toBeInTheDocument();
    expect(screen.getByText('Synthesizing Smart Directions')).toBeInTheDocument();

    // Resolve the fetch call
    resolvePromise({
      ok: true,
      headers: {
        get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        source: 'Gate A - North Concourse',
        destination: 'Sector 14 - Family Seating',
        estimatedTimeMin: 10,
        distanceMeters: 350,
        routeSteps: ['Go straight', 'Turn left'],
        accessibilityFriendly: false,
        crowdLevel: 'low',
      }),
    });

    await waitFor(() => {
      expect(screen.queryByText('Sequencing Route...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Route Mapping:')).toBeInTheDocument();
    expect(screen.getByText('Go straight')).toBeInTheDocument();
    expect(screen.getByText('Turn left')).toBeInTheDocument();
  });
});
