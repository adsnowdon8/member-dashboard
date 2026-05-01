"use client";

import type { ScanSummary } from "@/lib/insert-dexa";

function fmt(value: number | null, unit = ""): string {
  if (value == null) return "—";
  return `${value}${unit}`;
}

function delta(current: number | null, previous: number | null): React.ReactNode {
  if (current == null || previous == null) return null;
  const diff = parseFloat((current - previous).toFixed(2));
  if (diff === 0) return <span className="text-gray-400">—</span>;
  const positive = diff > 0;
  return (
    <span className={positive ? "text-red-500" : "text-green-500"}>
      {positive ? "+" : ""}
      {diff}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

type Row = {
  label: string;
  current: string;
  previous: string;
  diff: React.ReactNode;
};

function buildRows(current: ScanSummary, previous: ScanSummary): Row[] {
  const row = (
    label: string,
    key: keyof ScanSummary,
    unit = "",
    lowerIsBetter = false
  ): Row => {
    const c = current[key] as number | null;
    const p = previous[key] as number | null;
    const d = c != null && p != null
      ? (() => {
          const diff = parseFloat((c - p).toFixed(2));
          if (diff === 0) return <span className="text-gray-400">—</span>;
          const improved = lowerIsBetter ? diff < 0 : diff > 0;
          return (
            <span className={improved ? "text-green-500" : "text-red-500"}>
              {diff > 0 ? "+" : ""}{diff}{unit}
            </span>
          );
        })()
      : null;
    return { label, current: fmt(c, unit), previous: fmt(p, unit), diff: d };
  };

  return [
    row("Weight", "weight_lb", " lb", true),
    row("Body Fat %", "body_fat_percent", "%", true),
    row("Fat Mass", "fat_mass_lb", " lb", true),
    row("Lean Mass", "lean_mass_lb", " lb"),
    row("BMI", "bmi", "", true),
    row("Lean Mass Index", "lean_mass_index", " kg/m²"),
    row("Appendicular Lean Index", "appendicular_lean_index", " kg/m²"),
    row("Android Fat %", "android_fat_percent", "%", true),
    row("Gynoid Fat %", "gynoid_fat_percent", "%", true),
    row("Android/Gynoid Ratio", "android_gynoid_ratio", "", true),
    row("Trunk/Limb Fat Ratio", "trunk_limb_fat_ratio", "", true),
    row("Visceral Fat Mass", "visceral_fat_mass_g", " g", true),
    row("Visceral Fat Area", "visceral_fat_area_cm2", " cm²", true),
  ];
}

export default function DexaComparison({
  current,
  previous,
}: {
  current: ScanSummary;
  previous: ScanSummary;
}) {
  const rows = buildRows(current, previous);

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-4 grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
        <span />
        <span>{formatDate(previous.scan_date)}</span>
        <span>{formatDate(current.scan_date)}</span>
        <span>Change</span>
      </div>
      <div className="divide-y divide-black/5 dark:divide-white/5">
        {rows.map(({ label, current: c, previous: p, diff }) => (
          <div key={label} className="grid grid-cols-4 gap-2 py-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span>{p}</span>
            <span>{c}</span>
            <span>{diff ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
