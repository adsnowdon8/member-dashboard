import OpenAI from "openai";
import type { ParsedDexaScan } from "./parse-dexa";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a medical data extractor. You will be given raw text from a Hologic DEXA body composition scan report.
Extract the data and return it as JSON matching the schema exactly. All numeric fields should be numbers (not strings). If a field is not present in the report, return null for nullable fields.

The segments array should include every named region from the "Body Composition Results" table: L Arm, R Arm, Trunk, L Leg, R Leg, Subtotal, Head, Total, Android, Gynoid — each with their fat_mass_lb, lean_mass_lb (the "Lean + BMC" column), total_mass_lb, and body_fat_percent.

Dates must be in YYYY-MM-DD format.`;

export async function parseDexaAI(text: string): Promise<ParsedDexaScan> {
  const response = await client.responses.parse({
    model: "gpt-4o",
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "parsed_dexa_scan",
        schema: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                scan_date: { type: "string" },
                weight_lb: { type: "number" },
                body_fat_percent: { type: "number" },
                fat_mass_lb: { type: "number" },
                lean_mass_lb: { type: "number" },
                bmi: { type: ["number", "null"] },
                lean_mass_index: { type: ["number", "null"] },
                appendicular_lean_index: { type: ["number", "null"] },
                visceral_fat_mass_g: { type: ["number", "null"] },
                visceral_fat_area_cm2: { type: ["number", "null"] },
                android_fat_percent: { type: ["number", "null"] },
                gynoid_fat_percent: { type: ["number", "null"] },
                android_gynoid_ratio: { type: ["number", "null"] },
                trunk_limb_fat_ratio: { type: ["number", "null"] },
              },
              required: [
                "scan_date", "weight_lb", "body_fat_percent",
                "fat_mass_lb", "lean_mass_lb", "bmi",
                "lean_mass_index", "appendicular_lean_index",
                "visceral_fat_mass_g", "visceral_fat_area_cm2",
                "android_fat_percent", "gynoid_fat_percent",
                "android_gynoid_ratio", "trunk_limb_fat_ratio",
              ],
              additionalProperties: false,
            },
            segments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  segment: { type: "string" },
                  fat_mass_lb: { type: "number" },
                  lean_mass_lb: { type: "number" },
                  total_mass_lb: { type: "number" },
                  body_fat_percent: { type: "number" },
                },
                required: ["segment", "fat_mass_lb", "lean_mass_lb", "total_mass_lb", "body_fat_percent"],
                additionalProperties: false,
              },
            },
          },
          required: ["summary", "segments"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  });

  return JSON.parse(response.output_text) as ParsedDexaScan;
}