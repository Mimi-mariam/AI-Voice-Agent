import { NextResponse } from "next/server";
import prisma from "@/lib/database";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;
    const args = message?.toolCall?.function?.arguments || {};
    const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;
    
    const { businessId, name, phone, email, reasonForCall, serviceRequested } = parsedArgs;

    if (!businessId || !phone) {
      return NextResponse.json({ results: [{ toolCallId: message?.toolCall?.id, result: "Missing businessId or phone" }] });
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
          toolCallId: message?.toolCall?.id,
          result: `Caller saved successfully. ID: ${caller.id}`,
        }
      ]
    });

  } catch (error: any) {
    console.error("Caller save tool error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
