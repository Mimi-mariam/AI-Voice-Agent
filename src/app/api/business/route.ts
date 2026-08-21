import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/database";

export async function GET(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      description: true,
      phone: true,
      email: true,
      website: true,
      address: true,
      timezone: true,
      openingHours: true,
      humanHandoffNumber: true,
      vapiAssistantId: true,
      calApiKeyEncryptedOrSecureReference: true,
      calEventTypeId: true,
    }
  });

  return NextResponse.json(business);
}

export async function PUT(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const business = await prisma.business.update({
      where: { id: session.user.id },
      data: {
        ...body
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update business:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
