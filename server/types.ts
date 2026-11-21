export type BoardStatus = "backlog" | "researching" | "review" | "done";

export interface Asset {
  symbol: string;
  name: string;
  type: "Stock" | "ETF" | "Crypto";
  price: number;
  currency: "USD" | "BRL";
  changePercent: number;
  quantity: number;
  allocation: number;
  sector: string;
  history: number[];
}

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  status: BoardStatus;
  priority: "High" | "Medium" | "Low";
  tag: string;
  owner: string;
  dueDate: string;
}

export interface DemoData {
  portfolioName: string;
  generatedAt: string;
  assets: Asset[];
  performance: { date: string; value: number }[];
  activity: {
    id: string;
    type: "Buy" | "Sell" | "Dividend";
    symbol: string;
    description: string;
    amount: number;
    occurredAt: string;
  }[];
  board: WorkItem[];
}

export interface MarketQuote {
  symbol: string;
  price: number;
  changePercent: number;
  source: "demo" | "alphavantage";
  asOf: string;
}

export interface MarketDataProvider {
  getDollarRate(): Promise<{ pair: string; rate: number; source: string; asOf: string }>;
  getQuote(symbol: string): Promise<MarketQuote>;
}
