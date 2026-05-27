import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const materials = await prisma.labMaterial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return Response.json(materials);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return Response.json({ error: "素材名は必須です" }, { status: 400 });
  }

  const maxOrder = await prisma.labMaterial.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const material = await prisma.labMaterial.create({
    data: { name: name.trim(), sortOrder },
  });
  return Response.json(material, { status: 201 });
}
