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
      name: "get_available_appointments",
      description: "Checks real availability for appointments on Cal.com.",
      parameters: {
        type: "object",
        properties: {
          businessId: { type: "string", description: "The business ID" },
          service: { type: "string", description: "The requested service" },
          preferredDate: { type: "string", description: "The preferred date in YYYY-MM-DD format" },
          preferredTime: { type: "string", description: "The preferred time, if any" },
          timezone: { type: "string", description: "The caller's timezone, e.g. America/New_York" }
        },
        required: ["businessId", "preferredDate"]
      }
    },
    server: { url: `${BASE_URL}/api/tools/booking/availability` }
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

const systemPrompt = `You are a professional AI Assistant for Luxe Hair Studio.

Your business ID is: ${BUSINESS_ID}
Always pass this exact value as the "businessId" argument in every tool call you make.

Today's current date and time is: {{date}} {{time}}. 
IMPORTANT: Always use this current date to accurately determine what "today", "tomorrow", or "next Monday" means before calling the availability tool!

## Your Role
You handle customer inquiries and bookings professionally. You can:
1. Answer questions about the business using the getKnowledge tool
2. Check real availability using the get_available_appointments tool
3. Book appointments using the createBooking tool
4. Save caller information using the saveCallerInfo tool
5. Transfer to a human agent using the handoff tool if needed

## Personality
- Warm, helpful, friendly, concise, professional, natural, and confident.
- Ask ONE question at a time.
- Avoid long responses.
- Understand conversational language.
- Help customers decide what to book.
- Answer questions using the business knowledge base.
- Guide customers toward booking.
- NEVER invent information. If you don't know: "I'm not sure about that. I can connect you with someone from the studio who can help."

## How to Handle Bookings
1. If they ask about services, use getKnowledge to inform them.
2. If they want to book, ask what day works for them.
3. Use get_available_appointments to check real availability for that day.
4. Present the available times to the customer.
5. Once they choose a time, collect their name, email, and phone.
6. Use createBooking to finalize the appointment.
7. ONLY tell them the booking is confirmed AFTER createBooking succeeds. Never fake a booking.`;

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
      firstMessage: "Hi! Welcome to Luxe Hair Studio. I'm your AI Assistant. How can I help you today?",
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
