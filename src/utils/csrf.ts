/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let cachedCsrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (cachedCsrfToken) {
    return cachedCsrfToken;
  }

  try {
    const response = await fetch('/api/csrf-token');
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    const data = await response.json();
    cachedCsrfToken = data.csrfToken;
    return cachedCsrfToken;
  } catch (err) {
    console.error('CSRF token fetch error:', err);
    throw err;
  }
}

export function clearCsrfToken(): void {
  cachedCsrfToken = null;
}

export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const csrfToken = await getCsrfToken();
  const headers = new Headers(options.headers || {});
  headers.set('X-CSRF-Token', csrfToken);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 403) {
    clearCsrfToken();
  }

  return response;
}
