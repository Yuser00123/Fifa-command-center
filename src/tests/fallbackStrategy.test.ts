import { describe, it, expect } from 'vitest';
import { getFallbackChatResponse } from '../services/ai/fallbackStrategy';

describe('fallbackStrategy.ts logic tests', () => {
  it('returns default English response for general queries', () => {
    const result = getFallbackChatResponse('general stadium query', 'en');
    expect(result).toContain('Welcome to the FIFA World Cup 2026 Stadium Command Assistant');
    expect(result).toContain('How can I help you navigate or manage');
  });

  it('returns Spanish response for general queries when language is es', () => {
    const result = getFallbackChatResponse('general query', 'es');
    expect(result).toContain('Bienvenido al Asistente de Comando del Estadio de la Copa Mundial de la FIFA 2026');
  });

  it('returns French response for general queries when language is fr', () => {
    const result = getFallbackChatResponse('general query', 'fr');
    expect(result).toContain("Bienvenue dans l'assistant de commandement du stade de la Coupe du Monde de la FIFA 2026");
  });

  it('returns appropriate restroom info for restroom/toilet queries', () => {
    const resultEn = getFallbackChatResponse('where is the toilet?', 'en');
    expect(resultEn).toContain('Premium restrooms are located behind Sectors 104, 122, and 205');

    const resultEs = getFallbackChatResponse('donde estan los baños?', 'es');
    expect(resultEs).toContain('Premium restrooms are located behind Sectors 104, 122, and 205');

    const resultFr = getFallbackChatResponse('où sont les toilettes?', 'fr');
    expect(resultFr).toContain('Premium restrooms are located behind Sectors 104, 122, and 205');
  });

  it('returns transit/shuttle/metro info for transit-related queries', () => {
    const resultEn = getFallbackChatResponse('metro shuttle schedule', 'en');
    expect(resultEn).toContain('The Olympic Park Subway Station is a 5-minute walk from Gate G.');

    const resultEs = getFallbackChatResponse('horario del metro autobus', 'es');
    expect(resultEs).toContain('The Olympic Park Subway Station is a 5-minute walk from Gate G.');

    const resultFr = getFallbackChatResponse('shuttle bus train horaire', 'fr');
    expect(resultFr).toContain('The Olympic Park Subway Station is a 5-minute walk from Gate G.');
  });

  it('returns gate info for gate/entrada/porte queries', () => {
    const resultEs = getFallbackChatResponse('entrada al partido', 'es');
    expect(resultEs).toContain('Las puertas principales abren 3 horas antes del partido');

    const resultFr = getFallbackChatResponse('porte principale', 'fr');
    expect(resultFr).toContain('Les portes principales ouvrent 3 heures avant le match');

    const resultEn = getFallbackChatResponse('gate access', 'en');
    expect(resultEn).toContain('Main Gates open 3 hours prior to kickoff');
  });

  it('reverts to English for unsupported languages', () => {
    // Unsupported language 'ja'
    const result = getFallbackChatResponse('hello', 'ja' as any);
    expect(result).toContain('Welcome to the FIFA World Cup 2026 Stadium Command Assistant');
  });
});
