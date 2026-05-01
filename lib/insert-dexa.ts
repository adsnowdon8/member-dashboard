import { Pool } from "pg";
import type { BodyCompositionSummary, ParsedDexaScan } from "./parse-dexa";

export interface ScanSummary extends BodyCompositionSummary {
  id: number;
  notes: string | null;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function insertDexaScan(
  scan: ParsedDexaScan,
  userId: string
): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { summary, segments } = scan;

    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO body_composition_summary (
        scan_date, weight_lb, body_fat_percent, fat_mass_lb, lean_mass_lb,
        bmi, lean_mass_index, appendicular_lean_index,
        visceral_fat_mass_g, visceral_fat_area_cm2,
        android_fat_percent, gynoid_fat_percent,
        android_gynoid_ratio, trunk_limb_fat_ratio,
        user_id
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
      ) RETURNING id`,
      [
        summary.scan_date,
        summary.weight_lb,
        summary.body_fat_percent,
        summary.fat_mass_lb,
        summary.lean_mass_lb,
        summary.bmi,
        summary.lean_mass_index,
        summary.appendicular_lean_index,
        summary.visceral_fat_mass_g,
        summary.visceral_fat_area_cm2,
        summary.android_fat_percent,
        summary.gynoid_fat_percent,
        summary.android_gynoid_ratio,
        summary.trunk_limb_fat_ratio,
        userId,
      ]
    );

    const scanId = rows[0].id;

    await client.query(
      `INSERT INTO body_segment_composition
        (scan_id, segment, fat_mass_lb, lean_mass_lb, total_mass_lb, body_fat_percent)
       SELECT $1, seg.segment, seg.fat_mass_lb, seg.lean_mass_lb, seg.total_mass_lb, seg.body_fat_percent
       FROM jsonb_to_recordset($2::jsonb) AS seg(
         segment text, fat_mass_lb float8, lean_mass_lb float8,
         total_mass_lb float8, body_fat_percent float8
       )`,
      [scanId, JSON.stringify(segments)]
    );

    await client.query("COMMIT");
    return scanId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getLatestScan(userId: string): Promise<ScanSummary | null> {
  const { rows } = await pool.query<ScanSummary>(
    `SELECT * FROM body_composition_summary
     WHERE user_id = $1
     ORDER BY scan_date DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0] ?? null;
}