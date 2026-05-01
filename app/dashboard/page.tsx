"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import DexaUpload from "@/components/DexaUpload";
import DexaSummary from "@/components/DexaSummary";
import DexaComparison from "@/components/DexaComparison";
import DexaTrends from "@/components/DexaTrends";
import SignOut from "@/components/signOut";
import type { ScanSummary } from "@/lib/insert-dexa";

async function fetchScans(): Promise<ScanSummary[]> {
  const res = await fetch("/api/dexa");
  if (!res.ok) return [];
  return res.json();
}

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const [scans, setScans] = useState<ScanSummary[]>([]);

  useEffect(() => {
    if (!session) return;
    fetchScans().then((data) => setScans(data));
  }, [session]);

  if (isPending) return null;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      {scans.length >= 3 ? (
        <DexaTrends scans={scans} />
      ) : scans.length === 2 ? (
        <DexaComparison current={scans[0]} previous={scans[1]} />
      ) : scans.length === 1 ? (
        <DexaSummary scan={scans[0]} />
      ) : null}
      <div className="flex items-start gap-3">
        <DexaUpload
          onSuccess={() => fetchScans().then((data) => setScans(data))}
        />
        <SignOut />
      </div>
    </main>
  );
}
