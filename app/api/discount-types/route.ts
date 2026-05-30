import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const types = await prisma.discountType.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return Response.json(types);
}

export async function POST(req: NextRequest) {
  const { name, discountPercent, discountAmount } = await req.json();
  if (!name?.trim()) return Response.json({ error: "割引名は必須です" }, { status: 400 });

  const pct = Number(discountPercent ?? 0);
  const amt = Number(discountAmount ?? 0);
  if (pct <= 0 && amt <= 0) {
    return Response.json({ error: "割引率または割引額を入力してください" }, { status: 400 });
  }
  if (pct > 0 && (pct > 100)) {
    return Response.json({ error: "割引率は1〜100で入力してください" }, { status: 400 });
  }

  const maxOrder = await prisma.discountType.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const type = await prisma.discountType.create({
    data: { name: name.trim(), discountPercent: Math.round(pct), discountAmount: Math.round(amt), sortOrder },
  });
  return Response.json(type, { status: 201 });
}
