import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.labOrder.findUnique({
    where: { id: Number(id) },
    include: { laboratory: true, patient: true },
  });
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { laboratoryId, doctorName, orderDate, dueDate, note, items, depositItems } = await req.json();

  const order = await prisma.labOrder.update({
    where: { id: Number(id) },
    data: {
      ...(laboratoryId !== undefined && { laboratoryId: laboratoryId ?? null }),
      ...(doctorName !== undefined && { doctorName }),
      ...(orderDate !== undefined && { orderDate }),
      ...(dueDate !== undefined && { dueDate }),
      ...(note !== undefined && { note: note?.trim() || null }),
      ...(items !== undefined && { items: JSON.stringify(items) }),
      ...(depositItems !== undefined && { depositItems: JSON.stringify(depositItems) }),
    },
    include: { laboratory: true },
  });
  return Response.json(order);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.labOrder.delete({ where: { id: Number(id) } });
  return Response.json({ ok: true });
}
