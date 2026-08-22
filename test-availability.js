require('dotenv').config();

async function testAvailability() {
  const apiKey = process.env.CAL_API_KEY;
  const eventTypeId = '6769213';

  // Test for today
  const start = new Date();
  start.setUTCHours(0,0,0,0);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  end.setUTCHours(23,59,59,999);

  const url = `https://api.cal.com/v2/slots/available?eventTypeId=${eventTypeId}&startTime=${start.toISOString()}&endTime=${end.toISOString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "cal-api-version": "2024-08-13"
      }
    });
    
    if (!response.ok) {
        const text = await response.text();
        console.error("Availability failed:", response.status, text);
    } else {
        const json = await response.json();
        console.log("Availability success:", JSON.stringify(json, null, 2));
    }
  } catch (err) {
      console.error(err);
  }
}

testAvailability();
