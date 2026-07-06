import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateContentWithResilience } from '../services/ai/aiProvider';

const mockGenerateContent = vi.fn();

vi.mock('../services/ai/geminiClient', () => {
  return {
    getGeminiClient: () => ({
      models: {
        generateContent: (...args: any[]) => mockGenerateContent(...args),
      },
    }),
  };
});

describe('aiProvider.ts resilience cascade tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateContent.mockReset();
  });

  it('verifies that gemini-2.5-flash is queried first', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: 'Flash response' });
    
    const result = await generateContentWithResilience('Hello');
    expect(result).toBe('Flash response');
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent.mock.calls[0][0]).toMatchObject({
      model: 'gemini-2.5-flash',
      contents: 'Hello',
    });
  });

  it('simulates a 429 quota failure on Flash and verifies seamless rollover to gemini-2.5-pro', async () => {
    // First call (Flash) fails with 429
    mockGenerateContent.mockRejectedValueOnce(new Error('Quota exceeded 429'));
    // Second call (Pro) succeeds
    mockGenerateContent.mockResolvedValueOnce({ text: 'Pro response' });

    const result = await generateContentWithResilience('Hello');
    expect(result).toBe('Pro response');
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    expect(mockGenerateContent.mock.calls[0][0].model).toBe('gemini-2.5-flash');
    expect(mockGenerateContent.mock.calls[1][0].model).toBe('gemini-2.5-pro');
  });

  it('simulates complete API failure and verifies responsive template return from fallbackStrategy.ts', async () => {
    // Both fail
    mockGenerateContent.mockRejectedValue(new Error('Internal server error'));

    const result = await generateContentWithResilience('metro ticket');
    // For 'metro ticket', getFallbackChatResponse should return transport-related info
    expect(result).toContain('The Olympic Park Subway Station is a 5-minute walk from Gate G.');
  });

  it('passes systemInstruction and jsonMode config parameters to the SDK client correctly', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: '{"response": "ok"}' });

    const result = await generateContentWithResilience('Give JSON', 'Always be concise', true);
    expect(result).toBe('{"response": "ok"}');
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent.mock.calls[0][0].config).toMatchObject({
      systemInstruction: 'Always be concise',
      responseMimeType: 'application/json',
    });
  });

  it('returns an empty JSON string fallback if all models fail while jsonMode is true', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Down'));

    const result = await generateContentWithResilience('Give JSON', 'Rules', true);
    expect(result).toBe('{}');
  });
});
