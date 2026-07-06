# FIFA COMMAND CENTER AI

### "AI-Powered Stadium Operations & Fan Experience Platform for FIFA World Cup 2026"

FIFA Command Center AI is a premium, full-stack tournament management dashboard. Powered by resilient Gemini 2.5 models and built with React, Vite, Express, and Tailwind CSS, the platform synthesizes complex stadium metrics into real-time directions, queue mitigations, multilingual chats, and eco recommendations tailored for fans, volunteers, venue staff, and organizers.

---

## 🚀 Core Features

1. **AI Stadium Wayfinding (Feature 1)**: Computes step-by-step, congestion-aware corridors, accessible elevators, restroom shortcuts, and medical stations.
2. **Crowd Intelligence Center (Feature 2)**: Dynamic monitoring of active stadium sectors, occupancy rates, gate turnstile states, and queue benchmarks. Includes real-time density simulation controls.
3. **Multilingual Co-Pilot (Feature 3)**: Chatbot translating and providing directions across English, Spanish, French, Portuguese, and Hindi.
4. **Accessibility Assistant (Feature 4)**: Real-time step-free bypass, lift prioritizer, and audible/tactile walking tracks.
5. **Transportation Intelligence (Feature 5)**: Track shuttle cycles, available parking lanes, and use AI to plan arrival and departure routes.
6. **Command Incident Center (Feature 6)**: Live incident logger allowing organizers and staff to report and status active medical, security, or crowd problems.
7. **Sustainability Insights (Feature 7)**: Interactive Diversion Rate, Energy Grid, Carbon footprint tracking, and zero-waste pledge simulations.
8. **Resilient AI Recommendation Engine (Feature 8)**: Custom, role-specific recommendations that adapt automatically when toggled between Fan, Volunteer, Staff, or Organizer personas.

---

## 🛠️ Architecture

- **Frontend**: React 19, Tailwind CSS, Lucide icons, Framer Motion transitions.
- **Backend**: Express API server proxying model requests to prevent browser API key exposure.
- **AI Stack**: Resilient Multi-Model Priority Cascading (`gemini-2.5-flash` -> `gemini-2.5-pro` -> intelligent local fallback).

---

## ⚡ Development & Deployment

### Quick Start
1. Install base dependencies:
   ```bash
   npm install
   ```
2. Start the development server (runs full-stack Express on port 3000):
   ```bash
   npm run dev
   ```
3. Build the production package (bundles TS server to `dist/server.cjs` with `esbuild`):
   ```bash
   npm run build
   ```
4. Run production deployment:
   ```bash
   npm run start
   ```
