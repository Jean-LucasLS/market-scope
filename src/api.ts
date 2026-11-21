import type { DemoData, WorkItem } from "./types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  dashboard: () => request<DemoData>("/api/dashboard"),
  fx: () =>
    request<{ pair: string; rate: number; source: string; asOf: string }>("/api/market/fx"),
  updateBoardItem: (id: string, changes: Partial<Pick<WorkItem, "status" | "title">>) =>
    request<WorkItem>(`/api/board/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes)
    })
};
