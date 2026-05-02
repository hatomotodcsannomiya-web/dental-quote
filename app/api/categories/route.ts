import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return Response.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, sortOrder } = body;
  const category = await prisma.category.create({
    data: { name, sortOrder: sortOrder ?? 0 },
  });
  return Response.json(category);
}
