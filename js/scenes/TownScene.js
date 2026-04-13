/**
 * TownScene — 마을 맵, 캐릭터 이동, NPC 대화
 *
 * 타일맵을 코드로 생성 (Tiled 없이 placeholder).
 * 0 = 풀, 1 = 길, 2 = 벽, 3 = 물, 4 = 건물, 5 = 문(던전 입구)
 */
import { GameState } from '../data/gameState.js';
import { DIALOGS } from '../data/dialogs.js';
import { DialogSystem } from '../systems/DialogSystem.js';
import { ShopSystem } from '../systems/ShopSystem.js';

export class TownScene extends Phaser.Scene {
    constructor() {
        super('TownScene');
    }

    create() {
        const TILE = 16;
        this.TILE = TILE;

        // 30x20 타일 맵 (480x320 해상도)
        // prettier-ignore
        const mapData = [
            [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
            [2,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,2],
            [2,0,0,4,4,4,4,0,0,0,0,3,0,0,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,2],
            [2,0,0,4,4,4,4,0,0,0,0,1,0,0,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,2],
            [2,0,0,4,4,4,4,0,0,0,0,1,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,5,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
        ];

        const tileTextures = {
            0: 'tile_grass',
            1: 'tile_path',
            2: 'tile_wall',
            3: 'tile_water',
            4: 'tile_building',
            5: 'tile_door',
        };

        const solidTiles = new Set([2, 3, 4]);

        // 맵 렌더링
        this.collisionMap = [];
        for (let row = 0; row < mapData.length; row++) {
            this.collisionMap[row] = [];
            for (let col = 0; col < mapData[row].length; col++) {
                const tileId = mapData[row][col];
                this.add.image(col * TILE + TILE / 2, row * TILE + TILE / 2, tileTextures[tileId]);
                this.collisionMap[row][col] = solidTiles.has(tileId);
            }
        }

        // 문(던전 입구) 위치 저장
        this.doors = [];
        for (let row = 0; row < mapData.length; row++) {
            for (let col = 0; col < mapData[row].length; col++) {
                if (mapData[row][col] === 5) {
                    this.doors.push({ row, col });
                }
            }
        }

        // 플레이어 시작 위치 (디버그: NPC 근처)
        const params = new URLSearchParams(window.location.search);
        const startCol = parseInt(params.get('col')) || 11;
        const startRow = parseInt(params.get('row')) || 10;
        this.playerTile = { col: startCol, row: startRow };
        this.player = this.add.image(
            this.playerTile.col * TILE + TILE / 2,
            this.playerTile.row * TILE + TILE / 2,
            'player'
        ).setDepth(10);

        // --- NPC 정의 ---
        this.npcs = [
            {
                name: '마을장',
                col: 12, row: 8,
                texture: 'npc_elder',
                labelColor: '#ffcc44',
                dialogKey: 'elder_quest',
                firstDialogKey: 'elder_intro', // 첫 대화
            },
            {
                name: '상인',
                col: 20, row: 7,
                texture: 'npc_merchant',
                labelColor: '#44ff44',
                dialogKey: 'merchant_intro',
            },
        ];

        this.npcs.forEach(npc => {
            npc.sprite = this.add.image(
                npc.col * TILE + TILE / 2,
                npc.row * TILE + TILE / 2,
                npc.texture
            ).setDepth(10);

            this.collisionMap[npc.row][npc.col] = true;

            this.add.text(npc.col * TILE + TILE / 2, npc.row * TILE - 4, npc.name, {
                fontSize: '7px', fontFamily: 'monospace', color: npc.labelColor,
            }).setOrigin(0.5).setDepth(11);
        });

        // 던전 입구 라벨 (남쪽 문)
        this.add.text(11 * TILE + TILE / 2, 18 * TILE - 4, '던전 입구', {
            fontSize: '7px', fontFamily: 'monospace', color: '#ff6644',
        }).setOrigin(0.5).setDepth(11);

        // 키보드 입력
        this.cursors = this.input.keyboard.createCursorKeys();
        this.moveDelay = 0;
        this.MOVE_INTERVAL = 150;

        // 대화 시스템
        this.dialog = new DialogSystem(this, (action, nextDialogKey) => {
            if (nextDialogKey && DIALOGS[nextDialogKey]) {
                // 연쇄 대화
                setTimeout(() => {
                    this.dialog.start(DIALOGS[nextDialogKey], this.currentNpcName);
                }, 100);
                return;
            }
            if (action === 'openShop') {
                this.shop.open();
            }
        });

        // 말풍선 힌트 (NPC 근처에서 표시)
        this.interactHint = this.add.text(0, 0, 'SPACE', {
            fontSize: '7px', fontFamily: 'monospace', color: '#ffffff',
            backgroundColor: '#333366aa', padding: { x: 3, y: 1 },
        }).setOrigin(0.5).setDepth(15).setVisible(false);

        // 상점 시스템
        this.shop = new ShopSystem(this, () => {
            this.updateHud();
        });

        // SPACE 키 (대화 시작 + 진행)
        this.spaceKey = this.input.keyboard.addKey('SPACE');

        // 첫 대화 플래그
        this.talkedToElder = false;

        // HUD
        this.hudText = this.add.text(2, 2, '', {
            fontSize: '8px', fontFamily: 'monospace', color: '#ffffff',
            backgroundColor: '#00000088', padding: { x: 4, y: 2 },
        }).setDepth(20);
        this.updateHud();

        this.add.text(478, 2, 'SPACE: 대화  ESC: 타이틀', {
            fontSize: '8px', fontFamily: 'monospace', color: '#ffffff',
            backgroundColor: '#00000088', padding: { x: 4, y: 2 },
        }).setOrigin(1, 0).setDepth(20);

        // ESC로 타이틀 복귀 (대화/상점 중에는 무시)
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.dialog.isActive || this.shop.isActive) return;
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('TitleScene');
            });
        });

        // 페이드인
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    updateHud() {
        const p = GameState.player;
        this.hudText.setText(`HP:${p.hp}/${p.maxHp}  Lv:${p.level}  G:${p.gold}`);
    }

    /** 플레이어와 인접한 NPC 찾기 */
    findAdjacentNpc() {
        const { col, row } = this.playerTile;
        for (const npc of this.npcs) {
            const dx = Math.abs(npc.col - col);
            const dy = Math.abs(npc.row - row);
            if (dx + dy === 1) return npc;
        }
        return null;
    }

    update(time) {
        // 상점 열려있으면 상점만 업데이트
        if (this.shop.isActive) {
            this.shop.update();
            return;
        }

        // 대화 중이면 대화 시스템만 업데이트
        if (this.dialog.isActive) {
            this.dialog.update();
            return;
        }

        // 인접 NPC 힌트 표시
        const adjacentNpc = this.findAdjacentNpc();
        if (adjacentNpc) {
            const TILE = this.TILE;
            this.interactHint.setPosition(
                adjacentNpc.col * TILE + TILE / 2,
                adjacentNpc.row * TILE - 12
            ).setVisible(true);

            // SPACE키로 대화 시작
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.interactHint.setVisible(false);
                this.currentNpcName = adjacentNpc.name;

                // 첫 대화 체크 (마을장)
                let dialogKey = adjacentNpc.dialogKey;
                if (adjacentNpc.firstDialogKey && !this.talkedToElder) {
                    dialogKey = adjacentNpc.firstDialogKey;
                    this.talkedToElder = true;
                }

                this.dialog.start(DIALOGS[dialogKey], adjacentNpc.name);
                return;
            }
        } else {
            this.interactHint.setVisible(false);
        }

        // 이동
        if (time < this.moveDelay) return;

        const TILE = this.TILE;
        let dx = 0, dy = 0;

        if (this.cursors.left.isDown)       dx = -1;
        else if (this.cursors.right.isDown)  dx = 1;
        else if (this.cursors.up.isDown)     dy = -1;
        else if (this.cursors.down.isDown)   dy = 1;
        else return;

        const newCol = this.playerTile.col + dx;
        const newRow = this.playerTile.row + dy;

        if (newRow < 0 || newRow >= this.collisionMap.length) return;
        if (newCol < 0 || newCol >= this.collisionMap[0].length) return;
        if (this.collisionMap[newRow][newCol]) return;

        this.playerTile.col = newCol;
        this.playerTile.row = newRow;
        this.player.setPosition(newCol * TILE + TILE / 2, newRow * TILE + TILE / 2);
        this.moveDelay = time + this.MOVE_INTERVAL;

        // HUD 갱신
        this.updateHud();

        // 던전 입구 체크 (남쪽 문)
        const onDoor = this.doors.find(d => d.row === newRow && d.col === newCol);
        if (onDoor && onDoor.row === 18) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('DungeonScene');
            });
        }
    }
}
