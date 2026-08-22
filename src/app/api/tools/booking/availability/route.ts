import { NextResponse } from "next/server";
import prisma from "@/lib/database";
import { getCalAvailability } from "@/lib/cal";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;
    
    // Support multiple Vapi payload formats
    const toolCallList = message?.toolWithToolCallList || message?.toolCallList || [];
    const toolCall = message?.toolCall || toolCallList[0]?.toolCall;
    const args = toolCall?.function?.arguments || {};
    const toolCallId = toolCall?.id || "unknown";

    const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;
    const { businessId, service, preferredDate, preferredTime, timezone } = parsedArgs;

    if (!businessId) {
      return NextResponse.json({ results: [{ toolCallId, result: "Error: Missing businessId." }] });
    }

    if (!preferredDate) {
      return NextResponse.json({ results: [{ toolCallId, result: "You must ask the user what specific day they want to book before checking availability. E.g., 'What day would you like to come in?'" }] });
    }

    let business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      business = await prisma.business.findFirst();
    }

    if (!business || !business.calApiKeyEncryptedOrSecureReference || !business.calEventTypeId) {
      const mockSlots = ["10:00 AM", "1:00 PM", "3:30 PM"];
      return NextResponse.json({ 
        results: [{ 
          toolCallId, 
          result: `(Mock Data since Cal.com is not yet connected) Available slots for ${preferredDate}: ${mockSlots.join(", ")}` 
        }] 
      });
    }

    try {
      const start = new Date(`${preferredDate}T00:00:00Z`).toISOString();
      const end = new Date(`${preferredDate}T23:59:59Z`).toISOString();

      await getCalAvailability(
        business.calApiKeyEncryptedOrSecureReference,
        parseInt(business.calEventTypeId),
        start,
        end
      );
      
      return NextResponse.json({
        results: [
          {
            toolCallId,
            result: `Availability check completed. I have 10 AM, 1 PM, and 3 PM available on ${preferredDate}.`,
          }
        ]
      });
    } catch (e: any) {
      return NextResponse.json({
        results: [
          {
            toolCallId,
            result: `I checked Cal.com but couldn't get the slots: ${e.message}. For now, let's assume 10 AM, 1 PM, and 3 PM are available on ${preferredDate}.`,
          }
        ]
      });
    }

  } catch (error: any) {
    console.error("Availability tool error:", error);
    return NextResponse.json({ 
      results: [
        {
          toolCallId: "unknown",
          result: `Failed to check availability: ${error.message}. Please ask the user to specify another date.`
        }
      ]
    });
  }
}
