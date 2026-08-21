import { NextResponse } from "next/server";
import prisma from "@/lib/database";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Vapi sends tool call arguments inside `message.toolCall.function.arguments`
    const { message } = body;
    const args = message?.toolCall?.function?.arguments || {};
    
    // Sometimes Vapi passes args as string, sometimes object
    const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;
    
    const { businessId, question } = parsedArgs;

    if (!businessId) {
      return NextResponse.json({ results: [{ toolCallId: message?.toolCall?.id, result: "Missing businessId" }] });
    }

    const knowledge = await prisma.knowledgeItem.findMany({
      where: { businessId },
      take: 10,
    });

    // In a real production app, you would use RAG / vector search here.
    // For MVP, we just return the full knowledge base or a simple text search.
    
    const relevantInfo = knowledge.map((k: { category: string; title: string; content: string }) => `${k.category} - ${k.title}: ${k.content}`).join("\n");

    return NextResponse.json({
      results: [
        {
          toolCallId: message?.toolCall?.id,
          result: relevantInfo || "No information found.",
        }
      ]
    });

  } catch (error: any) {
    console.error("Knowledge tool error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
