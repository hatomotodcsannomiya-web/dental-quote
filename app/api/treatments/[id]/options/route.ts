import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const options = await prisma.treatmentOption.findMany({
    where: { treatmentId: Number(id) },
    orderBy: { sortOrder: "asc" },
  });
  return Response.json(options);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, price, sortOrder } = await req.json();
  const option = await prisma.treatmentOption.create({
    data: { treatmentId: Number(id), name, price, sortOrder: sortOrder ?? 0 },
  });
  return Response.json(option);
}
