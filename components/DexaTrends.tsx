"use client";

import type { ScanSummary } from "@/lib/insert-dexa";

type MetricConfig = {
  key: keyof ScanSummary;
  label: string;
  unit: string;
  lowerIsBetter: boolean;
};

const METRICS: MetricConfig[] = [
  { key: "body_fat_percent",       label: "Body Fat",           unit: "%",     lowerIsBetter: true  },
  { key: "fat_mass_lb",            label: "Fat Mass",           unit: " lb",   lowerIsBetter: true  },
  { key: "lean_mass_lb",           label: "Lean Mass",          unit: " lb",   lowerIsBetter: false },
  { key: "weight_lb",              label: "Weight",             unit: " lb",   lowerIsBetter: true  },
  { key: "bmi",                    label: "BMI",                unit: "",      lowerIsBetter: true  },
  { key: "lean_mass_index",        label: "Lean Mass Index",    unit: " kg/m²",lowerIsBetter: false },
  { key: "appendicular_lean_index",label: "App. Lean Index",    unit: " kg/m²",lowerIsBetter: false },
  { key: "visceral_fat_mass_g",    label: "Visceral Fat",       unit: " g",    lowerIsBetter: true  },
  { key: "android_gynoid_ratio",   label: "A/G Ratio",          unit: "",      lowerIsBetter: true  },
  { key: "trunk_limb_fat_ratio",   label: "Trunk/Limb Ratio",   unit: "",      lowerIsBetter: true  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

function diffLabel(current: number | null, reference: number | null, lowerIsBetter: boolean, unit: string) {
  if (current == null || reference == null) return <span className="text-gray-400">—</span>;
  const diff = parseFloat((current - reference).toFixed(2));
  if (diff === 0) return <span className="text-gray-400">0</span>;
  const improved = lowerIsBetter ? diff < 0 : diff > 0;
  return (
    <span className={improved ? "text-green-500" : "text-red-500"}>
      {diff > 0 ? "+" : ""}{diff}{unit}
    </span>
  );
}

function Sparkline({ values, lowerIsBetter }: { values: number[]; lowerIsBetter: boolean }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-px h-7">
      {values.map((v, i) => {
        const heightPct = Math.max(((v - min) / range) * 100, 8);
        const isLatest = i === values.length - 1;
        const improved = i > 0 ? (lowerIsBetter ? v < values[i - 1] : v > values[i - 1]) : null;
        const color = isLatest
          ? "bg-blue-500 dark:bg-blue-400"
          : improved === true
          ? "bg-green-400 dark:bg-green-500"
          : improved === false
          ? "bg-red-400 dark:bg-red-500"
          : "bg-gray-300 dark:bg-gray-600";
        return (
          <div key={i} className={`w-2.5 rounded-sm ${color}`} style={{ height: `${heightPct}%` }} />
        );
      })}
    </div>
  );
}

export default function DexaTrends({ scans }: { scans: ScanSummary[] }) {
  // scans are newest-first; reverse for chronological sparkline display
  const chronological = [...scans].reverse();
  const latest = scans[0];
  const previous = scans[1];
  const oldest = scans[scans.length - 1];

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Latest scan header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Latest scan
        </p>
        <p className="text-lg font-semibold">{formatDate(latest.scan_date)}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {scans.length} scans · first on {formatDate(oldest.scan_date)}
        </p>
      </div>

      {/* Trend table */}
      <div>
        {/* Header */}
        <div className="mb-2 grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 text-xs font-medium text-gray-400 dark:text-gray-500">
          <span>Metric</span>
          <span className="text-right">Latest</span>
          <span className="text-right">vs Prev</span>
          <span className="text-right">Overall</span>
          <span>Trend</span>
        </div>

        <div className="divide-y divide-black/5 dark:divide-white/5">
          {METRICS.map(({ key, label, unit, lowerIsBetter }) => {
            const val = latest[key] as number | null;
            const sparkValues = chronological
              .map(s => s[key] as number | null)
              .filter((v): v is number => v != null);

            return (
              <div
                key={key}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-4 py-2 text-sm"
              >
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="text-right tabular-nums">
                  {val != null ? `${val}${unit}` : "—"}
                </span>
                <span className="text-right tabular-nums">
                  {diffLabel(val, previous[key] as number | null, lowerIsBetter, unit)}
                </span>
                <span className="text-right tabular-nums">
                  {diffLabel(val, oldest[key] as number | null, lowerIsBetter, unit)}
                </span>
                <div>
                  {sparkValues.length >= 2 ? (
                    <Sparkline values={sparkValues} lowerIsBetter={lowerIsBetter} />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
