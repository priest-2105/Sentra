import { NextRequest, NextResponse } from "next/server";

const ENGINE_URL = process.env.ENGINE_URL || "http://localhost:8000";

// In-memory IP rate limiter: 5 scans per 24 hours per IP
const ipTimestamps = new Map<string, number[]>();
const RATE_MAX = 5;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_WINDOW_MS;
  const prev = (ipTimestamps.get(ip) ?? []).filter((t) => t > cutoff);
  if (prev.length >= RATE_MAX) return false;
  ipTimestamps.set(ip, [...prev, now]);
  return true;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "0.0.0.0"
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: `Rate limit exceeded — maximum ${RATE_MAX} scans per 24 hours per IP address.` },
      { status: 429 }
    );
  }
  try {
    const body = await request.json();

    if (!body.repo_url) {
      return NextResponse.json({ error: "repo_url is required" }, { status: 400 });
    }

    const res = await fetch(`${ENGINE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repo_url: body.repo_url,
        deploy_url: body.deploy_url || null,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Engine error: ${text}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ scan_id: data.scan_id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
