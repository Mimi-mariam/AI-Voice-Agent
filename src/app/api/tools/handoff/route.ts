import { NextResponse } from "next/server";
import prisma from "@/lib/database";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;
    const args = message?.toolCall?.function?.arguments || {};
    const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;
    
    const { businessId, reason, callerName, callerPhone, summary } = parsedArgs;

    if (!businessId) {
      return NextResponse.json({ results: [{ toolCallId: message?.toolCall?.id, result: "Missing businessId" }] });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || !business.humanHandoffNumber) {
      return NextResponse.json({ results: [{ toolCallId: message?.toolCall?.id, result: "No human handoff number configured." }] });
    }

    // In a full implementation, you might save this handoff intent to the DB right away.
    // However, the actual call transfer is executed by returning a specific Vapi transfer directive,
    // OR we return success and let the AI say "Connecting you" followed by Vapi's built-in transfer mechanism.
    
    // For this custom tool, we will return the handoff number so the AI can execute the transfer,
    // or return a signal that allows the AI to use the transfer action.
    
    return NextResponse.json({
      results: [
        {
          toolCallId: message?.toolCall?.id,
          result: `Transfer authorized. Destination number: ${business.humanHandoffNumber}. Provide context to the human: ${summary}`,
        }
      ]
    });

  } catch (error: any) {
    console.error("Handoff tool error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
