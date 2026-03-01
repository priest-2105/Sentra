const ENGINE_URL = process.env.ENGINE_URL || "http://localhost:8000";

export interface ScanScores {
  security: number;
  devops: number;
  observability: number;
  architecture: number;
}

export interface RiskFlag {
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
}

export interface RoadmapItem {
  priority: number;
  action: string;
  effort: "low" | "medium" | "high";
}

export interface RiskDetail {
  title: string;
  impact: string;
  fix: string;
}

export interface Explanation {
  summary: string;
  risks: RiskDetail[];
  roadmap: RoadmapItem[];
  recommendation: "Ready" | "Needs Work" | "Not Ready";
}

export interface ScanResult {
  id: string;
  status: "pending" | "running" | "complete" | "error";
  timestamp?: string;
  repo_url?: string;
  deploy_url?: string;
  total_score?: number;
  scores?: ScanScores;
  flags?: RiskFlag[];
  explanation?: Explanation;
  error_msg?: string;
}

export async function postAnalyze(
  repoUrl: string,
  deployUrl?: string
): Promise<{ scan_id: string }> {
  const res = await fetch(`${ENGINE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl, deploy_url: deployUrl || null }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Engine error: ${err}`);
  }
  return res.json();
}

export async function getScan(scanId: string): Promise<ScanResult> {
  const res = await fetch(`${ENGINE_URL}/scan/${scanId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Engine error: ${err}`);
  }
  return res.json();
}
