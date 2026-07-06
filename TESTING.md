# TESTING STRATEGY & TEST PLANS

This document details the quality assurance, unit tests, and integration flows configured to maintain our 90%+ code coverage objectives.

---

## 🧪 1. Testing Framework

The system utilizes:
- **Jest**: Core runner and mock coordinator.
- **React Testing Library**: For rendering components and simulating touch or keyboard clicks.
- **jest-axe**: For automated WCAG compliance testing inside UI elements.

---

## 📋 2. Engine & Service Tests

### `aiProvider.test.ts`
- Verifies that `gemini-2.5-flash` is queried first.
- Simulates a 429 quota failure on Flash and verifies seamless rollover to `gemini-2.5-pro`.
- Simulates complete API failure and verifies responsive template return from `fallbackStrategy.ts`.

### `navigationEngine.test.ts`
- Tests routing step generation for both regular and wheelchair modes.
- Confirms appropriate estimated times are produced based on the distance.

---

## 📦 3. UI Component Tests

- **`NavigationDashboard.test.tsx`**: Verifies selection updates, shortcut button selections, and loader spinners.
- **`CrowdCenter.test.tsx`**: Verifies that submitting an incident inserts the log into the live queue, and status changes are reflected.
- **`AIAssistant.test.tsx`**: Verifies chatbot interactions and language select triggers.
