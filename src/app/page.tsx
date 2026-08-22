import prisma from "@/lib/database";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const business = await prisma.business.findFirst({
    where: { slug: { not: null } },
    orderBy: { createdAt: "asc" },
  });

  if (business?.slug) {
    redirect(`/book/${business.slug}`);
  }

  redirect("/login");
}
