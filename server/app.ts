import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { marketDataProvider } from "./providers/index.js";
import { readDemoData, updateBoardItem } from "./store.js";

export const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "market-scope-api" });
});

app.get("/api/dashboard", async (_request, response) => {
  const data = await readDemoData();
  response.json(data);
});

app.get("/api/market/fx", async (_request, response) => {
  response.json(await marketDataProvider.getDollarRate());
});

app.get("/api/market/quote/:symbol", async (request, response) => {
  const symbol = request.params.symbol.toUpperCase();
  if (!/^[A-Z][A-Z0-9.-]{0,9}$/.test(symbol)) {
    response.status(400).json({ error: "Invalid market symbol" });
    return;
  }
  response.json(await marketDataProvider.getQuote(symbol));
});

app.patch("/api/board/:id", async (request, response) => {
  const changes = {
    status: typeof request.body.status === "string" ? request.body.status : undefined,
    title: typeof request.body.title === "string" ? request.body.title : undefined
  };
  const item = await updateBoardItem(request.params.id, changes);
  response.json(item);
});

const clientDirectory = path.resolve(process.cwd(), "dist");
if (existsSync(clientDirectory)) {
  app.use(express.static(clientDirectory));
  app.get("/{*splat}", (_request, response) => response.sendFile(path.join(clientDirectory, "index.html")));
}

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  const status = message.includes("not found") ? 404 : 502;
  console.error(`[market-scope-api] ${message}`);
  response.status(status).json({ error: message });
});
