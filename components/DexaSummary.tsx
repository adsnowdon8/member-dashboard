"use client";

import type { ScanSummary } from "@/lib/insert-dexa";

function Metric({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-semibold">
        {value ?? <span className="text-gray-400">—</span>}
      </p>
    </div>
  );
}

export default function DexaSummary({ scan }: { scan: ScanSummary }) {
  const date = new Date(scan.scan_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="w-full max-w-2xl">
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Latest scan — {date}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Metric label="Weight" value={`${scan.weight_lb} lb`} />
        <Metric label="Body Fat" value={`${scan.body_fat_percent}%`} />
        <Metric label="BMI" value={scan.bmi} />
        <Metric label="Fat Mass" value={`${scan.fat_mass_lb} lb`} />
        <Metric label="Lean Mass" value={`${scan.lean_mass_lb} lb`} />
        <Metric label="Lean Mass Index" value={scan.lean_mass_index != null ? `${scan.lean_mass_index} kg/m²` : null} />
        <Metric label="Appendicular Lean Index" value={scan.appendicular_lean_index != null ? `${scan.appendicular_lean_index} kg/m²` : null} />
        <Metric label="Android Fat" value={scan.android_fat_percent != null ? `${scan.android_fat_percent}%` : null} />
        <Metric label="Gynoid Fat" value={scan.gynoid_fat_percent != null ? `${scan.gynoid_fat_percent}%` : null} />
        <Metric label="Android/Gynoid Ratio" value={scan.android_gynoid_ratio} />
        <Metric label="Trunk/Limb Fat Ratio" value={scan.trunk_limb_fat_ratio} />
        <Metric label="Visceral Fat Mass" value={scan.visceral_fat_mass_g != null ? `${scan.visceral_fat_mass_g} g` : null} />
        <Metric label="Visceral Fat Area" value={scan.visceral_fat_area_cm2 != null ? `${scan.visceral_fat_area_cm2} cm²` : null} />
      </div>
    </div>
  );
}
