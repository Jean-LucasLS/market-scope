export const money = (value: number, currency: "USD" | "BRL" = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);

export const percent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

export const shortDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
