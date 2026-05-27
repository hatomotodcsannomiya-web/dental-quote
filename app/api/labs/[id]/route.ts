import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, tel, address, isActive } = await req.json();

  const lab = await prisma.labLaboratory.update({
    where: { id: Number(id) },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(tel !== undefined && { tel: tel?.trim() || null }),
      ...(address !== undefined && { address: address?.trim() || null }),
      ...(isActive !== undefined && { isActive }),
    },
  });
  return Response.json(lab);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.labLaboratory.delete({ where: { id: Number(id) } });
  return Response.json({ ok: true });
}
