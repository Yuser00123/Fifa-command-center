# SYSTEM ARCHITECTURE: FIFA COMMAND CENTER AI

This document details the clean architecture, service layers, and AI provider resilience designed for the FIFA Command Center AI.

---

## 🛰️ 1. Core Architectural Layout

```
                        +----------------------------+
                        |      React 19 Client       |
                        | (Wayfinding, Crowd, Chat)  |
                        +--------------+-------------+
                                       |
                             JSON APIs (Port 3000)
                                       |
                                       v
                        +--------------+-------------+
                        |    Express Custom Server   |
                        |  - Incident Logs (Memory)  |
                        |  - Security Header Guards  |
                        +--------------+-------------+
                                       |
                                       v
                        +--------------+-------------+
                        |  AI Resilience Provider    |
                        |  - Gemini 2.5 Flash        |
                        |  - Gemini 2.5 Pro          |
                        |  - Fallback Strategy       |
                        +----------------------------+
```

---

## 🧠 2. AI Provider Resilience System

Located at `/src/services/ai/`.

- **Lazy Initialization (`geminiClient.ts`)**: Prevents server crashes if `GEMINI_API_KEY` is missing or invalid.
- **Priority Cascade (`aiProvider.ts`)**:
  - Tries `gemini-2.5-flash` first for rapid low-cost inference.
  - If rate limited (429), quota exceeded, or service unavailable, it automatically rolls over to `gemini-2.5-pro`.
- **Intelligent Fallback (`fallbackStrategy.ts`)**: If all models fail, it returns responsive, context-aware pre-compiled templates, ensuring the UI remains 100% operational with no generic crashes.

---

## 🗄️ 3. Service Layer & Separation of Concerns

- **Separation of Concerns**: Business logic is decoupled from components.
- **In-Memory Logs**: Express server maintains real-time reported incident statuses (reported -> responding -> resolved).
- **Zod Schemas**: Used to structure routing structures, chat dialogues, and recommendation formats.
