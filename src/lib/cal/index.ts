export async function getCalAvailability(apiKey: string, eventTypeId: number, startTime: string, endTime: string) {
  if (!apiKey) throw new Error("Cal.com API key is missing");

  // Format: GET /v2/slots?eventTypeId=X&start=Y&end=Z
  const url = `https://api.cal.com/v2/slots?eventTypeId=${eventTypeId}&start=${startTime}&end=${endTime}`;

  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "cal-api-version": "2024-08-13"
    }
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cal.com availability error: ${response.statusText} ${text}`);
  }

  return response.json();
}

export async function createCalBooking(
  apiKey: string,
  eventTypeId: number,
  start: string,
  name: string,
  email: string,
  timeZone: string,
  notes?: string
) {
  if (!apiKey) throw new Error("Cal.com API key is missing");

  const url = `https://api.cal.com/v2/bookings`;

  const payload = {
    eventTypeId,
    start,
    attendee: {
      name,
      email,
      timeZone,
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "cal-api-version": "2024-08-13"
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Cal.com booking error: ${errorData.message || response.statusText}`);
  }

  return response.json();
}
