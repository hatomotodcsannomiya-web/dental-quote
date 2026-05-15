export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { renderToBuffer, Font } from "@react-pdf/renderer";
import { createElement } from "react";
import WarrantyPDFDoc from "@/components/WarrantyPDFDoc";
import { type WarrantyItem } from "@/lib/warrantyMap";
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const warranty = await prisma.warranty.findUnique({ where: { id: Number(id) } });
  if (!warranty) return Response.json({ error: "Not found" }, { status: 404 });

  try {
    ensureFont();
    const items = JSON.parse(warranty.items) as WarrantyItem[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = createElement(WarrantyPDFDoc as any, {
      patientName: warranty.patientName,
      patientCode: warranty.patientCode,
      issuedDate: warranty.issuedDate,
      items,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer: Buffer = await renderToBuffer(element as any);

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="hosho_${id}.pdf"`,
      },
    });
  } catch (e) {
    console.error("Warranty PDF error:", e instanceof Error ? e.stack : e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
