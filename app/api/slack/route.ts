import { type NextRequest, NextResponse } from "next/server"
import dayjs from 'dayjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log the incoming request for debugging
    console.log("Slack API received:", body);
    let resultMSG = "";
    let resultsuccess = false;
    let resultstatus = 200;
    let response;

    //Type별로 구분하여 적용한다.
    switch(body.type){
      //일괄 공지
      case 'bulk_notification':
        break;
      //중요 상품 변경
      case 'product_info_change':
        break;
      //전자결재 도착
      case 'approval_arrival':
        response = await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OAUTH_TOKEN}`,
          },
          body: JSON.stringify({
            "channel":"U08KTA9HWQK",
            "text":"결재문서 도착 대체 메시지",
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*결재문서 도착 알람*\n*<https://www.naver.com|Groupware에서 보기>*"
                }
              },
              {
                "type": "section",
                "fields": [
                  {
                    "type": "mrkdwn",
                    "text": "*결재유형:*\n휴가 신청서 (연차)"
                  },
                  {
                    "type": "mrkdwn",
                    "text": "*기안자:*\n홍길동"
                  },
                  {
                    "type": "mrkdwn",
                    "text": "*휴가기간:*\n2026-02-19 ~ 2026-02-20"
                  },
                  {
                    "type": "mrkdwn",
                    "text": "*신청일수:*\n2일"
                  },
                  {
                    "type": "mrkdwn",
                    "text": "*사유:*\n연차 사용"
                  }
                ]
              },
              {
                "type": "actions",
                "elements": [
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "emoji": true,
                      "text": "의견등록"
                    },
                    "style": "primary",
                    "value": "docID",
                    "action_id": "submit_opinion"
                  }
                ]
              },
              {
                "type": "actions",
                "elements": [
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "승인",
                      "emoji": true
                    },
                    "value": "accept",
                    "action_id": "btn_accept",
                    "style": "primary"
                  },
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "반려",
                      "emoji": true
                    },
                    "value": "reject",
                    "action_id": "btn_reject",
                    "style": "danger"
                  }
                ]
              }
            ]
          }),
        });
        if (response.ok) {
          resultsuccess = true;
          resultMSG = "휴가상태 적용 완료";
          resultstatus = 200;
        }
        else{
          resultsuccess = false;
          resultMSG = "휴가상태 적용 오류";
          resultstatus = 500;
        }
        break;
      //휴가 적용
      case 'vacation_application':
        response = await fetch('https://slack.com/api/users.profile.set', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.USER_TOKEN}`,
          },
          body: JSON.stringify({
            user: "U08KTA9HWQK",
            profile: {
              status_text : "휴가중",
              status_emoji : ":palm_tree:",
              status_expiration : dayjs().add(1, 'day').endOf('day').unix(),
            },
          }),
        });
        if (response.ok) {
          resultsuccess = true;
          resultMSG = "휴가상태 적용 완료";
          resultstatus = 200;
        }
        else{
          resultsuccess = false;
          resultMSG = "휴가상태 적용 오류";
          resultstatus = 500;
        }
        break;
      //견적 등록
      case 'quote_registration':
        break;
    }
    // Simulate API processing delay
    // await new Promise((resolve) => setTimeout(resolve, 1000))

    // Here you would integrate with actual Slack API
    // For now, we simulate a successful response
    // Example Slack webhook integration:
    // const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
    // const response = await fetch(slackWebhookUrl, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ text: body.message }),
    // })

    return NextResponse.json({ success: resultsuccess, message: resultMSG }, { status: resultstatus })

  } catch (error) {
    console.error("Slack API error:", error)
    return NextResponse.json({ success: false, message: "Failed to send message" }, { status: 500 })
  }
}
