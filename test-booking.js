require('dotenv').config();

async function testBooking() {
  const apiKey = process.env.CAL_API_KEY;
  const eventTypeId = 6769213;

  const url = `https://api.cal.com/v2/bookings`;

  const payload = {
    eventTypeId,
    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    attendee: {
      name: "Test User",
      email: "test@example.com",
      timeZone: "UTC",
    },
  };

  try {
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
        const text = await response.text();
        console.error("Booking failed:", response.status, text);
    } else {
        const json = await response.json();
        console.log("Booking success:", json);
    }
  } catch (err) {
      console.error(err);
  }
}

testBooking();
