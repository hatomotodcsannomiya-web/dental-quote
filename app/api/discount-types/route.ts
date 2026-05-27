import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const types = await prisma.discountType.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return Response.json(types);
}

export async function POST(req: NextRequest) {
  const { name, discountPercent } = await req.json();
  if (!name?.trim()) return Response.json({ error: "割引名は必須です" }, { status: 400 });
  if (discountPercent == null || discountPercent <= 0 || discountPercent > 100) {
    return Response.json({ error: "割引率は1〜100の整数で入力してください" }, { status: 400 });
  }

  const maxOrder = await prisma.discountType.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const type = await prisma.discountType.create({
    data: { name: name.trim(), discountPercent: Math.round(discountPercent), sortOrder },
  });
  return Response.json(type, { status: 201 });
}
