/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

export function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  return new GoogleGenAI({ apiKey });
}
