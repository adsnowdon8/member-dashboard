"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import DexaUpload from "@/components/DexaUpload";
import DexaSummary from "@/components/DexaSummary";
import type { ScanSummary } from "@/lib/insert-dexa";
import SignOut from "@/components/signOut";

async function fetchLatestScan(): Promise<ScanSummary | null> {
  const res = await fetch("/api/dexa");
  if (!res.ok) return null;
  return res.json();
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [scan, setScan] = useState<ScanSummary | null>(null);

  useEffect(() => {
    if (!session) return;
    fetchLatestScan().then((data) => setScan(data));
  }, [session]);

  if (isPending) return null;
  if (!session) {
    router.push("/");
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      {scan && <DexaSummary scan={scan} />}
      <div className="flex gap-3">
        <DexaUpload
          onSuccess={() => fetchLatestScan().then((data) => setScan(data))}
        />

        <SignOut />
      </div>
    </main>
  );
}
