require('dotenv').config();

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = '8aeeacf6-77b4-443a-b77c-bf954ab24479';
const BASE_URL = 'https://ai-voice-agent-ruddy.vercel.app';
const BUSINESS_ID = '7fedb1ad-a4cb-4d86-90d2-0d52751400e6';

const tools = [
  {
    type: "function",
    function: {
      name: "getKnowledge",
      description: "Retrieves information from the business knowledge base about services, pricing, hours, or policies.",
      parameters: {
        type: "object",
        properties: {
          businessId: { type: "string", description: "The business ID" },
          question: { type: "string", description: "The caller's question" }
        },
        required: ["businessId", "question"]
      }
    },
    server: { url: `${BASE_URL}/api/tools/knowledge` }
  },
  {
    type: "function",
    function: {
      name: "saveCallerInfo",
      description: "Saves the caller's contact information and reason for calling.",
      parameters: {
        type: "object",
        properties: {
          businessId: { type: "string", description: "The business ID" },
          name: { type: "string", description: "Caller's full name" },
          phone: { type: "string", description: "Caller's phone number" },
          email: { type: "string", description: "Caller's email address" },
          serviceRequested: { type: "string", description: "The service they are interested in" },
          reasonForCall: { type: "string", description: "Why the caller is calling" }
        },
        required: ["businessId", "phone"]
      }
    },
    server: { url: `${BASE_URL}/api/tools/caller/save` }
  },
  {
    type: "function",
    function: {
      name: "createBooking",
      description: "Books an appointment for the caller using Cal.com.",
      parameters: {
        type: "object",
        properties: {
          businessId: { type: "string", description: "The business ID" },
          startTime: { type: "string", description: "The appointment start time in ISO 8601 format" },
          customerName: { type: "string", description: "The caller's full name" },
          customerEmail: { type: "string", description: "The caller's email address" },
          customerPhone: { type: "string", description: "The caller's phone number" },
          timezone: { type: "string", description: "The caller's timezone, e.g. America/New_York" },
          notes: { type: "string", description: "Any additional notes for the booking" }
        },
        required: ["businessId", "startTime", "customerName", "customerEmail"]
      }
    },
    server: { url: `${BASE_URL}/api/tools/booking/create` }
  },
  {
    type: "function",
    function: {
      name: "handoff",
      description: "Transfers the call to a human agent when the caller requests it or the issue is too complex.",
      parameters: {
        type: "object",
        properties: {
          businessId: { type: "string", description: "The business ID" },
          reason: { type: "string", description: "Reason for the handoff" },
          summary: { type: "string", description: "A brief summary of the conversation so far" }
        },
        required: ["businessId"]
      }
    },
    server: { url: `${BASE_URL}/api/tools/handoff` }
  }
];

const systemPrompt = `You are a professional AI receptionist for Mike's Business, a consulting firm.

Your business ID is: ${BUSINESS_ID}
Always pass this exact value as the "businessId" argument in every tool call you make.

## Your Role
You handle inbound calls professionally. You can:
1. Answer questions about the business using the getKnowledge tool
2. Book appointments using the createBooking tool
3. Save caller information using the saveCallerInfo tool
4. Transfer to a human agent using the handoff tool if needed

## How to Handle Calls
1. Greet the caller warmly (already done via First Message)
2. Listen to their needs
3. Use getKnowledge to answer any questions about services, pricing, hours, or policies
4. If they want to book: collect their name, email, phone, and preferred time, then use createBooking
5. Always save the caller's info using saveCallerInfo at the end of the call
6. If the caller is upset or the issue is too complex, use the handoff tool to transfer them

## Tone
- Professional, warm, and concise
- Never make up information — always use getKnowledge for business facts
- Keep responses short (this is a voice call, not a chat)`;

async function updateAssistant() {
  console.log('Updating Vapi assistant with tools and server URL...');

  const response = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: {
        provider: 'openai',
        model: 'gpt-4.1',
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        tools: tools,
      },
      serverUrl: `${BASE_URL}/api/webhooks/vapi`,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Failed to update assistant:', JSON.stringify(data, null, 2));
    return;
  }

  console.log('✅ Assistant updated successfully!');
  console.log('Tools configured:', data.model?.tools?.map(t => t.function?.name).join(', '));
  console.log('Server URL:', data.serverUrl);
}

updateAssistant().catch(console.error);
