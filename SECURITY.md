# SECURITY ENGINEERING PROTOCOLS

FIFA Command Center AI employs multiple defensive layers to ensure data privacy, server robustness, and system integrity.

---

## 🔒 1. API Key Isolation (Zero Browser Leakage)

- **Strict Server-Side Proxying**: No API keys are prefixed with `VITE_`.
- **Server Guarding**: The client accesses Gemini exclusively via the Express API endpoints (`/api/chat`, `/api/navigation`, etc.), completely hiding secrets behind the container perimeter.

---

## 🛡️ 2. HTTP Security Hardening

The Express server injects multiple critical headers on all responses:

- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing exploits.
- `X-Frame-Options: DENY`: Blocks Clickjacking attempts inside external visual contexts.
- `X-XSS-Protection: 1; mode=block`: Activates native browser cross-site scripting filters.

---

## 🧼 3. Input Sanitization & Error Management

- **No Stack Traces**: All 500 error boundaries intercept system failures, safely logging detail logs to internal server consoles while providing polite, friendly error states to the client.
- **Safe JSON Replacements**: Cleans Gemini outputs of potential markdown backticks or hidden escape characters before executing `JSON.parse` commands.
