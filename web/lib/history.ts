import type { ScanScores } from "./api";

export interface HistoryEntry {
  id: string;
  repo_url: string;
  scanned_at: string;
  total_score: number;
  recommendation: "Ready" | "Needs Work" | "Not Ready";
  scores: ScanScores;
}

const STORAGE_KEY = "sentra_history";

export function saveToHistory(entry: HistoryEntry): void {
  const existing = getHistory().filter((e) => e.id !== entry.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing]));
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
