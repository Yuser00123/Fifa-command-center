import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TransportationDashboard from '../components/TransportationDashboard';
import { TransportStatus } from '../types';

// Mock the generateContentWithResilience function
vi.mock('../services/ai/aiProvider', () => {
  return {
    generateContentWithResilience: vi.fn().mockResolvedValue('Take the subway to Olympic Park. Avoid Lot A.'),
  };
});

describe('TransportationDashboard Component', () => {
  const initialTransports: TransportStatus[] = [
    {
      parkingId: 'lot-a',
      name: 'North Lot A (VIP)',
      capacity: 1200,
      availableSpaces: 400,
      status: 'filling_fast',
      delayMinutes: 5,
      shuttleFrequencyMin: 10,
    },
    {
      parkingId: 'lot-b',
      name: 'South Lot B',
      capacity: 3000,
      availableSpaces: 2800,
      status: 'available',
      delayMinutes: 0,
      shuttleFrequencyMin: 15,
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and lists transport options with current status and delays', () => {
    const setTransports = vi.fn();
    render(
      <TransportationDashboard
        transports={initialTransports}
        setTransports={setTransports}
        userRole="fan"
      />
    );

    expect(screen.getByText('North Lot A (VIP)')).toBeInTheDocument();
    expect(screen.getByText('South Lot B')).toBeInTheDocument();
    expect(screen.getByText('5m delay')).toBeInTheDocument();
    expect(screen.getByText('No Delays')).toBeInTheDocument();
  });

  it('allows staff or organizers to trigger simulated delays and change parking status', () => {
    const setTransports = vi.fn();
    render(
      <TransportationDashboard
        transports={initialTransports}
        setTransports={setTransports}
        userRole="staff"
      />
    );

    // Locate simulation triggers (there should be three for each lot: Clear, 10 min, 25 min)
    const clearButtons = screen.getAllByText('Clear');
    expect(clearButtons.length).toBe(2);

    // Click 25 min for North Lot A
    const delayButtons = screen.getAllByText('25 min');
    fireEvent.click(delayButtons[0]);

    expect(setTransports).toHaveBeenCalledTimes(1);

    // Call with the actual updater function to check functional state updates
    const updater = setTransports.mock.calls[0][0];
    const updated = updater(initialTransports);
    expect(updated[0].delayMinutes).toBe(25);
    expect(updated[0].status).toBe('full');

    // Click Clear (0 delay)
    const clearBtns = screen.getAllByText('Clear');
    fireEvent.click(clearBtns[1]);
    const clearUpdater = setTransports.mock.calls[1][0];
    const cleared = clearUpdater(initialTransports);
    expect(cleared[1].delayMinutes).toBe(0);
    expect(cleared[1].status).toBe('available');

    // Click 10 min
    const mediumButtons = screen.getAllByText('10 min');
    fireEvent.click(mediumButtons[0]);
    const medUpdater = setTransports.mock.calls[2][0];
    const medStatus = medUpdater(initialTransports);
    expect(medStatus[0].delayMinutes).toBe(10);
    expect(medStatus[0].status).toBe('filling_fast');
  });

  it('generates personalized AI route advice successfully and handles arrival journey type toggles', async () => {
    const setTransports = vi.fn();
    const { generateContentWithResilience } = await import('../services/ai/aiProvider');

    render(
      <TransportationDashboard
        transports={initialTransports}
        setTransports={setTransports}
        userRole="fan"
      />
    );

    // Click Arrival to Stadium (default is arrival, click again or click departure then arrival)
    const departureButton = screen.getByText('Stadium Departure');
    fireEvent.click(departureButton);
    const arrivalButton = screen.getByText('Arrival to Stadium');
    fireEvent.click(arrivalButton);

    // Choose 'Bus Shuttle'
    const shuttleButton = screen.getByText('Bus Shuttle');
    fireEvent.click(shuttleButton);

    // Generate
    const generateBtn = screen.getByText('Generate AI Routing Advice');
    fireEvent.click(generateBtn);

    expect(screen.getByText('Consulting real-time parking spaces and traffic channels...')).toBeInTheDocument();

    await waitFor(() => {
      expect(generateContentWithResilience).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('Take the subway to Olympic Park. Avoid Lot A.')).toBeInTheDocument();
  });
});
