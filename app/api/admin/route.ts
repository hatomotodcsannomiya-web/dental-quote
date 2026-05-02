import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const settings = await prisma.adminSettings.findUnique({ where: { id: 1 } });

  if (!settings) {
    const defaultPassword = process.env.ADMIN_PASSWORD ?? "admin1234";
    const hash = await bcrypt.hash(defaultPassword, 10);
    await prisma.adminSettings.create({ data: { id: 1, password: hash } });
    const match = await bcrypt.compare(password, hash);
    return Response.json({ success: match });
  }

  const match = await bcrypt.compare(password, settings.password);
  return Response.json({ success: match });
}

export async function PUT(req: NextRequest) {
  const { currentPassword, newPassword } = await req.json();
  const settings = await prisma.adminSettings.findUnique({ where: { id: 1 } });
  if (!settings) return Response.json({ success: false }, { status: 400 });

  const match = await bcrypt.compare(currentPassword, settings.password);
  if (!match) return Response.json({ success: false, error: "現在のパスワードが違います" }, { status: 401 });

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.adminSettings.update({ where: { id: 1 }, data: { password: hash } });
  return Response.json({ success: true });
}
