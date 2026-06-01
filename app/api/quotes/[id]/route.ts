import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { memo } = await req.json();
  const quote = await prisma.quote.update({
    where: { id: Number(id) },
    data: { memo: memo ?? null },
  });
  return Response.json(quote);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.quote.delete({ where: { id: Number(id) } });
  return Response.json({ ok: true });
}
