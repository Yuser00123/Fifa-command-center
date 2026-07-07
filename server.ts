/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import { generateContentWithResilience } from './src/services/ai/aiProvider';
import { generateRecommendations } from './src/services/recommendations/recommendationEngine';
import { getFallbackNavigation } from './src/services/ai/fallbackStrategy';
import { IncidentReport } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// CSRF Token Generation and Verification
const csrfTokens = new Map<string, { token: string; expires: number }>();

function generateCsrfToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 3600000; // 1 hour expiry
  csrfTokens.set(token, { token, expires });
  return token;
}

function validateCsrfToken(token: string): boolean {
  const stored = csrfTokens.get(token);
  if (!stored) return false;
  if (Date.now() > stored.expires) {
    csrfTokens.delete(token);
    return false;
  }
  return true;
}

// In-memory Rate Limiting
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const limit = rateLimits.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetTime: limit.resetTime };
  }

  limit.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - limit.count, resetTime: limit.resetTime };
}

// CSRF Token Endpoint
app.get('/api/csrf-token', (req, res) => {
  const token = generateCsrfToken();
  res.json({ csrfToken: token });
});

// In-memory Incident Database for real-time monitoring and reporting
let incidentReports: IncidentReport[] = [
  {
    id: 'inc-101',
    zoneId: 'zone-north',
    category: 'crowd',
    severity: 'high',
    description: 'Congestion detected at North gate turnstile cluster 4. Queue exceeds 20 minutes.',
    status: 'responding',
    reportedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    assignedStaffId: 'staff-v08'
  },
  {
    id: 'inc-102',
    zoneId: 'zone-west',
    category: 'medical',
    severity: 'medium',
    description: 'Minor heat exhaustion reported at West Plaza Concourse near Food Court B.',
    status: 'resolved',
    reportedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    assignedStaffId: 'staff-med-3'
  }
];

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Rate Limiting Middleware
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const { allowed, remaining, resetTime } = checkRateLimit(ip);

  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());

  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  next();
});

// CSRF Protection Middleware (excludes GET and /api/csrf-token)
app.use((req, res, next) => {
  if (req.method === 'GET' || req.path === '/api/csrf-token' || req.path === '/api/health') {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string | undefined;
  if (!csrfToken || !validateCsrfToken(csrfToken)) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }

  next();
});

// --- API ROUTES ---

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Incident Logger Endpoints
app.get('/api/incidents', (req, res) => {
  res.json(incidentReports);
});

app.post('/api/incidents', (req, res) => {
  const { zoneId, category, severity, description } = req.body;
  if (!zoneId || !category || !severity || !description) {
    return res.status(400).json({ error: 'All incident fields are required' });
  }

  const newIncident: IncidentReport = {
    id: `inc-${Date.now()}`,
    zoneId,
    category,
    severity,
    description,
    status: 'reported',
    reportedAt: new Date().toISOString(),
  };

  incidentReports.unshift(newIncident);
  res.status(201).json(newIncident);
});

app.post('/api/incidents/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, assignedStaffId } = req.body;

  const incident = incidentReports.find(i => i.id === id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  if (status) incident.status = status;
  if (assignedStaffId) incident.assignedStaffId = assignedStaffId;

  res.json(incident);
});

// Centralized Recommendations endpoint
app.post('/api/recommendations', async (req, res) => {
  try {
    const { zones, transports, sustainability, accessibilityNeedsActive, userRole } = req.body;
    if (!zones || !transports || !sustainability || !userRole) {
      return res.status(400).json({ error: 'Missing required state fields' });
    }

    const customApiKey = req.headers['x-gemini-api-key'] as string | undefined;

    const recs = await generateRecommendations({
      zones,
      transports,
      sustainability,
      accessibilityNeedsActive: !!accessibilityNeedsActive,
      userRole
    }, customApiKey);

    res.json(recs);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: errorMsg });
  }
});

// Navigation Endpoint
app.post('/api/navigation', async (req, res) => {
  try {
    const { source, destination, accessibility } = req.body;
    if (!source || !destination) {
      return res.status(400).json({ error: 'Source and destination are required' });
    }

    const customApiKey = req.headers['x-gemini-api-key'] as string | undefined;

    const prompt = `Generate a personalized, congestion-aware route from "${source}" to "${destination}" inside a FIFA stadium. Accessibility mode is ${accessibility ? 'ON' : 'OFF'}. 
    Provide estimatedTimeMin (number), distanceMeters (number), and routeSteps (string array), crowdLevel ("low" | "medium" | "high").
    Ensure steps are highly clear, structured, and realistic. Return ONLY a valid JSON object of type NavigationRoute, no extra wrapper or markdown formatting code. Ensure you use raw JSON with double quotes. Here is the format:
    {
      "source": "${source}",
      "destination": "${destination}",
      "estimatedTimeMin": 10,
      "distanceMeters": 350,
      "routeSteps": ["step 1", "step 2"],
      "accessibilityFriendly": ${accessibility},
      "crowdLevel": "medium"
    }`;

    const responseText = await generateContentWithResilience(
      prompt,
      'You are an expert FIFA World Cup stadium routing coordinator. Output raw JSON object matching the requested schema strictly. Do not prefix with markdown ticks.',
      true,
      customApiKey
    );

    let route;
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      route = JSON.parse(cleanJson);
      if (!route || typeof route !== 'object' || !route.routeSteps || !Array.isArray(route.routeSteps)) {
        throw new Error('Incomplete route object received');
      }
    } catch (parseErr) {
      console.warn('Failed to parse Gemini nav route response or route is incomplete, using fallback strategy:', parseErr);
      route = getFallbackNavigation(source, destination, !!accessibility);
    }

    res.json(route);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: errorMsg });
  }
});

// Chat Multilingual Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const customApiKey = req.headers['x-gemini-api-key'] as string | undefined;

    const systemInstruction = `You are the Multilingual AI Assistant for FIFA World Cup 2026. 
    The current active language selected is "${language || 'en'}". 
    Respond to the query appropriately using simple terms, clear directions, accessibility hints, or emergency options. 
    Keep the answer concise (2-4 sentences max), polite, positive, and aligned with tournament operations guidelines.
    Respond directly in the requested language: ${language}.`;

    const reply = await generateContentWithResilience(message, systemInstruction, false, customApiKey);
    res.json({ text: reply });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: errorMsg });
  }
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FIFA Command Center AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
