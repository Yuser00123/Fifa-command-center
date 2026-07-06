import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ApiKeyOverlay from '../components/ApiKeyOverlay';

describe('ApiKeyOverlay Component', () => {
  it('renders title and input field', () => {
    const onKeySubmitted = vi.fn();
    render(<ApiKeyOverlay onKeySubmitted={onKeySubmitted} />);

    expect(screen.getByText('Access Verification Gate')).toBeInTheDocument();
    expect(screen.getByText('Enter Gemini API Key')).toBeInTheDocument();
  });

  it('validates empty key on submit', () => {
    const onKeySubmitted = vi.fn();
    render(<ApiKeyOverlay onKeySubmitted={onKeySubmitted} />);

    const button = screen.getByText('Authenticate & Access');
    fireEvent.click(button);

    expect(screen.getByText('Please enter a valid Gemini API Key.')).toBeInTheDocument();
    expect(onKeySubmitted).not.toHaveBeenCalled();
  });

  it('validates starting prefix "AIzaSy" or "AQ"', () => {
    const onKeySubmitted = vi.fn();
    render(<ApiKeyOverlay onKeySubmitted={onKeySubmitted} />);

    const input = screen.getByPlaceholderText('AIzaSy... or AQ.Ab...');
    fireEvent.change(input, { target: { value: 'invalid_prefix_key' } });

    const button = screen.getByText('Authenticate & Access');
    fireEvent.click(button);

    expect(screen.getByText(/Invalid API Key format/)).toBeInTheDocument();
    expect(onKeySubmitted).not.toHaveBeenCalled();
  });

  it('validates key length is not too short', () => {
    const onKeySubmitted = vi.fn();
    render(<ApiKeyOverlay onKeySubmitted={onKeySubmitted} />);

    const input = screen.getByPlaceholderText('AIzaSy... or AQ.Ab...');
    fireEvent.change(input, { target: { value: 'AIzaSy_short' } });

    const button = screen.getByText('Authenticate & Access');
    fireEvent.click(button);

    expect(screen.getByText(/API Key you entered seems too short/)).toBeInTheDocument();
    expect(onKeySubmitted).not.toHaveBeenCalled();
  });

  it('toggles input visibility when eye icon is clicked', () => {
    render(<ApiKeyOverlay onKeySubmitted={vi.fn()} />);

    const input = screen.getByPlaceholderText('AIzaSy... or AQ.Ab...') as HTMLInputElement;
    expect(input.type).toBe('password');

    // Click the eye toggle
    const toggleButton = screen.getByTitle('Show key');
    fireEvent.click(toggleButton);
    expect(input.type).toBe('text');

    // Click again to turn back to password
    const hideButton = screen.getByTitle('Hide key');
    fireEvent.click(hideButton);
    expect(input.type).toBe('password');
  });

  it('submits key successfully when input is valid with AIzaSy or AQ prefix', () => {
    const onKeySubmitted = vi.fn();
    const { unmount } = render(<ApiKeyOverlay onKeySubmitted={onKeySubmitted} />);

    let input = screen.getByPlaceholderText('AIzaSy... or AQ.Ab...');
    const validAIzaKey = 'AIzaSyThisIsAValidLengthAndFormatOfAGeminiKey';
    fireEvent.change(input, { target: { value: validAIzaKey } });

    let button = screen.getByText('Authenticate & Access');
    fireEvent.click(button);

    expect(onKeySubmitted).toHaveBeenCalledWith(validAIzaKey);
    onKeySubmitted.mockClear();
    unmount();

    // Now test starting with AQ
    const onKeySubmitted2 = vi.fn();
    render(<ApiKeyOverlay onKeySubmitted={onKeySubmitted2} />);
    input = screen.getByPlaceholderText('AIzaSy... or AQ.Ab...');
    const validAQKey = 'AQ.Ab_ThisIsAValidLengthAndFormatOfAGeminiKeyWithAQ';
    fireEvent.change(input, { target: { value: validAQKey } });

    button = screen.getByText('Authenticate & Access');
    fireEvent.click(button);

    expect(onKeySubmitted2).toHaveBeenCalledWith(validAQKey);
  });
});
