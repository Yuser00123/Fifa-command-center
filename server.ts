/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { generateContentWithResilience } from './src/services/ai/aiProvider';
import { generateRecommendations } from './src/services/recommendations/recommendationEngine';
import { getFallbackNavigation } from './src/services/ai/fallbackStrategy';
import { IncidentReport } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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

    const recs = await generateRecommendations({
      zones,
      transports,
      sustainability,
      accessibilityNeedsActive: !!accessibilityNeedsActive,
      userRole
    });

    res.json(recs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Navigation Endpoint
app.post('/api/navigation', async (req, res) => {
  try {
    const { source, destination, accessibility } = req.body;
    if (!source || !destination) {
      return res.status(400).json({ error: 'Source and destination are required' });
    }

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
      true
    );

    let route;
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      route = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('Failed to parse Gemini nav route response, using fallback strategy:', parseErr);
      route = getFallbackNavigation(source, destination, !!accessibility);
    }

    res.json(route);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Chat Multilingual Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemInstruction = `You are the Multilingual AI Assistant for FIFA World Cup 2026. 
    The current active language selected is "${language || 'en'}". 
    Respond to the query appropriately using simple terms, clear directions, accessibility hints, or emergency options. 
    Keep the answer concise (2-4 sentences max), polite, positive, and aligned with tournament operations guidelines.
    Respond directly in the requested language: ${language}.`;

    const reply = await generateContentWithResilience(message, systemInstruction);
    res.json({ text: reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
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
