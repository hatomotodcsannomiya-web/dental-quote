import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const items = await prisma.labProsthetic.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return Response.json(items);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return Response.json({ error: "補綴装置名は必須です" }, { status: 400 });
  }

  const maxOrder = await prisma.labProsthetic.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const item = await prisma.labProsthetic.create({
    data: { name: name.trim(), sortOrder },
  });
  return Response.json(item, { status: 201 });
}
