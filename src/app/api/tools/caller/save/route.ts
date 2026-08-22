import { NextResponse } from "next/server";
import prisma from "@/lib/database";

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
    const { businessId, name, phone, email, reasonForCall, serviceRequested } = parsedArgs;

    if (!businessId || !phone) {
      return NextResponse.json({ results: [{ toolCallId: messageId, result: "Missing businessId or phone" }] });
    }

    let caller = await prisma.caller.findUnique({
      where: { businessId_phone: { businessId, phone } }
    });

    if (caller) {
      caller = await prisma.caller.update({
        where: { id: caller.id },
        data: {
          name: name || caller.name,
          email: email || caller.email,
          serviceRequested: serviceRequested || caller.serviceRequested,
          notes: reasonForCall ? `${caller.notes || ''}\nReason for call: ${reasonForCall}` : caller.notes,
        }
      });
    } else {
      caller = await prisma.caller.create({
        data: {
          businessId,
          name,
          phone,
          email,
          serviceRequested,
          notes: reasonForCall ? `Reason for call: ${reasonForCall}` : "",
        }
      });
    }

    return NextResponse.json({
      results: [
        {
          toolCallId: messageId,
          result: `Caller saved successfully. ID: ${caller.id}`,
        }
      ]
    });

  } catch (error: any) {
    console.error("Caller save tool error:", error);
    return NextResponse.json({ 
      results: [
        {
          toolCallId: messageId,
          result: `Error saving caller: ${error.message}`
        }
      ]
    });
  }
}
