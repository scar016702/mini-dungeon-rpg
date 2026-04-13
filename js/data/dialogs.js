/**
 * NPC 대화 데이터
 *
 * 각 대화는 pages 배열 — 한 페이지씩 SPACE/ENTER로 넘김.
 * choices가 있으면 선택지 표시.
 */
export const DIALOGS = {
    elder_intro: {
        pages: [
            { text: '오, 용사여! 잘 왔다.' },
            { text: '이 마을 남쪽 던전에\n어둠기사가 나타났다네.' },
            { text: '부디 그 녀석을 처치해주게!\n마을의 평화를 위해...' },
        ],
    },
    elder_quest: {
        pages: [
            { text: '던전의 어둠기사를\n처치해주시오!' },
            {
                text: '준비는 되었는가?',
                choices: [
                    { label: '네, 가겠습니다!', next: 'elder_go' },
                    { label: '좀 더 준비할게요', next: 'elder_wait' },
                ],
            },
        ],
    },
    elder_go: {
        pages: [
            { text: '용감하구나!\n마을 남쪽 문으로 가거라.' },
        ],
    },
    elder_wait: {
        pages: [
            { text: '그래, 서두를 필요 없다.\n상인에게서 장비를 갖추게.' },
        ],
    },
    merchant_intro: {
        pages: [
            { text: '어서오세요! 뭘 도와드릴까요?' },
            {
                text: '물건을 보시겠어요?',
                choices: [
                    { label: '상점 열기', action: 'openShop' },
                    { label: '아니요', next: null },
                ],
            },
        ],
    },
};
