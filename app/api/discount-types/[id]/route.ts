import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, discountPercent, discountAmount, isActive } = await req.json();

  const type = await prisma.discountType.update({
    where: { id: Number(id) },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(discountPercent !== undefined && { discountPercent: Math.round(Number(discountPercent)) }),
      ...(discountAmount !== undefined && { discountAmount: Math.round(Number(discountAmount)) }),
      ...(isActive !== undefined && { isActive }),
    },
  });
  return Response.json(type);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.discountType.delete({ where: { id: Number(id) } });
  return Response.json({ ok: true });
}
