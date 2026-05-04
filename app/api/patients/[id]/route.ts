import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id: Number(id) },
    include: {
      quotes: {
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { treatment: { include: { category: true } } } },
        },
      },
    },
  });
  if (!patient) return Response.json({ error: "患者が見つかりません" }, { status: 404 });
  return Response.json(patient);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, memo } = await req.json();
  const patient = await prisma.patient.update({
    where: { id: Number(id) },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(memo !== undefined && { memo: memo?.trim() || null }),
    },
  });
  return Response.json(patient);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);

  // 紐づく見積の患者リンクを解除してから患者を削除
  await prisma.quote.updateMany({
    where: { patientFkId: numId },
    data: { patientFkId: null },
  });
  await prisma.patient.delete({ where: { id: numId } });

  return Response.json({ ok: true });
}
