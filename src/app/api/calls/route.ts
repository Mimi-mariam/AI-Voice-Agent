import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/database";

export async function GET(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const calls = await prisma.call.findMany({
    where: { businessId: session.user.id },
    orderBy: { startedAt: "desc" },
    take: 50, // MVP limit
  });

  return NextResponse.json(calls);
}
