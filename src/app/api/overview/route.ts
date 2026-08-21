import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/database";

export async function GET(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businessId = session.user.id;

  const [callsCount, appointmentsCount, leadsCount] = await Promise.all([
    prisma.call.count({ where: { businessId } }),
    prisma.appointment.count({ where: { businessId } }),
    prisma.caller.count({ where: { businessId } }),
  ]);

  return NextResponse.json({
    totalCalls: callsCount,
    appointments: appointmentsCount,
    totalLeads: leadsCount,
  });
}
