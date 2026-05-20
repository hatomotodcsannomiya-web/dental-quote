import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; optionId: string }> }) {
  const { optionId } = await params;
  const { name, price } = await req.json();
  const option = await prisma.treatmentOption.update({
    where: { id: Number(optionId) },
    data: { name, price },
  });
  return Response.json(option);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; optionId: string }> }) {
  const { optionId } = await params;
  await prisma.treatmentOption.delete({ where: { id: Number(optionId) } });
  return Response.json({ ok: true });
}
