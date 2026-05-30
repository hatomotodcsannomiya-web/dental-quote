import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const items: { id: number; sortOrder: number }[] = await req.json();
  await Promise.all(
    items.map(({ id, sortOrder }) =>
      prisma.labMaterial.update({ where: { id }, data: { sortOrder } })
    )
  );
  return Response.json({ ok: true });
}
