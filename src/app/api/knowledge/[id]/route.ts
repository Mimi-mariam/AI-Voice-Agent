import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/database";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure the user owns this knowledge item
  const existingItem = await prisma.knowledgeItem.findUnique({
    where: { id: (await params).id },
  });

  if (!existingItem || existingItem.businessId !== session.user.id) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  await prisma.knowledgeItem.delete({
    where: { id: (await params).id },
  });

  return NextResponse.json({ success: true });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingItem = await prisma.knowledgeItem.findUnique({
    where: { id: (await params).id },
  });

  if (!existingItem || existingItem.businessId !== session.user.id) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  const body = await req.json();
  const { title, content, category } = body;

  const item = await prisma.knowledgeItem.update({
    where: { id: (await params).id },
    data: {
      title,
      content,
      category,
    },
  });

  return NextResponse.json(item);
}
