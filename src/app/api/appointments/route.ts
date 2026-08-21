import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/database";

export async function GET(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { businessId: session.user.id },
    include: {
      caller: true,
    },
    orderBy: { startTime: "asc" },
    take: 50,
  });

  return NextResponse.json(appointments);
}
