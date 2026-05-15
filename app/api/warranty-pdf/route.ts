export const runtime = "nodejs";

import { renderToBuffer, Font } from "@react-pdf/renderer";
import { createElement } from "react";
import WarrantyPDFDoc from "@/components/WarrantyPDFDoc";
import { filterWarrantyItems } from "@/lib/warrantyMap";
import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";

let fontRegistered = false;
function ensureFont() {
  if (fontRegistered) return;
  const fontPath = path.join(process.cwd(), "public/fonts/ArialUnicode.ttf");
  const fontBuffer = fs.readFileSync(fontPath);
  const b64 = fontBuffer.toString("base64");
  Font.register({
    family: "NotoSansJP",
    src: `data:font/truetype;base64,${b64}`,
  });
  fontRegistered = true;
}

export async function POST(req: NextRequest) {
  try {
    ensureFont();

    const { patientName, patientCode, issuedDate, treatmentDate, items } = await req.json() as {
      patientName: string;
      patientCode: string;
      issuedDate: string;
      treatmentDate: string;
      items: { toothLabel: string; treatmentName: string }[];
    };

    const warrantyItems = filterWarrantyItems(items);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = createElement(WarrantyPDFDoc as any, {
      patientName,
      patientCode,
      issuedDate,
      treatmentDate,
      items: warrantyItems,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer: Buffer = await renderToBuffer(element as any);

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="hosho.pdf"`,
      },
    });
  } catch (e) {
    console.error("Warranty PDF error:", e instanceof Error ? e.stack : e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
