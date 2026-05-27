export const runtime = "nodejs";

import { renderToBuffer, Font } from "@react-pdf/renderer";
import { createElement } from "react";
import LabOrderPDFDoc from "@/components/LabOrderPDFDoc";
import type { LabOrderItem } from "@/components/LabOrderPDFDoc";
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

    const {
      patientName,
      patientCode,
      laboratoryName,
      doctorName,
      orderDate,
      dueDate,
      note,
      items,
      createdAt,
    } = await req.json() as {
      patientName: string;
      patientCode: string;
      laboratoryName: string;
      doctorName: string;
      orderDate: string;
      dueDate: string;
      note: string;
      items: LabOrderItem[];
      createdAt: string;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = createElement(LabOrderPDFDoc as any, {
      patientName,
      patientCode,
      laboratoryName,
      doctorName,
      orderDate,
      dueDate,
      note,
      items,
      createdAt,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer: Buffer = await renderToBuffer(element as any);

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="gikoshijisho.pdf"`,
      },
    });
  } catch (e) {
    console.error("Lab PDF error:", e instanceof Error ? e.stack : e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
