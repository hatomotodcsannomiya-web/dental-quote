import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      treatments: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          options: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });
  return Response.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, categoryId, priceType, unitPrice, unit, sortOrder } = body;
  const treatment = await prisma.treatment.create({
    data: { name, categoryId, priceType, unitPrice, unit, sortOrder },
  });
  return Response.json(treatment);
}
