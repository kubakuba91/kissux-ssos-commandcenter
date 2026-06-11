# SSOS Command Center

A real-time fleet-surveillance dashboard for **Mimi** — an on-device AI agent that
monitors phone calls for seniors and intervenes in real time when scams are detected.

The interface is built around the **OODA loop** (Observe · Orient · Decide · Act) that
Mimi runs autonomously on every call. The human operator sits *outside* the loop,
watching it run at fleet scale across hundreds of simultaneous calls and acting only
when a pattern warrants external action.

## Running it

No build step, no backend, no install. Everything loads from CDNs (React, Babel,
Tailwind, Chart.js) and runs entirely in the browser.

Because the app loads sibling `.jsx` files via `<script src>`, it must be served over
HTTP (opening `index.html` via `file://` will be blocked by the browser). Any static
server works:

```bash
# from the project root
python3 -m http.server 8000
# then open http://localhost:8000
```

or

```bash
npx serve .
```

## What's inside

| Page | Purpose |
|------|---------|
| **Overview** | KPI cards, geographic activity map, live Threat Intelligence Feed, raw Activity Stream |
| **Threat Intelligence** | Active threat patterns, scam-type breakdown chart, unknown-classification log (operator can classify) |
| **Fleet Health** | 30-day Mimi performance trend, classification-confidence histogram, device coverage, model-feedback summary |
| **Reports** | Filed/draft agency reports + "New Report" modal (rare, agency-initiated workflow) |

## Live simulation engine

The dashboard is **not static**. A central `useSimulation` hook (`hooks/useSimulation.js`)
is the single source of truth that every component subscribes to. It:

- Triggers a new call every **3–20 seconds** (quiet periods punctuated by bursts).
- Runs each call through its lifecycle: `call started → scam detected (5–10s) → Mimi
  intervened (3–5s) → outcome`.
- Weights outcomes **70% complied / 25% ignored / 5% unknown** and scam types per the
  AARP/Senate Aging Committee distribution.
- Ripples each event through the Activity Stream, the geographic map (dot color updates
  amber→green/red as the call resolves), the KPI cards, and — when pattern thresholds are
  crossed — the Threat Intelligence Feed.

All dollar figures use elder-specific average-loss lookups (`data/lossLookup.js`).

## Structure

```
index.html                 # entry point — loads everything via CDN
data/
  lossLookup.js            # loss table, scam/outcome weights, regions, helpers
  mockData.js              # seed state (KPIs, feed, activity, patterns, reports, charts)
hooks/
  useSimulation.js         # central live-simulation state
components/
  Sidebar.jsx
  KpiCards.jsx
  GeoMap.jsx
  ThreatFeed.jsx
  ActivityStream.jsx
  ThreatIntelligencePage.jsx
  FleetHealthPage.jsx
  ReportsPage.jsx
App.jsx                    # sidebar nav + page routing (useState)
```

> Mock data only. No real senior data, no backend, no network calls beyond CDN assets.
