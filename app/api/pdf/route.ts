import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import QuotePDFDoc from "@/components/QuotePDFDoc";
import type { QuoteLineItem } from "@/lib/types";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
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
}
