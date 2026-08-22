import prisma from "@/lib/database";
import { notFound } from "next/navigation";
import BookingClient from "./BookingClient";

export default async function BookingPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const business = await prisma.business.findUnique({
    where: { slug: params.slug },
    include: { knowledgeBase: true },
  });

  if (!business) {
    notFound();
  }

  const services = business.knowledgeBase.filter(k => k.category === "SERVICE");
  const faqs = business.knowledgeBase.filter(k => k.category === "FAQ");

  return (
    <main className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-rose-200">
      <BookingClient 
        business={business} 
        services={services} 
        faqs={faqs} 
      />
    </main>
  );
}
