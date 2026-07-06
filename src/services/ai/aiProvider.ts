/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getGeminiClient } from './geminiClient';
import { getFallbackChatResponse } from './fallbackStrategy';

const MODEL_PRIORITY = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
];

export async function generateContentWithResilience(
  prompt: string,
  systemInstruction?: string,
  jsonMode: boolean = false,
  customApiKey?: string
): Promise<string> {
  let lastError: Error | null = null;

  for (const modelName of MODEL_PRIORITY) {
    try {
      const ai = getGeminiClient(customApiKey);
      
      const config: { temperature: number; systemInstruction?: string; responseMimeType?: string } = {
        temperature: 0.2,
      };

      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      if (jsonMode) {
        config.responseMimeType = 'application/json';
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`Model ${modelName} failed. Error: ${errorMsg}`);
      lastError = err instanceof Error ? err : new Error(errorMsg);
      // Continue to next model
    }
  }

  // If all models failed or GEMINI_API_KEY is not set
  console.error('All Gemini AI models failed or API Key is missing. Invoking fallback strategy.', lastError);
  
  if (jsonMode) {
    // Return empty fallback JSON structure to prevent parser crashes
    return '{}';
  }

  return getFallbackChatResponse(prompt);
}
