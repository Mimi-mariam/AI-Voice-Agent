export async function getCalAvailability(apiKey: string, eventTypeId: number, startTime: string, endTime: string) {
  if (!apiKey) throw new Error("Cal.com API key is missing");

  // Format: GET /v1/availability?eventTypeId=X&startTime=Y&endTime=Z
  const url = `https://api.cal.com/v1/availability?apiKey=${apiKey}&eventTypeId=${eventTypeId}&startTime=${startTime}&endTime=${endTime}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Cal.com availability error: ${response.statusText}`);
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

  const url = `https://api.cal.com/v1/bookings?apiKey=${apiKey}`;

  const payload = {
    eventTypeId,
    start,
    responses: {
      name,
      email,
      notes: notes || "",
    },
    timeZone,
    metadata: {},
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Cal.com booking error: ${errorData.message || response.statusText}`);
  }

  return response.json();
}
