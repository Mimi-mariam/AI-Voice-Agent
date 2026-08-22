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
    const { businessId, question } = parsedArgs;

    if (!businessId) {
      return NextResponse.json({ results: [{ toolCallId: messageId, result: "Missing businessId" }] });
    }

    const knowledge = await prisma.knowledgeItem.findMany({
      where: { businessId },
      take: 10,
    });
    
    const relevantInfo = knowledge.map((k: { category: string; title: string; content: string }) => `${k.category} - ${k.title}: ${k.content}`).join("\n");

    return NextResponse.json({
      results: [
        {
          toolCallId: messageId,
          result: relevantInfo || "No information found.",
        }
      ]
    });

  } catch (error: any) {
    console.error("Knowledge tool error:", error);
    return NextResponse.json({ 
      results: [
        {
          toolCallId: messageId,
          result: `Error retrieving knowledge: ${error.message}`
        }
      ]
    });
  }
}
