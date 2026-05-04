import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const patients = await prisma.patient.findMany({
    where: q
      ? {
          OR: [
            { code: { contains: q } },
            { name: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { quotes: true } } },
  });
  return Response.json(patients);
}

export async function POST(req: NextRequest) {
  const { code, name, memo } = await req.json();
  if (!code || !name) {
    return Response.json({ error: "患者番号と氏名は必須です" }, { status: 400 });
  }
  try {
    const patient = await prisma.patient.create({
      data: { code: code.trim(), name: name.trim(), memo: memo?.trim() || null },
    });
    return Response.json(patient, { status: 201 });
  } catch {
    return Response.json({ error: "この患者番号は既に使用されています" }, { status: 409 });
  }
}
