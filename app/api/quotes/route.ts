import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const TAX_RATE = 0.1;

interface ItemInput {
  treatmentId: number | null;
  treatmentName?: string;
  toothLabel: string;
  quantity: number;
  unitPrice: number;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { patientName, patientId, patientFkId, memo, items } = body;

  const subtotal: number = items.reduce((sum: number, item: ItemInput) => sum + item.unitPrice * item.quantity, 0);
  const tax = Math.floor(subtotal * TAX_RATE);
  const total = subtotal + tax;

  let resolvedPatientFkId: number | null = patientFkId ?? null;
  if (!resolvedPatientFkId && patientId) {
    const patient = await prisma.patient.upsert({
      where: { code: patientId },
      update: {},
      create: { code: patientId, name: patientName || patientId },
    });
    resolvedPatientFkId = patient.id;
  }

  const quote = await prisma.quote.create({
    data: {
      patientName,
      patientId: patientId || null,
      patientFkId: resolvedPatientFkId,
      memo: memo || null,
      subtotal,
      tax,
      total,
      items: {
        create: items.map((item: ItemInput) => ({
          treatmentId: item.treatmentId ?? null,
          treatmentName: item.treatmentName ?? "",
          toothLabel: item.toothLabel,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: {
      items: { include: { treatment: { include: { category: true } } } },
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
