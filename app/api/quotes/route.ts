import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { patientName, memo, items } = body;

  const quote = await prisma.quote.create({
    data: {
      patientName,
      memo,
      items: {
        create: items.map((item: {
          treatmentId: number;
          toothLabel: string;
          quantity: number;
          unitPrice: number;
        }) => ({
          treatmentId: item.treatmentId,
          toothLabel: item.toothLabel,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: {
      items: {
        include: { treatment: { include: { category: true } } },
      },
    },
  });

  return Response.json(quote);
}

export async function GET() {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      items: { include: { treatment: true } },
    },
  });
  return Response.json(quotes);
}
