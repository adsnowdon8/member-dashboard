import { type NextRequest } from "next/server";
import PDFParser from "pdf2json";
import { auth } from "@/lib/auth";
import { parseDexaText } from "@/lib/parse-dexa";
import { getLatestScan, insertDexaScan } from "@/lib/insert-dexa";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const pdfParser = new PDFParser(null, true);

  const rawText = await new Promise<string>((resolve, reject) => {
    pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
    pdfParser.on("pdfParser_dataError", reject);
    pdfParser.parseBuffer(fileBuffer);
  });

  const scan = parseDexaText(rawText);
  const scanId = await insertDexaScan(scan, session.user.id);

  return Response.json({ scanId });
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  const scan = await getLatestScan(session.user.id);
  return Response.json(scan);
}
