# SYSTEM ARCHITECTURE
**FIFA World Cup 2026 AI Command Center & Operations Platform**

---

## 1. Architectural Overview
This platform employs a highly optimized, statefully unidirectional, full-stack React + Express architecture designed for extreme responsiveness and secure Gemini API operations.

```
                  +-----------------------------------+
                  |           React Frontend          |
                  |  (Single-Screen, Multi-Role Ops)  |
                  +-----------------+-----------------+
                                    |
                                    | Secure API Requests
                                    v
                  +-----------------+-----------------+
                  |          Express Server           |
                  |         (port 3000 proxy)         |
                  +-----------------+-----------------+
                                    |
                                    | Resilience Cascade
                                    v
                  +-----------------+-----------------+
                  |     Gemini Developer API SDK      |
                  |  (Flash -> Pro -> Fallback Strategy)  |
                  +-----------------------------------+
```

---

## 2. Core Operational Flow

### A. Central State Store
The primary tournament operations state is initialized in `src/App.tsx` and passes down dynamic updates through custom Hooks. No business logic resides directly inside UI render templates:

1. **Crowd State (`useCrowdCenter`)**: Tracks active stadium gate congestion ratios, incidents logs, and medical dispatch logs.
2. **Navigation State (`useNavigation`)**: Handles route selection and dynamically routes around congested sectors.
3. **Transit State (`useTransportation`)**: Tracks parking availability levels and metropolitan transit delays.
4. **Green Index (`useSustainability`)**: Computes real-time carbon offsets and trash division percentages.

### B. Resilience Cascade SDK
All external AI triggers are handled using the resilient Gemini client wrapper located at `/src/services/ai/aiProvider.ts`. 

- **Primary:** `gemini-2.5-flash` for high-speed, sub-second operations.
- **Failover:** `gemini-2.5-pro` in case of rate quotas or transient failures.
- **Circuit Breaker:** Seamless fallback to offline rule-based strategies (`fallbackStrategy.ts`) to maintain 100% uptime in heavy-traffic stadium networks.
