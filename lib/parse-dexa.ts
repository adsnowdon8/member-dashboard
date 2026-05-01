
export interface BodyCompositionSummary {
  scan_date: string; // YYYY-MM-DD
  weight_lb: number;
  body_fat_percent: number;
  fat_mass_lb: number;
  lean_mass_lb: number;
  bmi: number | null;
  lean_mass_index: number | null;
  appendicular_lean_index: number | null;
  visceral_fat_mass_g: number | null;
  visceral_fat_area_cm2: number | null;
  android_fat_percent: number | null;
  gynoid_fat_percent: number | null;
  android_gynoid_ratio: number | null;
  trunk_limb_fat_ratio: number | null;
}

export interface BodyCompositionSegment {
  segment: string;
  fat_mass_lb: number;
  lean_mass_lb: number; // Lean + BMC as reported
  total_mass_lb: number;
  body_fat_percent: number;
}

export interface ParsedDexaScan {
  summary: BodyCompositionSummary;
  segments: BodyCompositionSegment[];
}

// ─── helpers ────────────────────────────────────────────────────────────────

const MONTHS: Record<string, string> = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
};

function n(s: string): number {
  return parseFloat(s);
}

function extract(text: string, re: RegExp): number | null {
  const m = text.match(re);
  return m ? n(m[1]) : null;
}

// ² may come through as the unicode superscript (U+00B2) or plain "2"
const SUP2 = "[²2]";

// ─── scan date ───────────────────────────────────────────────────────────────

function parseScanDate(text: string): string {
  // "Scan Date: June 22, 2024"
  const m = text.match(/Scan Date:\s+(\w+)\s+(\d{1,2}),\s+(\d{4})/);
  if (!m) throw new Error("Scan date not found in PDF");
  const month = MONTHS[m[1]];
  if (!month) throw new Error(`Unknown month: ${m[1]}`);
  return `${m[3]}-${month}-${m[2].padStart(2, "0")}`;
}

// ─── segment rows ────────────────────────────────────────────────────────────

// Rows appear as:
//   "L Arm 1.88 8.81 10.69 17.6 [39 35]"
//   "Android (A) 2.36 9.21 11.57 20.4"
// We capture: segment, fat, lean+bmc, total, %fat — and ignore optional percentile columns.
const SEGMENT_PATTERN = new RegExp(
  [
    "(L Arm|R Arm|Trunk|L Leg|R Leg|Subtotal|Head|Total",
    "|Android \\(A\\)|Gynoid \\(G\\))",
    "\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)",
  ].join(""),
  "g",
);

function normalise(raw: string): string {
  // "Android (A)" → "Android", "Gynoid (G)" → "Gynoid"
  return raw.replace(/\s*\([AG]\)$/, "");
}

function parseSegments(text: string): BodyCompositionSegment[] {
  const rows: BodyCompositionSegment[] = [];
  for (const m of text.matchAll(SEGMENT_PATTERN)) {
    rows.push({
      segment: normalise(m[1]),
      fat_mass_lb: n(m[2]),
      lean_mass_lb: n(m[3]),
      total_mass_lb: n(m[4]),
      body_fat_percent: n(m[5]),
    });
  }
  if (rows.length === 0)
    throw new Error("No body composition segments found in PDF");
  return rows;
}

// ─── main export ─────────────────────────────────────────────────────────────

export function parseDexaText(text: string): ParsedDexaScan {
  const segments = parseSegments(text);

  const total = segments.find((s) => s.segment === "Total");
  if (!total) throw new Error("Total row not found in segment data");

  const android = segments.find((s) => s.segment === "Android");
  const gynoid = segments.find((s) => s.segment === "Gynoid");

  const summary: BodyCompositionSummary = {
    scan_date: parseScanDate(text),

    // "Weight: 165.8 lb" in the page header
    weight_lb: extract(text, /Weight:\s*([\d.]+)\s*lb/) ?? total.total_mass_lb,

    body_fat_percent: total.body_fat_percent,
    fat_mass_lb: total.fat_mass_lb,
    lean_mass_lb: total.lean_mass_lb,

    // "BMI = 25.6 WHO Classification …"
    bmi: extract(text, /BMI\s*=\s*([\d.]+)/),

    // Lean Indices table: "Lean/Height² (kg/m²) 19.1"
    lean_mass_index: extract(
      text,
      new RegExp(`Lean\\/Height${SUP2}\\s*\\(kg\\/m${SUP2}\\)\\s+([\\d.]+)`),
    ),

    // "Appen. Lean/Height² (kg/m²) 8.72"
    appendicular_lean_index: extract(
      text,
      new RegExp(
        `Appen\\.\\s*Lean\\/Height${SUP2}\\s*\\(kg\\/m${SUP2}\\)\\s+([\\d.]+)`,
      ),
    ),

    // Adipose Indices table
    visceral_fat_mass_g: extract(text, /Est\.\s*VAT\s*Mass\s*\(g\)\s+([\d.]+)/),
    visceral_fat_area_cm2: extract(
      text,
      new RegExp(`Est\\.\\s*VAT\\s*Area\\s*\\(cm${SUP2}\\)\\s+([\\d.]+)`),
    ),

    android_fat_percent: android?.body_fat_percent ?? null,
    gynoid_fat_percent: gynoid?.body_fat_percent ?? null,

    // "Android/Gynoid Ratio 0.94"
    android_gynoid_ratio: extract(text, /Android\/Gynoid\s*Ratio\s+([\d.]+)/),

    // "Trunk/Limb Fat Mass Ratio 0.86"
    trunk_limb_fat_ratio: extract(
      text,
      /Trunk\/Limb\s*Fat\s*Mass\s*Ratio\s+([\d.]+)/,
    ),
  };

  return { summary, segments };
}
