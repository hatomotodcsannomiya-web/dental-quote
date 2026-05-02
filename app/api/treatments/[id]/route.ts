import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, categoryId, priceType, unitPrice, unit, isActive, sortOrder } = body;
  const treatment = await prisma.treatment.update({
    where: { id: Number(id) },
    data: { name, categoryId, priceType, unitPrice, unit, isActive, sortOrder },
  });
  return Response.json(treatment);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.treatment.delete({ where: { id: Number(id) } });
  return Response.json({ success: true });
}
