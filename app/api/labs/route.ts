import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const labs = await prisma.labLaboratory.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return Response.json(labs);
}

export async function POST(req: NextRequest) {
  const { name, tel, address } = await req.json();
  if (!name?.trim()) {
    return Response.json({ error: "技工所名は必須です" }, { status: 400 });
  }

  const maxOrder = await prisma.labLaboratory.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const lab = await prisma.labLaboratory.create({
    data: { name: name.trim(), tel: tel?.trim() || null, address: address?.trim() || null, sortOrder },
  });
  return Response.json(lab, { status: 201 });
}
