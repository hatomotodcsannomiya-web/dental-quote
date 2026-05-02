export const runtime = "nodejs";

import { renderToBuffer, Font } from "@react-pdf/renderer";
import { createElement } from "react";
import QuotePDFDoc from "@/components/QuotePDFDoc";
import type { QuoteLineItem } from "@/lib/types";
import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";

// フォントをBuffer経由でbase64登録
let fontRegistered = false;
function ensureFont() {
  if (fontRegistered) return;
  const fontPath = path.join(process.cwd(), "public/fonts/ArialUnicode.ttf");
  const fontBuffer = fs.readFileSync(fontPath);
  // data: URL経由でfontkit.createに渡す（@react-pdf/fontのisDataUrlルート）
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

    const { items, createdAt } = await req.json() as {
      items: QuoteLineItem[];
      createdAt: string;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = createElement(QuotePDFDoc as any, { items, createdAt });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer: Buffer = await renderToBuffer(element as any);

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="mitsumori.pdf"`,
      },
    });
  } catch (e) {
    console.error("PDF error:", e instanceof Error ? e.stack : e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
