import { type NextRequest, NextResponse } from "next/server";
import dayjs from 'dayjs';

// 환경변수 타입 체크 (없을 경우 에러 방지용)
const SLACK_BOT_TOKEN = process.env.OAUTH_TOKEN;
const SLACK_USER_TOKEN = process.env.USER_TOKEN;

export async function POST(request: NextRequest) {
  try {
    // 요청의 Content-Type 확인 (분기 처리의 핵심)
    const contentType = request.headers.get('content-type') || '';

    // =================================================================================
    // [PART 1] Slack 인터랙션 처리 (버튼 클릭, 모달 제출 등)
    // Content-Type: application/x-www-form-urlencoded
    // =================================================================================
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const payloadString = formData.get('payload');

      if (!payloadString || typeof payloadString !== 'string') {
        return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
      }

      const payload = JSON.parse(payloadString);
      const action = payload.actions?.[0]; // 클릭한 버튼 정보
      const user = payload.user;           // 클릭한 사용자 정보

      // 1-1. 모달(팝업)에서 [등록] 버튼을 눌렀을 때 (View Submission)
      if (payload.type === 'view_submission') {
        const docId = payload.view.private_metadata; // 숨겨둔 문서 ID
        // 모달 input block_id와 action_id 구조에 따라 값 추출
        const opinion = payload.view.state.values.input_opinion_block?.input_opinion_action?.value;
        
        console.log(`[의견등록] 문서ID: ${docId}, 작성자: ${user.username}, 내용: ${opinion}`);
        
        // 모달을 닫기 위해 clear 액션 반환
        return NextResponse.json({ response_action: "clear" });
      }

      // 1-2. 메시지 본문의 버튼 클릭 (Block Actions)
      if (action) {
        switch (action.action_id) {
          case 'btn_accept':
            // 승인 처리 (메시지 수정)
            return handleApproval(payload, user, '승인');
          
          case 'btn_reject':
            // 반려 처리 (메시지 수정)
            return handleApproval(payload, user, '반려');
          
          case 'submit_opinion':
            // 의견 등록 모달 띄우기 (API 호출)
            await openOpinionModal(payload.trigger_id, action.value);
            // Slack에게는 200 OK만 보내면 됨 (화면 변화 없음)
            return NextResponse.json({}, { status: 200 });
        }
      }

      return NextResponse.json({}, { status: 200 });
    }

    // =================================================================================
    // [PART 2] 웹(V0) 페이지 API 요청 처리
    // Content-Type: application/json
    // =================================================================================
    else {
      const body = await request.json();
      console.log("Web API received:", body);

      let resultMSG = "";
      let resultsuccess = false;
      let resultstatus = 200;
      let response;

      switch(body.type){
        // ------------------------------------------------
        // 2-1. 전자결재 도착 (Slack으로 메시지 발송)
        // ------------------------------------------------
        case 'approval_arrival':
          response = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
            },
            body: JSON.stringify({
              "channel": "U08KTA9HWQK", // 수신자 ID (또는 채널 ID)
              "text": "결재문서 도착 알림", // 푸시 알림 텍스트
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
                    { "type": "mrkdwn", "text": "*결재유형:*\n휴가 신청서 (연차)" },
                    { "type": "mrkdwn", "text": "*기안자:*\n홍길동" },
                    { "type": "mrkdwn", "text": "*휴가기간:*\n2026-02-19 ~ 2026-02-20" },
                    { "type": "mrkdwn", "text": "*신청일수:*\n2일" },
                    { "type": "mrkdwn", "text": "*사유:*\n연차 사용" }
                  ]
                },
                // [버튼 영역 1] 의견 등록
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": { "type": "plain_text", "emoji": true, "text": "의견등록" },
                      "style": "primary",
                      "value": "doc_12345", // 문서 ID 예시
                      "action_id": "submit_opinion"
                    }
                  ]
                },
                // [버튼 영역 2] 승인 / 반려
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
            const data = await response.json();
            if (data.ok) {
                resultsuccess = true;
                resultMSG = "결재 알림 발송 완료";
            } else {
                resultsuccess = false;
                resultMSG = `Slack API Error: ${data.error}`;
                resultstatus = 500;
            }
          } else {
            resultsuccess = false;
            resultMSG = "Slack API Network Error";
            resultstatus = 500;
          }
          break;

        // ------------------------------------------------
        // 2-2. 휴가 적용 (Slack 상태 메시지 변경)
        // ------------------------------------------------
        case 'vacation_application':
          response = await fetch('https://slack.com/api/users.profile.set', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // 상태 변경은 Bot Token이 아니라 User Token이 필요할 수 있음 (권한 주의)
              'Authorization': `Bearer ${SLACK_USER_TOKEN || SLACK_BOT_TOKEN}`, 
            },
            body: JSON.stringify({
              user: "U08KTA9HWQK", // 대상 사용자 ID
              profile: {
                status_text : "휴가중",
                status_emoji : ":palm_tree:",
                // 내일 23:59:59까지 설정
                status_expiration : dayjs().add(1, 'day').endOf('day').unix(),
              },
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
             if (data.ok) {
                resultsuccess = true;
                resultMSG = "휴가상태 적용 완료";
            } else {
                resultsuccess = false;
                resultMSG = `Slack Status Error: ${data.error}`;
                resultstatus = 500;
            }
          } else {
            resultsuccess = false;
            resultMSG = "Slack API Network Error";
            resultstatus = 500;
          }
          break;

        // ------------------------------------------------
        // 2-3. 기타 기능 (Placeholder)
        // ------------------------------------------------
        case 'bulk_notification':
          resultsuccess = true;
          resultMSG = "기능 준비중입니다.";
          break;
        case 'product_info_change':
          resultsuccess = true;
          resultMSG = "기능 준비중입니다.";
          break;
        case 'quote_registration':
          resultsuccess = true;
          resultMSG = "기능 준비중입니다.";
          break;
          
        default:
          resultsuccess = false;
          resultMSG = "Unknown Action Type";
          resultstatus = 400;
      }

      return NextResponse.json({ success: resultsuccess, message: resultMSG }, { status: resultstatus });
    }

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

