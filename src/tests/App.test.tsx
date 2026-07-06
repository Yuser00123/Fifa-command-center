import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';

const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('App Component Integrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    localStorage.clear();

    // Mock incident API response
    mockFetch.mockResolvedValue({
      ok: true,
      headers: {
        get: (name: string) => name.toLowerCase() === 'content-type' ? 'application/json' : null,
      },
      json: async () => [
        {
          id: 'inc-1',
          zoneId: 'zone-north',
          category: 'crowd',
          severity: 'high',
          description: 'Long queues at North Gate.',
          status: 'reported',
          reportedAt: '2026-07-06T12:00:00.000Z',
        }
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders ApiKeyOverlay if no api key exists in localStorage', () => {
    render(<App />);
    expect(screen.getByText('Access Verification Gate')).toBeInTheDocument();
  });

  it('bypasses ApiKeyOverlay and renders dashboard if api key exists in localStorage', async () => {
    localStorage.setItem('user_gemini_api_key', 'AIzaSy_MockedKeyOfExcellentLength');
    render(<App />);

    expect(screen.queryByText('Access Verification Gate')).not.toBeInTheDocument();
    expect(screen.getByText('FIFA COMMAND CENTER AI')).toBeInTheDocument();
  });

  it('allows user to input key and access, then click Reset API Key', async () => {
    render(<App />);

    // Capture modal submission
    const input = screen.getByPlaceholderText('AIzaSy... or AQ.Ab...');
    fireEvent.change(input, { target: { value: 'AIzaSy_MockedKeyOfExcellentLength' } });

    const submitBtn = screen.getByText('Authenticate & Access');
    fireEvent.click(submitBtn);

    // Verify overlay closes and main dashboard is rendered
    expect(screen.queryByText('Access Verification Gate')).not.toBeInTheDocument();
    expect(screen.getByText('FIFA COMMAND CENTER AI')).toBeInTheDocument();

    // Reset key
    const resetBtn = screen.getByText('Reset API Key');
    fireEvent.click(resetBtn);

    // Overlay should be back
    expect(screen.getByText('Access Verification Gate')).toBeInTheDocument();
  });

  it('allows switching between roles', async () => {
    localStorage.setItem('user_gemini_api_key', 'AIzaSy_MockedKeyOfExcellentLength');
    render(<App />);

    // Volunteer
    const volBtn = screen.getByRole('button', { name: 'volunteer' });
    fireEvent.click(volBtn);
    expect(volBtn.className).toContain('bg-gradient-to-r');

    // Staff
    const staffBtn = screen.getByRole('button', { name: 'staff' });
    fireEvent.click(staffBtn);
    expect(staffBtn.className).toContain('bg-gradient-to-r');
  });

  it('allows switching between modules / tabs', async () => {
    localStorage.setItem('user_gemini_api_key', 'AIzaSy_MockedKeyOfExcellentLength');
    render(<App />);

    // Wait for the async initial incidents fetch to load and settle
    await screen.findByText('Long queues at North Gate.');

    // Click 'Smart Wayfinding' tab
    const wayfindingTab = screen.getByText('Smart Wayfinding');
    fireEvent.click(wayfindingTab);

    // Verify Navigation Dashboard container is shown
    expect(screen.getByText(/Intelligent Stadium Wayfinding/i)).toBeInTheDocument();

    // Click 'Transit & Parking'
    const transitTab = screen.getByText('Transit & Parking');
    fireEvent.click(transitTab);
    expect(screen.getByText(/Stadium Transport Status/i)).toBeInTheDocument();

    // Click 'Sustainability'
    const sustainabilityTab = screen.getByText('Sustainability');
    fireEvent.click(sustainabilityTab);
    expect(screen.getByText(/Sustainability Insights/i)).toBeInTheDocument();
  });

  it('polls the /api/incidents endpoint periodically', async () => {
    vi.useFakeTimers();
    localStorage.setItem('user_gemini_api_key', 'AIzaSy_MockedKeyOfExcellentLength');
    
    render(<App />);
    const initialCalls = mockFetch.mock.calls.length;

    // Fast-forward interval
    vi.advanceTimersByTime(10000);
    expect(mockFetch.mock.calls.length).toBe(initialCalls + 1);
  });
});
