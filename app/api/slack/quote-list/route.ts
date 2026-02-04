import { NextResponse } from "next/server"

const SLACK_BOT_TOKEN = process.env.OAUTH_TOKEN;
const SLACK_USER_TOKEN = process.env.USER_TOKEN;

export async function GET() {
  try {
    if (!SLACK_BOT_TOKEN) {
      return NextResponse.json({ error: "SLACK_BOT_TOKEN not configured" }, { status: 500 })
    }
    
    const response = await fetch("https://slack.com/api/slackLists.items.list", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SLACK_USER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "list_id":"F0AC4535YKV",
        "limit":"500"
      }),
    })

    const data = await response.json()

    if (!data.ok) {
      console.error("Failed to fetch channels:", data.error)
      return NextResponse.json({ error: data.error }, { status: 500 })
    }

    // Filter channels that are quote channels and extract quote data from purpose
    const quoteItems = data.items
    let targetItems = [];

    quoteItems.forEach(function(quoteItem) {
      let quoteName = "";
      let quoteDesc = "";
      quoteItem.fields.forEach(function(fieldItem) {
          switch(fieldItem.column_id){
            //이름
            case "Col0ACE4SKYKW":
              quoteName = fieldItem.text;
              break;
            //설명
            case "Col0AC455NQD9":
              quoteDesc = fieldItem.text;
              break;
          }
      })

      targetItems.push({name:quoteName, desc:quoteDesc});
    })

    return NextResponse.json({ quotes: targetItems })
  } catch (error) {
    console.error("Error fetching quote list:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
