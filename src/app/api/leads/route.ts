import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/database";

export async function GET(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const callers = await prisma.caller.findMany({
    where: { businessId: session.user.id },
    orderBy: { id: "desc" },
    take: 50,
  });

  return NextResponse.json(callers);
}
