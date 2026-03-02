"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import RepoStep from "@/components/landing/RepoStep";
import DeployStep from "@/components/landing/DeployStep";

type Step = 1 | 2;

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [repoUrl, setRepoUrl] = useState("");
  const [deployUrl, setDeployUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze(deployOverride?: string) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_url: repoUrl.trim(),
          deploy_url: deployOverride?.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(data.error || `Error ${res.status}`);
      }

      const { scan_id } = await res.json();
      router.push(`/scan/${scan_id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start analysis");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 32px",
          backgroundImage: `
            linear-gradient(rgba(2, 116, 182, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(2, 116, 182, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      >
        {step === 1 && (
          <RepoStep
            value={repoUrl}
            onChange={setRepoUrl}
            onContinue={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <DeployStep
            repoUrl={repoUrl}
            value={deployUrl}
            onChange={setDeployUrl}
            onBack={() => { setError(""); setStep(1); }}
            onSubmit={(url) => handleAnalyze(url ?? deployUrl)}
            loading={loading}
            error={error}
          />
        )}
      </main>
    </div>
  );
}
