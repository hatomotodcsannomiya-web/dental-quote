import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const TAX_RATE = 0.1;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { patientName, patientId, memo, items } = body;

  const subtotal: number = items.reduce((sum: number, item: { unitPrice: number; quantity: number }) => sum + item.unitPrice * item.quantity, 0);
  const tax = Math.floor(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const quote = await prisma.quote.create({
    data: {
      patientName,
      patientId: patientId || null,
      memo: memo || null,
      subtotal,
      tax,
      total,
      items: {
        create: items.map((item: {
          treatmentId: number;
          toothLabel: string;
          quantity: number;
          unitPrice: number;
        }) => ({
          treatmentId: item.treatmentId,
          toothLabel: item.toothLabel,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: {
      items: {
        include: { treatment: { include: { category: true } } },
      },
    },
  });

  return Response.json(quote);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");
  const patientName = searchParams.get("patientName");

  const quotes = await prisma.quote.findMany({
    where: {
      ...(patientId ? { patientId: { contains: patientId } } : {}),
      ...(patientName ? { patientName: { contains: patientName } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      items: {
        include: { treatment: { include: { category: true } } },
      },
    },
  });
  return Response.json(quotes);
}
