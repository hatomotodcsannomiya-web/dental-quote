import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");

  const orders = await prisma.labOrder.findMany({
    where: patientId ? { patientId: Number(patientId) } : undefined,
    include: { laboratory: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(orders);
}

export async function POST(req: NextRequest) {
  const {
    patientId,
    quoteId,
    laboratoryId,
    patientName,
    patientCode,
    doctorName,
    orderDate,
    dueDate,
    note,
    items,
  } = await req.json();

  const order = await prisma.labOrder.create({
    data: {
      patientId: patientId ?? null,
      quoteId: quoteId ?? null,
      laboratoryId: laboratoryId ?? null,
      patientName,
      patientCode,
      doctorName: doctorName ?? "",
      orderDate,
      dueDate,
      note: note?.trim() || null,
      items: JSON.stringify(items),
    },
    include: { laboratory: true },
  });
  return Response.json(order, { status: 201 });
}
