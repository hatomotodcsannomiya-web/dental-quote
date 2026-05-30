import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const items = await prisma.depositItemMaster.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return Response.json(items);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return Response.json({ error: "項目名は必須です" }, { status: 400 });
  }

  const maxOrder = await prisma.depositItemMaster.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const item = await prisma.depositItemMaster.create({
    data: { name: name.trim(), sortOrder },
  });
  return Response.json(item, { status: 201 });
}
