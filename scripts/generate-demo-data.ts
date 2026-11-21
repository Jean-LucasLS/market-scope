import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const random = seededRandom(42);
const source = {
  assets: [
    ["AAPL", "Apple Inc.", "Stock", 228.12, 12, 22, "Technology"],
    ["MSFT", "Microsoft", "Stock", 421.5, 7, 20, "Technology"],
    ["NVDA", "NVIDIA", "Stock", 139.62, 16, 18, "Semiconductors"],
    ["VOO", "Vanguard S&P 500 ETF", "ETF", 548.3, 5, 18, "Index fund"],
    ["BTC", "Bitcoin", "Crypto", 96540, 0.035, 12, "Digital assets"]
  ] as const
};
const assets = source.assets.map(([symbol, name, type, price, quantity, allocation, sector]) => ({
  symbol, name, type, price, currency: "USD", quantity, allocation, sector,
  changePercent: Number(((random() - 0.35) * 5).toFixed(2)),
  history: Array.from({ length: 9 }, (_, index) =>
    Number((price * (0.9 + index * 0.012 + random() * 0.025)).toFixed(2))
  )
}));
const sourceFile = fileURLToPath(new URL("../server/data/demo.json", import.meta.url));
const existing = JSON.parse(await readFile(sourceFile, "utf8")) as {
  board: unknown[];
  activity: unknown[];
};
const result = {
  portfolioName: "Long-term growth",
  generatedAt: new Date().toISOString(),
  assets,
  performance: Array.from({ length: 6 }, (_, index) => ({
    date: `2026-${String(index + 6).padStart(2, "0")}`,
    value: Math.round(27820 + index * 700 + random() * 900)
  })),
  activity: existing.activity,
  board: existing.board
};
const output = fileURLToPath(new URL("../server/data/demo.json", import.meta.url));
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(`Generated ${assets.length} demo assets at ${output}`);

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}
