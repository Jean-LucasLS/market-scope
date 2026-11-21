import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const dashboard = {
  portfolioName: "Test portfolio",
  generatedAt: "2026-01-01T00:00:00.000Z",
  assets: [{
    symbol: "TEST", name: "Test Asset", type: "Stock", price: 100, currency: "USD",
    changePercent: 1.5, quantity: 2, allocation: 100, sector: "Test",
    history: [90, 100]
  }],
  performance: [{ date: "2026-01", value: 200 }],
  activity: [],
  board: []
};

afterEach(() => vi.unstubAllGlobals());

describe("App", () => {
  it("renders portfolio data returned by the API", async () => {
    vi.stubGlobal("fetch", vi.fn((url: string) => Promise.resolve(new Response(
      JSON.stringify(url.includes("/fx") ? { pair: "USD/BRL", rate: 5, source: "demo" } : dashboard),
      { status: 200, headers: { "Content-Type": "application/json" } }
    ))));

    render(<App />);

    expect(await screen.findByText("Good morning, investor.")).toBeInTheDocument();
    expect(screen.getAllByText("TEST")).toHaveLength(2);
  });
});
