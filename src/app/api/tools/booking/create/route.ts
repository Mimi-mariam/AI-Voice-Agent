import { NextResponse } from "next/server";
import prisma from "@/lib/database";
import { createCalBooking } from "@/lib/cal";

export async function POST(req: Request) {
  let messageId = "unknown";
  try {
    const body = await req.json();
    const { message } = body;
    
    // Support multiple Vapi payload formats
    const toolCallList = message?.toolWithToolCallList || message?.toolCallList || [];
    const toolCall = message?.toolCall || toolCallList[0]?.toolCall;
    const args = toolCall?.function?.arguments || {};
    messageId = toolCall?.id || "unknown";
    
    const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;
    
    const { businessId, startTime, customerName, customerEmail, customerPhone, timezone, notes } = parsedArgs;

    if (!businessId || !startTime || !customerName || !customerEmail) {
      return NextResponse.json({ results: [{ toolCallId: messageId, result: "Missing required booking details (startTime, customerName, customerEmail)." }] });
    }

    let business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      // Fallback for MVP: If Vapi sends a hardcoded/wrong ID, just grab the first business
      business = await prisma.business.findFirst();
    }

    if (!business) {
      return NextResponse.json({ results: [{ toolCallId: messageId, result: "Business not found." }] });
    }

    const parsedDate = new Date(startTime);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ 
        results: [{ 
          toolCallId: messageId, 
          result: "Invalid startTime format. You must provide a full date and time, like '2026-08-28T10:00:00Z'. Please re-confirm the exact date and time with the user." 
        }] 
      });
    }

    let calBookingId = "mock-id-123";

    if (!business.calApiKeyEncryptedOrSecureReference || !business.calEventTypeId) {
      console.log("Mocking booking since Cal.com is not configured.");
    } else {
      const booking = await createCalBooking(
        business.calApiKeyEncryptedOrSecureReference,
        parseInt(business.calEventTypeId),
        startTime,
        customerName,
        customerEmail,
        timezone || "UTC",
        notes
      );
      calBookingId = booking.data?.id?.toString() || booking.id?.toString();
    }

    let caller = await prisma.caller.findUnique({
      where: { businessId_phone: { businessId: business.id, phone: customerPhone || "" } }
    });

    if (!caller && customerPhone) {
      caller = await prisma.caller.create({
        data: {
          businessId: business.id,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          status: "Booked"
        }
      });
    }

    await prisma.appointment.create({
      data: {
        businessId: business.id,
        callerId: caller?.id,
        calBookingId: calBookingId,
        startTime: parsedDate,
        endTime: new Date(parsedDate.getTime() + 30 * 60000),
        timezone: timezone || "UTC",
        status: "Confirmed",
      }
    });

    return NextResponse.json({
      results: [
        {
          toolCallId: messageId,
          result: `Booking confirmed successfully for ${startTime}.`,
        }
      ]
    });

  } catch (error: any) {
    console.error("Booking tool error:", error);
    return NextResponse.json({ 
      results: [
        {
          toolCallId: messageId,
          result: `Failed to book appointment: ${error.message}. Please ask the user for another time.`
        }
      ]
    });
  }
}
