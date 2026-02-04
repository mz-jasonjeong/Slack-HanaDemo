import { NextResponse } from "next/server"

const SLACK_BOT_TOKEN = process.env.OAUTH_TOKEN
const SLACK_USER_TOKEN = process.env.USER_TOKEN;

// Slack API helper function
async function slackApi(method: string, body: Record<string, unknown>) {
  const response = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  })
  return response.json()
}

async function slackApiByUser(method: string, body: Record<string, unknown>) {
  const response = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SLACK_USER_TOKEN}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  })
  return response.json()
}

export async function POST(request: Request) {
  try {
    const { agencyName, title, content } = await request.json()

    if (!SLACK_BOT_TOKEN) {
      return NextResponse.json({ error: "SLACK_BOT_TOKEN not configured" }, { status: 500 })
    }

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // 1. 견적 요청 접수 시 채널 생성.
    const timestamp = Date.now()
    const kstDate = new Date(timestamp + (9 * 60 * 60 * 1000));
    const isoString = kstDate.toISOString();
    let tempName = isoString.replace('T', '_').replace(/:/g, "").substring(0, 17);

    const channelName = `견적-요청-${tempName}`.toLocaleString()
    

    // 2. 슬랙 채널 생성
    const channelResult = await slackApi("conversations.create", {
      name: channelName,
      is_private: true,
      team_id : 'T09GJB74FUM'
    })

    if (!channelResult.ok) {
      console.error("Failed to create channel:", channelResult.error)
      return NextResponse.json({ error: `Failed to create channel: ${channelResult.error}` }, { status: 500 })
    }

    const channelId = channelResult.channel.id

    // 3. 채널이 생성되면 사용자를 초대한다.
    const channelInvite = await fetch('https://slack.com/api/conversations.invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        "channel": channelId, 
        "users":"U09QQN9KQ65,U08KTA9HWQK,U09D0Q36J7J"
      }),
    });

    if (!channelInvite.ok) {
      console.error("채널에 사용자 초대 실패:", channelResult.error)
      return NextResponse.json({ error: `채널에 사용자 초대 실패 : ${channelResult.error}` }, { status: 500 })
    }

    // 4. Slack List에 항목 추가
    //https://jasonjeong.enterprise.slack.com/lists/T08KT74F810/F0AC4535YKV
    /*
    Col0AC455NQD9 : 세부사항
    Col0ACE4SKYKW : 제목
    Col0ACAGP9EJW : 채널
    */

    console.log("리스트 항목 추가 시작")
    console.log("리스트 데이터 content : " + content)
    console.log("리스트 데이터 title : " + title)
    console.log("리스트 데이터 channelId : " + channelId)

    const addListItemresponse = await fetch('https://slack.com/api/slackLists.items.create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SLACK_USER_TOKEN}`,
      },
      body: JSON.stringify({
        "list_id":"F0AC4535YKV",
        "initial_fields": [
          {
            "column_id": "Col0AC455NQD9",
            "rich_text": [
              {
                "type": "rich_text",
                "elements": [
                  {
                    "type": "rich_text_section", 
                    "elements": [
                      {
                        "type": "text",
                        "text": content
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "column_id": "Col0ACE4SKYKW",
            "rich_text": [
              {
                "type": "rich_text",
                "elements": [
                  {
                    "type": "rich_text_section", 
                    "elements": [
                      {
                        "type": "text",
                        "text": title
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "column_id": "Col0ACAGP9EJW",
            "channel": [channelId]
          }
      
        ]
      }),
    });

    console.log(addListItemresponse.body)

    if (!addListItemresponse.ok) {
      console.error("리스트에 항목 추가 실패 : ", channelResult.error)
      return NextResponse.json({ error: `리스트에 항목 추가 실패 : ${channelResult.error}` }, { status: 500 })
    }

    // 캔버스 생성
    // let canvasString = "|견적명|" + title + "|\n|견적상세|" + content + "|";
    // let canvasStringR1 = `|견적명|${title}|`;
    // let canvasStringR2 = `|견적상세|${content}|`;

    let canvasStringR1 = "|견적명|" + title + "|";
    let canvasStringR2 = "|견적상세|" + content + "|";

    const canvasResult = await slackApiByUser("conversations.canvases.create", {
      title: "견적 요청 상세 내용",
      channel_id: channelId,
      document_content: {
        type: "markdown",
        markdown: canvasStringR1 + "\n" + canvasStringR2,
      },
    })

    // console.log("==============================")
    // console.log(canvasResult)
    // console.log("==============================")

    // 채널의 토픽 설정
    await slackApi("conversations.setTopic", {
      channel: channelId,
      topic: `견적 요청 : ${title}`,
    })

    // await slackApi("conversations.setPurpose", {
    //   channel: channelId,
    //   purpose: JSON.stringify(quoteData),
    // })

    return NextResponse.json({
      success: true,
      channelId,
      channelName,
      quoteId: timestamp.toString(),
    })
  } catch (error) {
    console.error("Error creating quote request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
