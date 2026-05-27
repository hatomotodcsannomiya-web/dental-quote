import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const doctors = await prisma.doctor.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return Response.json(doctors);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return Response.json({ error: "担当医名は必須です" }, { status: 400 });
  }

  const maxOrder = await prisma.doctor.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const doctor = await prisma.doctor.create({
    data: { name: name.trim(), sortOrder },
  });
  return Response.json(doctor, { status: 201 });
}
