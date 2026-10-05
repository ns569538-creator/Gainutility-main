import { toolUrl } from "./data";

const RECENT_KEY = "recentTools";
const MAX_RECENT = 5;

export interface RecentEntry {
  id: string;
  name: string;
  at: number;
}

export async function getRecent(): Promise<RecentEntry[]> {
  const store = await chrome.storage.local.get(RECENT_KEY);
  const list = store[RECENT_KEY] as RecentEntry[] | undefined;
  return Array.isArray(list) ? list.slice(0, MAX_RECENT) : [];
}

async function setRecent(list: RecentEntry[]): Promise<void> {
  await chrome.storage.local.set({ [RECENT_KEY]: list.slice(0, MAX_RECENT) });
}

/** Record a tool as used and open it in a new tab. */
export async function openTool(id: string, name: string): Promise<void> {
  const prev = await getRecent();
  const next = [{ id, name, at: Date.now() }, ...prev.filter((e) => e.id !== id)];
  await setRecent(next);
  await chrome.tabs.create({ url: toolUrl(id) });
}
