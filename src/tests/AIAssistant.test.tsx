import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import AIAssistant from '../components/AIAssistant';

const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('AIAssistant Chatbot Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('renders correctly, accepts input, and triggers fetch with correct parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({ text: 'To find your seat in Sector 122, enter via Gate D.' }),
    });

    render(<AIAssistant />);

    // Verify welcome message is shown
    expect(screen.getByText(/FIFA 2026 AI Command Assistant/)).toBeInTheDocument();

    // Fill out input
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'How do I find Sector 122?' } });
    expect(input.value).toBe('How do I find Sector 122?');

    // Press Send
    const sendBtn = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendBtn);

    // Verify it sent
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toMatchObject({
      message: 'How do I find Sector 122?',
      language: 'en',
    });

    // Wait for the mock reply to show up
    await waitFor(() => {
      expect(screen.getByText('To find your seat in Sector 122, enter via Gate D.')).toBeInTheDocument();
    });
  });

  it('handles language switches, triggers system switch message, and updates preset questions', async () => {
    render(<AIAssistant />);

    // Locate language combobox
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'es' } });

    // Expect system language updated message in Spanish
    expect(screen.getByText(/Idioma del sistema cambiado a Español/)).toBeInTheDocument();

    // Expect presets to change to Spanish
    expect(screen.getByText('¿Cómo encuentro mi asiento en el Sector 122?')).toBeInTheDocument();
  });

  it('handles API errors gracefully and returns language-specific fallback messages', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => 'application/json' },
      json: async () => ({ error: 'Error' }),
    });

    render(<AIAssistant />);

    // Type and Send a message
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Is there a restroom?' } });
    const sendBtn = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendBtn);

    // Should render the fallback reply
    await waitFor(() => {
      expect(screen.getByText(/I'm having trouble connecting to my central server/)).toBeInTheDocument();
    });
  });

  it('sends message when clicking a preset question shortcut button', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({ text: 'Sector 122 response' }),
    });

    render(<AIAssistant />);

    // Find and click preset button "How do I find my seat in Sector 122?"
    const presetBtn = screen.getByText('How do I find my seat in Sector 122?');
    fireEvent.click(presetBtn);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(mockFetch.mock.calls[0][1].body).message).toBe('How do I find my seat in Sector 122?');

    await waitFor(() => {
      expect(screen.getByText('Sector 122 response')).toBeInTheDocument();
    });
  });
});
