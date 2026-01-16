import { type NextRequest, NextResponse } from "next/server"
import dayjs from 'dayjs';

export async function POST(request: NextRequest) {
  try {
    // 1. 요청의 Content-Type 확인
    const contentType = request.headers.get('content-type') || '';

    // =================================================================
    // [Case A] Slack에서 온 요청 (버튼 클릭 등) - application/x-www-form-urlencoded
    // =================================================================
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const payloadString = formData.get('payload');

      if (!payloadString || typeof payloadString !== 'string') {
        return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
      }

      const payload = JSON.parse(payloadString);
      const action = payload.actions?.[0]; // 클릭한 버튼 정보
      const user = payload.user;

      // 1-1. 모달 제출 (View Submission) 처리
      if (payload.type === 'view_submission') {
        // 의견 등록 모달에서 [등록] 눌렀을 때
        const docId = payload.view.private_metadata;
        const opinion = payload.view.state.values.input_opinion_block.input_opinion_action.value;
        console.log(`[의견등록] 문서ID: ${docId}, 내용: ${opinion}`);
        return NextResponse.json({ response_action: "clear" }); // 모달 닫기
      }

      // 1-2. 버튼 클릭 (Block Actions) 처리
      if (action) {
        switch (action.action_id) {
          case 'btn_accept':
            return handleApproval(payload, user, '승인');
          
          case 'btn_reject':
            return handleApproval(payload, user, '반려');
          
          case 'submit_opinion':
            // 모달 띄우기 (비동기 호출 후 빈 응답 반환)
            await openOpinionModal(payload.trigger_id, action.value);
            return NextResponse.json({}, { status: 200 });
        }
      }

      return NextResponse.json({}, { status: 200 });
    }

    // =================================================================
    // [Case B] 랜딩페이지(V0)에서 온 요청 - application/json
    // =================================================================
    else {
      const body = await request.json();

      console.log("Web API received:", body);
      let resultMSG = "";
      let resultsuccess = false;
      let resultstatus = 200;
      let response;

      switch(body.type){
        // ... (기존 코드 유지) ...
        case 'bulk_notification':
          break;
        case 'product_info_change':
          break;
        
        // 전자결재 도착
        case 'approval_arrival':
          response = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`, // 환경변수 이름 확인 필요
            },
            body: JSON.stringify({
              "channel":"U08KTA9HWQK",
              "text":"결재문서 도착 대체 메시지",
              "blocks": [
                // ... (기존 Block Kit 코드 그대로 유지) ...
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
                    { "type": "mrkdwn", "text": "*결재유형:*\n휴가 신청서 (연차)" },
                    { "type": "mrkdwn", "text": "*기안자:*\n홍길동" },
                    { "type": "mrkdwn", "text": "*휴가기간:*\n2026-02-19 ~ 2026-02-20" },
                    { "type": "mrkdwn", "text": "*신청일수:*\n2일" },
                    { "type": "mrkdwn", "text": "*사유:*\n연차 사용" }
                  ]
                },
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": { "type": "plain_text", "emoji": true, "text": "의견등록" },
                      "style": "primary",
                      "value": "docID_123",
                      "action_id": "submit_opinion"
                    }
                  ]
                },
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": { "type": "plain_text", "text": "승인", "emoji": true },
                      "value": "accept",
                      "action_id": "btn_accept",
                      "style": "primary"
                    },
                    {
                      "type": "button",
                      "text": { "type": "plain_text", "text": "반려", "emoji": true },
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
            resultMSG = "결재 알림 발송 완료";
            resultstatus = 200;
          } else {
            resultsuccess = false;
            resultMSG = "발송 실패";
            resultstatus = 500;
          }
          break;

        // 휴가 적용
        case 'vacation_application':
          // ... (기존 코드 유지) ...
           response = await fetch('https://slack.com/api/users.profile.set', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SLACK_USER_TOKEN}`, // 환경변수 이름 확인
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
          } else {
            resultsuccess = false;
            resultMSG = "휴가상태 적용 오류";
            resultstatus = 500;
          }
          break;

        case 'quote_registration':
          break;
      }

      return NextResponse.json({ success: resultsuccess, message: resultMSG }, { status: resultstatus });
    }

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

// =================================================================
// [Helper 1] 승인/반려 처리 함수
// =================================================================
function handleApproval(payload: any, user: any, status: string) {
  const statusIcon = status === '승인' ? '✅' : '❌';
  
  // 기존 메시지 블록 중 "내용" 부분(인덱스 1)을 재사용
  // (실제 사용 시엔 payload.message.blocks 구조를 보고 인덱스를 조정하세요)
  const infoBlock = payload.message.blocks[1];

  return NextResponse.json({
    replace_original: "true",
    text: `${statusIcon} ${status} 처리되었습니다.`,
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*결재문서 처리 알림*`
        }
      },
      infoBlock, // 기존 문서 정보 유지
      {
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": `${statusIcon} *${status} 완료* (처리자: <@${user.id}>) | 처리일시: ${new Date().toLocaleString()}`
          }
        ]
      }
    ]
  });
}

// =================================================================
// [Helper 2] 의견등록 모달 열기 함수
// =================================================================
async function openOpinionModal(triggerId: string, docId: string) {
  await fetch('https://slack.com/api/views.open', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify({
      trigger_id: triggerId,
      view: {
        type: "modal",
        callback_id: "view_opinion_submit",
        private_metadata: docId,
        title: { type: "plain_text", text: "의견 등록" },
        submit: { type: "plain_text", text: "등록" },
        close: { type: "plain_text", text: "취소" },
        blocks: [
          {
            type: "input",
            block_id: "input_opinion_block",
            element: {
              type: "plain_text_input",
              action_id: "input_opinion_action",
              multiline: true
            },
            label: { type: "plain_text", text: "의견 내용" }
          }
        ]
      }
    })
  });
}