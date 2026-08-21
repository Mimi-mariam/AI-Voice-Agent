import { NextResponse } from "next/server";
import prisma from "@/lib/database";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;
    
    // Vapi webhook messages have different types
    if (message.type === "end-of-call-report") {
      const callData = message.call;
      const transcript = message.transcript;
      const summary = message.summary;
      const vapiCallId = callData.id;
      
      // Determine the business this call belongs to
      // Usually passed via assistant overrides or server URL params.
      // For MVP, we will try to find the business using the assistantId
      const assistantId = callData.assistantId;
      
      const business = await prisma.business.findFirst({
        where: { vapiAssistantId: assistantId }
      });

      if (!business) {
        console.error("Webhook Error: No business found for assistant", assistantId);
        return NextResponse.json({ success: true }); // Acknowledge anyway
      }

      const customerNumber = callData.customer?.number || "";

      let caller = null;
      if (customerNumber) {
        caller = await prisma.caller.findUnique({
          where: { businessId_phone: { businessId: business.id, phone: customerNumber } }
        });
      }

      // Check if this call was already created (e.g., from call-started event)
      await prisma.call.upsert({
        where: { vapiCallId },
        create: {
          businessId: business.id,
          vapiCallId,
          callerId: caller?.id,
          phoneNumber: customerNumber,
          startedAt: new Date(callData.createdAt),
          endedAt: new Date(callData.endedAt),
          duration: Math.floor((new Date(callData.endedAt).getTime() - new Date(callData.createdAt).getTime()) / 1000),
          transcript,
          summary,
          outcome: callData.endedReason || "Completed",
        },
        update: {
          endedAt: new Date(callData.endedAt),
          duration: Math.floor((new Date(callData.endedAt).getTime() - new Date(callData.createdAt).getTime()) / 1000),
          transcript,
          summary,
          outcome: callData.endedReason || "Completed",
        }
      });
    }

    // You can handle other event types here (e.g., call-started, tool-calls)

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Vapi webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
