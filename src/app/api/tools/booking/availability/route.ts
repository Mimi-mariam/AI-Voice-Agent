import { NextResponse } from "next/server";
import prisma from "@/lib/database";
import { getCalAvailability } from "@/lib/cal";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;
    const args = message?.toolCall?.function?.arguments || {};
    const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;
    
    const { businessId, preferredDate, preferredTime, timezone } = parsedArgs;

    if (!businessId) {
      return NextResponse.json({ results: [{ toolCallId: message?.toolCall?.id, result: "Missing businessId" }] });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || !business.calApiKeyEncryptedOrSecureReference || !business.calEventTypeId) {
      return NextResponse.json({ results: [{ toolCallId: message?.toolCall?.id, result: "Cal.com not configured for this business." }] });
    }

    // Default to next 3 days if no preferredDate
    const start = preferredDate ? new Date(preferredDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 3);

    const availability = await getCalAvailability(
      business.calApiKeyEncryptedOrSecureReference,
      parseInt(business.calEventTypeId),
      start.toISOString(),
      end.toISOString()
    );

    return NextResponse.json({
      results: [
        {
          toolCallId: message?.toolCall?.id,
          result: JSON.stringify(availability),
        }
      ]
    });

  } catch (error: any) {
    console.error("Availability tool error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
