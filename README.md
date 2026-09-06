# FasalNiti

FasalNiti is an SIH-oriented agricultural decision-intelligence platform for farmers. It compares buyer offers, mandi sales, farmer aggregation, and storage using net realization after freight, fees, handling, and risk deductions.

## Problem addressed

Farmers often choose a selling channel from the visible price alone, without a clear view of transport, mandi charges, handling, storage, payment timing, and risk. FasalNiti turns those factors into a practical comparison so farmers can make better selling decisions.

## Run locally

```bash
npm install
npm run dev
```

The app serves through the Express/Vite server. Copy `.env.example` to `.env` only if Gemini advisor integration is needed.

## Main capabilities

- Net-realization comparison across buyers, mandis, aggregation, and storage
- Farmer, buyer, FPO, market-intelligence, logistics, and admin views
- Hindi/English interface
- AI advisor drawer with rule-grounded fallback advice
- Responsive mobile, tablet, and desktop UI
