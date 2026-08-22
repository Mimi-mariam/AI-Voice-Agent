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

  const [business, callsCount, appointmentsCount, leadsCount] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId } }),
    prisma.call.count({ where: { businessId } }),
    prisma.appointment.count({ where: { businessId } }),
    prisma.caller.count({ where: { businessId } }),
  ]);

  return NextResponse.json({
    businessName: business?.name || "My Business",
    slug: business?.slug || "mikes-business",
    totalCalls: callsCount,
    appointments: appointmentsCount,
    totalLeads: leadsCount,
  });
}
