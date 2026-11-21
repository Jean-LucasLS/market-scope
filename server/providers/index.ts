import { CloudMarketDataProvider } from "./cloud.js";
import { DemoMarketDataProvider } from "./demo.js";

export const marketDataProvider =
  process.env.MARKET_DATA_MODE === "cloud"
    ? new CloudMarketDataProvider()
    : new DemoMarketDataProvider();
