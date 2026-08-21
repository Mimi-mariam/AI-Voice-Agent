import { NextResponse } from "next/server";
import prisma from "@/lib/database";
import { createCalBooking } from "@/lib/cal";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;
    const args = message?.toolCall?.function?.arguments || {};
    const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;
    
    const { businessId, startTime, customerName, customerEmail, customerPhone, timezone, notes } = parsedArgs;

    if (!businessId || !startTime || !customerName || !customerEmail) {
      return NextResponse.json({ results: [{ toolCallId: message?.toolCall?.id, result: "Missing required booking details (businessId, startTime, customerName, customerEmail)." }] });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || !business.calApiKeyEncryptedOrSecureReference || !business.calEventTypeId) {
      return NextResponse.json({ results: [{ toolCallId: message?.toolCall?.id, result: "Cal.com not configured for this business." }] });
    }

    const booking = await createCalBooking(
      business.calApiKeyEncryptedOrSecureReference,
      parseInt(business.calEventTypeId),
      startTime,
      customerName,
      customerEmail,
      timezone || "UTC",
      notes
    );

    // Store caller/lead if doesn't exist
    let caller = await prisma.caller.findUnique({
      where: { businessId_phone: { businessId, phone: customerPhone || "" } }
    });

    if (!caller && customerPhone) {
      caller = await prisma.caller.create({
        data: {
          businessId,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          status: "Booked"
        }
      });
    }

    // Store appointment
    await prisma.appointment.create({
      data: {
        businessId,
        callerId: caller?.id,
        calBookingId: booking.id?.toString(),
        startTime: new Date(startTime),
        endTime: new Date(new Date(startTime).getTime() + 30 * 60000), // Default 30 min if cal doesn't return end time
        timezone: timezone || "UTC",
        status: "Confirmed",
      }
    });

    return NextResponse.json({
      results: [
        {
          toolCallId: message?.toolCall?.id,
          result: `Booking confirmed successfully for ${startTime}.`,
        }
      ]
    });

  } catch (error: any) {
    console.error("Booking tool error:", error);
    return NextResponse.json({ 
      results: [
        {
          toolCallId: (await req.json()).message?.toolCall?.id,
          result: `Failed to book appointment: ${error.message}. Please ask the user for another time.`
        }
      ]
    });
  }
}
