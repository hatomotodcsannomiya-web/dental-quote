import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");

  const warranties = await prisma.warranty.findMany({
    where: patientId ? { patientId: Number(patientId) } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return Response.json(warranties);
}

export async function POST(req: NextRequest) {
  const { patientId, quoteId, patientName, patientCode, issuedDate, items } = await req.json();

  const warranty = await prisma.warranty.create({
    data: {
      patientId: patientId ?? null,
      quoteId: quoteId ?? null,
      patientName,
      patientCode,
      issuedDate,
      items: JSON.stringify(items),
    },
  });

  return Response.json(warranty);
}
