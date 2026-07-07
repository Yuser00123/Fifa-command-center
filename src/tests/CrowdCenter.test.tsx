import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import CrowdCenter from '../components/CrowdCenter';
import { StadiumZone, IncidentReport } from '../types';

const mockFetch = vi.fn();
global.fetch = mockFetch as any;

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

const sampleIncidents: IncidentReport[] = [
  {
    id: 'inc-101',
    zoneId: 'zone-north',
    category: 'crowd',
    severity: 'high',
    description: 'Congestion at cluster 4.',
    status: 'reported',
    reportedAt: '2026-07-06T15:36:34.636Z',
  },
];

describe('CrowdCenter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('renders correctly and submits a new incident report log successfully', async () => {
    const setZones = vi.fn();
    const fetchIncidents = vi.fn();
    const updateIncidentStatus = vi.fn().mockResolvedValue(true);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'inc-new-123' }),
    });

    render(
      <CrowdCenter
        zones={sampleZones}
        setZones={setZones}
        incidents={sampleIncidents}
        fetchIncidents={fetchIncidents}
        updateIncidentStatus={updateIncidentStatus}
        userRole="organizer"
      />
    );

    // Enter a description
    const textarea = screen.getByPlaceholderText('Leaking faucet or long queues? Enter details...');
    fireEvent.change(textarea, { target: { value: 'Elevator power supply fluctuates near Lobby A.' } });

    // Submit form
    const submitBtn = screen.getByText('Submit Log to Command Room');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const fetchArgs = mockFetch.mock.calls[0];
    expect(fetchArgs[0]).toBe('/api/incidents');
    expect(JSON.parse(fetchArgs[1].body)).toMatchObject({
      description: 'Elevator power supply fluctuates near Lobby A.',
      severity: 'medium',
      zoneId: 'zone-north',
    });

    expect(fetchIncidents).toHaveBeenCalled();
  });

  it('allows staff or organizer to update status and deploy responders', async () => {
    const setZones = vi.fn();
    const fetchIncidents = vi.fn();
    const updateIncidentStatus = vi.fn().mockResolvedValue(true);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'responding' }),
    });

    render(
      <CrowdCenter
        zones={sampleZones}
        setZones={setZones}
        incidents={sampleIncidents}
        fetchIncidents={fetchIncidents}
        updateIncidentStatus={updateIncidentStatus}
        userRole="staff"
      />
    );

    // Locate "Acknowledge & Deploy" button on the incident card
    const deployBtn = screen.getByText('Acknowledge & Deploy');
    fireEvent.click(deployBtn);

    await waitFor(() => {
      expect(updateIncidentStatus).toHaveBeenCalledWith('inc-101', 'responding');
    });
  });

  it('allows staff or organizers to resolve an incident that is currently responding', async () => {
    const setZones = vi.fn();
    const fetchIncidents = vi.fn();
    const updateIncidentStatus = vi.fn().mockResolvedValue(true);

    const respondingIncidents: IncidentReport[] = [
      {
        id: 'inc-102',
        zoneId: 'zone-north',
        category: 'medical',
        severity: 'high',
        description: 'First aid dispatch.',
        status: 'responding',
        reportedAt: '2026-07-06T15:36:34.636Z',
      },
    ];

    render(
      <CrowdCenter
        zones={sampleZones}
        setZones={setZones}
        incidents={respondingIncidents}
        fetchIncidents={fetchIncidents}
        updateIncidentStatus={updateIncidentStatus}
        userRole="organizer"
      />
    );

    const resolveBtn = screen.getByText('Resolve Log');
    fireEvent.click(resolveBtn);

    await waitFor(() => {
      expect(updateIncidentStatus).toHaveBeenCalledWith('inc-102', 'resolved');
    });
  });

  it('renders simulator buttons for organizers and updates zone density successfully', () => {
    const setZones = vi.fn();
    const updateIncidentStatus = vi.fn().mockResolvedValue(true);
    render(
      <CrowdCenter
        zones={sampleZones}
        setZones={setZones}
        incidents={[]}
        fetchIncidents={vi.fn()}
        updateIncidentStatus={updateIncidentStatus}
        userRole="organizer"
      />
    );

    // Locate density buttons "L", "M", "H", "C"
    const lowBtn = screen.getByTitle('Simulate low density');
    fireEvent.click(lowBtn);

    expect(setZones).toHaveBeenCalledTimes(1);
    const updater = setZones.mock.calls[0][0];
    const updated = updater(sampleZones);
    expect(updated[0].crowdDensity).toBe('low');
    expect(updated[0].occupancyPercentage).toBeLessThanOrEqual(35);

    // Simulate medium
    const medBtn = screen.getByTitle('Simulate medium density');
    fireEvent.click(medBtn);
    const medUpdater = setZones.mock.calls[1][0];
    const medUpdated = medUpdater(sampleZones);
    expect(medUpdated[0].crowdDensity).toBe('medium');

    // Simulate high
    const highBtn = screen.getByTitle('Simulate high density');
    fireEvent.click(highBtn);
    const highUpdater = setZones.mock.calls[2][0];
    const highUpdated = highUpdater(sampleZones);
    expect(highUpdated[0].crowdDensity).toBe('high');

    // Simulate critical
    const critBtn = screen.getByTitle('Simulate critical density');
    fireEvent.click(critBtn);
    const critUpdater = setZones.mock.calls[3][0];
    const critUpdated = critUpdater(sampleZones);
    expect(critUpdated[0].crowdDensity).toBe('critical');
  });

  it('hides all simulation tools when the active role is fan', () => {
    render(
      <CrowdCenter
        zones={sampleZones}
        setZones={vi.fn()}
        incidents={[]}
        fetchIncidents={vi.fn()}
        updateIncidentStatus={vi.fn().mockResolvedValue(true)}
        userRole="fan"
      />
    );

    expect(screen.queryByTitle('Simulate low density')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Simulate critical density')).not.toBeInTheDocument();
  });
});
