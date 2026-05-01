"use client";

import { useRef, useState } from "react";

type Status = "idle" | "uploading" | "success" | "error";

export default function DexaUpload({ onSuccess }: { onSuccess?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/dexa", { method: "POST", body });

      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg ?? `Upload failed (${res.status})`);
      }

      setStatus("success");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className="rounded-lg border border-black/10 bg-white px-5 py-3 text-sm font-medium shadow-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
      >
        {status === "uploading" ? "Uploading…" : "Upload DEXA Scan (PDF)"}
      </button>

      {status === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Scan uploaded successfully.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </>
  );
}
