# Pulsefolio

A polished, full-stack investment workspace made as a portfolio project. It includes a responsive market dashboard, searchable positions, portfolio analytics, activity history, and a drag-and-drop investment research Kanban.

> All account, portfolio, transaction, and task data is synthetic. Pulsefolio is a product demo, not financial advice.

## Highlights

- React + TypeScript dashboard with responsive desktop and mobile layouts
- Node.js/Express API with clear frontend/backend boundaries
- Interactive charts and asset filtering
- Research board with drag-and-drop and keyboard-accessible controls
- JSON-backed demo data that can be regenerated deterministically
- Cloud-ready market data adapter:
  - public USD/BRL rate from Frankfurter
  - optional stock quotes from Alpha Vantage
- No credentials, company data, logos, or internal integrations

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:3001`.

## Switch to cloud market data

The demo is the default and never needs credentials. To enable cloud requests:

```dotenv
MARKET_DATA_MODE=cloud
ALPHA_VANTAGE_API_KEY=your-key-here
```

Frankfurter provides the FX rate without a key. Alpha Vantage is optional: when its key is absent, stock quotes use the demo provider while the live FX call remains enabled. Never commit `.env`.

## Commands

```bash
npm run dev             # frontend + API
npm run build           # production build
npm run test            # component tests
npm run generate:data   # regenerate synthetic market history
npm run check           # build and test
```

## Deployment

`npm run build` creates `dist` and `dist-server`. Set `PORT` and run `npm start`; Express serves both the API and frontend. Add persistent storage or a managed database behind the existing provider/store boundary for a multi-user cloud deployment.

## Architecture

- `src/` — responsive React product UI
- `server/app.ts` — Express routes and static production serving
- `server/providers/` — demo and cloud market data adapters
- `server/data/demo.json` — synthetic seed data
- `scripts/generate-demo-data.ts` — deterministic fixture generator

## Portfolio talking points

Pulsefolio demonstrates API integration, dependency isolation, typed full-stack code, responsive UI, data visualization, error states, and an extensible cloud adapter rather than embedding third-party secrets in browser code.
