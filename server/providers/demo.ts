import type { Asset, DemoData, MarketDataProvider } from "../types.js";
import demoData from "../data/demo.json" with { type: "json" };

const data = demoData as DemoData;

export class DemoMarketDataProvider implements MarketDataProvider {
  async getDollarRate() {
    return {
      pair: "USD/BRL",
      rate: 5.42,
      source: "demo",
      asOf: data.generatedAt
    };
  }

  async getQuote(symbol: string) {
    const asset = data.assets.find((item: Asset) => item.symbol === symbol.toUpperCase());
    if (!asset) {
      throw new Error(`No demo quote is available for ${symbol}`);
    }

    return {
      symbol: asset.symbol,
      price: asset.price,
      changePercent: asset.changePercent,
      source: "demo" as const,
      asOf: data.generatedAt
    };
  }
}
