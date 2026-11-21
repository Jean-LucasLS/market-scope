import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { BoardStatus, DemoData, WorkItem } from "./types.js";

const dataFile = fileURLToPath(new URL("./data/demo.json", import.meta.url));

export async function readDemoData(): Promise<DemoData> {
  return JSON.parse(await readFile(dataFile, "utf8")) as DemoData;
}

export async function updateBoardItem(
  id: string,
  changes: Partial<Pick<WorkItem, "status" | "title">>
): Promise<WorkItem> {
  const data = await readDemoData();
  const item = data.board.find((entry) => entry.id === id);
  if (!item) {
    throw new Error("Board item not found");
  }
  if (changes.status && !["backlog", "researching", "review", "done"].includes(changes.status)) {
    throw new Error("Invalid board status");
  }
  if (changes.status) item.status = changes.status as BoardStatus;
  if (changes.title?.trim()) item.title = changes.title.trim();
  await writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return item;
}
