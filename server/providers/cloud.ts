import type { MarketDataProvider } from "../types.js";
import { DemoMarketDataProvider } from "./demo.js";

export class CloudMarketDataProvider implements MarketDataProvider {
  private readonly fallback = new DemoMarketDataProvider();

  async getDollarRate() {
    const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=BRL");
    if (!response.ok) {
      throw new Error(`FX provider returned ${response.status}`);
    }

    const payload = (await response.json()) as { date: string; rates: { BRL: number } };
    return {
      pair: "USD/BRL",
      rate: payload.rates.BRL,
      source: "frankfurter",
      asOf: `${payload.date}T00:00:00.000Z`
    };
  }

  async getQuote(symbol: string) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return this.fallback.getQuote(symbol);
    }

    const url = new URL("https://www.alphavantage.co/query");
    url.searchParams.set("function", "GLOBAL_QUOTE");
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("apikey", apiKey);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Quote provider returned ${response.status}`);
    }

    const payload = (await response.json()) as {
      "Global Quote"?: Record<string, string>;
      Note?: string;
    };
    const quote = payload["Global Quote"];
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error(payload.Note ?? `No cloud quote is available for ${symbol}`);
    }

    return {
      symbol,
      price: Number(quote["05. price"]),
      changePercent: Number(quote["10. change percent"]?.replace("%", "")),
      source: "alphavantage" as const,
      asOf: `${quote["07. latest trading day"]}T00:00:00.000Z`
    };
  }
}
