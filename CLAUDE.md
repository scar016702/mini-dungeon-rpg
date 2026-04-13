# 미니 던전 RPG — CLAUDE.md

## 프로젝트 개요
바람의나라 스타일 복고풍 2D 미니 던전 RPG.
게임 제작 흐름 학습이 목적이며, 범위를 최소화하여 완성까지 도달하는 것이 목표.

## 게임 플로우
```
타이틀(TitleScene)
  → 마을(TownScene)
    → NPC 대화 / 상점
    → 던전 입구
  → 던전(DungeonScene)
    → 몬스터 2~3종 (랜덤 인카운터 or 필드 배치)
    → 보스방
  → 보스전(BossBattleScene)
    → 승리 → 엔딩(EndingScene)
```

## 기술 스택
- **Phaser 3** (CDN, 빌드 툴 없음)
- **Tiled** (타일맵 에디터 → JSON export → Phaser 연동)
- **Vanilla HTML/JS** (모듈 분리는 ES Modules `type="module"`)
- 에셋: OpenGameArt.org 또는 직접 제작 placeholder

## 디렉토리 구조
```
mini-dungeon-rpg/
├── CLAUDE.md              ← 이 파일
├── index.html             ← 진입점, Phaser CDN 로드
├── css/
│   └── style.css          ← 캔버스 중앙 정렬, 배경
├── js/
│   ├── main.js            ← Phaser.Game config, 씬 등록
│   ├── scenes/
│   │   ├── BootScene.js       ← 에셋 프리로드
│   │   ├── TitleScene.js      ← 타이틀 화면
│   │   ├── TownScene.js       ← 마을 맵
│   │   ├── DungeonScene.js    ← 던전 맵
│   │   ├── BattleScene.js     ← 턴제 전투 (오버레이 or 별도 씬)
│   │   └── EndingScene.js     ← 엔딩 크레딧
│   ├── systems/
│   │   ├── DialogSystem.js    ← NPC 대화 UI
│   │   ├── BattleSystem.js    ← 전투 로직 (데미지 계산, 턴 관리)
│   │   ├── InventorySystem.js ← 아이템/장비 관리
│   │   └── ShopSystem.js      ← 상점 UI + 거래 로직
│   └── entities/
│       ├── Player.js          ← 플레이어 스탯, 스프라이트
│       ├── Monster.js         ← 몬스터 기본 클래스
│       └── NPC.js             ← NPC 기본 클래스
└── assets/
    ├── sprites/           ← 캐릭터, 몬스터, NPC 스프라이트시트
    ├── tilemaps/          ← Tiled JSON + 타일셋 이미지
    ├── audio/             ← BGM, 효과음
    └── fonts/             ← 비트맵 폰트 (옵션)
```

## 개발 마일스톤
| #  | 마일스톤                      | 핵심 결과물                          |
|----|-------------------------------|--------------------------------------|
| M1 | 맵 렌더링 + 캐릭터 이동       | 타일맵 표시, 4방향 이동, 충돌        |
| M2 | 몬스터 + 기본 전투            | 턴제 전투 씬, HP/공격, 승패 판정     |
| M3 | NPC + 대화 시스템             | 대화창 UI, 선택지, 퀘스트 플래그     |
| M4 | 상점 + 인벤토리               | 아이템 구매/사용, 골드 관리          |
| M5 | 씬 전환 + 보스 + 엔딩         | 전체 플로우 연결, 보스전, 엔딩 씬    |

## 게임 데이터
### 플레이어 초기 스탯
```json
{ "hp": 100, "maxHp": 100, "mp": 30, "maxMp": 30,
  "atk": 12, "def": 5, "gold": 50, "level": 1, "exp": 0 }
```
### 몬스터 목록
| 이름     | HP  | ATK | DEF | EXP | GOLD | 비고       |
|----------|-----|-----|-----|-----|------|------------|
| 슬라임   | 20  | 5   | 2   | 10  | 5    | 최약체     |
| 박쥐     | 30  | 8   | 3   | 15  | 8    | 스피드형   |
| 스켈레톤 | 50  | 12  | 6   | 25  | 15   | 중간보스급 |
| 어둠기사 | 150 | 20  | 10  | 100 | 50   | **보스**   |

### NPC 목록
| 이름   | 역할 | 위치 |
|--------|------|------|
| 마을장 | 퀘스트 부여 ("던전의 어둠기사를 처치해주시오") | 마을 중앙 |
| 상인   | 포션/장비 판매 | 마을 상점 |

### 상점 아이템
| 이름       | 가격 | 효과             |
|------------|------|------------------|
| HP 포션    | 15   | HP +30 회복      |
| MP 포션    | 20   | MP +15 회복      |
| 강철 검    | 80   | ATK +5           |
| 가죽 갑옷  | 60   | DEF +3           |

## 전투 공식
```
damage = max(1, attacker.atk - defender.def + random(-2, 2))
```

## 코딩 컨벤션
- ES Modules (`import/export`)
- 클래스 기반 씬 (`extends Phaser.Scene`)
- 상수/데이터는 `js/data/` 또는 JSON 파일로 분리 가능
- 커밋 메시지: `feat:`, `fix:`, `refactor:`, `asset:` 접두어

## 현재 진행 상태
- [x] 프로젝트 구조 생성
- [ ] M1: 맵 렌더링 + 캐릭터 이동
- [ ] M2: 몬스터 + 기본 전투
- [ ] M3: NPC + 대화 시스템
- [ ] M4: 상점 + 인벤토리
- [ ] M5: 씬 전환 + 보스 + 엔딩
