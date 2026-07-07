/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const SESSION_KEY = 'api_key_session';

export function getApiKey(): string | null {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    const { key, expires } = JSON.parse(stored);
    if (Date.now() > expires) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return key;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}