// =================================================================
// [Helper Function 1] 승인/반려 버튼 클릭 시 메시지 수정 로직
// =================================================================
function handleApproval(payload: any, user: any, status: string) {
  const statusIcon = status === '승인' ? '✅' : '❌';
  
  // 기존 메시지의 블록 구조를 가져옴 (내용 유지를 위해)
  // payload.message.blocks[0]: 제목
  // payload.message.blocks[1]: 상세 필드 정보 (휴가기간 등)
  // payload.message.blocks[2]: 의견등록 버튼
  // payload.message.blocks[3]: 승인/반려 버튼
  
  const headerBlock = payload.message.blocks[0];
  const infoBlock = payload.message.blocks[1];

  return NextResponse.json({
    replace_original: "true", // 원본 메시지를 덮어씌움
    text: `${statusIcon} ${status} 처리되었습니다.`, // 모바일 푸시용 텍스트
    blocks: [
      headerBlock, // 제목 유지
      infoBlock,   // 상세 정보 유지
      {
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": `${statusIcon} *${status} 완료* (처리자: <@${user.id}>) | 처리일시: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
          }
        ]
      }
    ]
  });
}

// =================================================================
// [Helper Function 2] 의견 등록 팝업(Modal) 열기 로직
// =================================================================
async function openOpinionModal(triggerId: string, docId: string) {
  await fetch('https://slack.com/api/views.open', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify({
      trigger_id: triggerId,
      view: {
        type: "modal",
        callback_id: "view_opinion_submit", // 제출 시 식별자
        private_metadata: docId, // 문서 ID 전달용
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
              multiline: true,
              placeholder: { type: "plain_text", text: "의견을 입력해주세요." }
            },
            label: { type: "plain_text", text: "내용" }
          }
        ]
      }
    })
  });
}