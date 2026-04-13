/**
 * DungeonScene — 던전 맵 + 랜덤 인카운터
 *
 * 0 = 던전바닥, 1 = 던전벽, 2 = 보스방 입구
 */
import { MONSTERS, DUNGEON_ENCOUNTERS } from '../data/monsters.js';
import { GameState } from '../data/gameState.js';
import { DIALOGS } from '../data/dialogs.js';
import { DialogSystem } from '../systems/DialogSystem.js';

export class DungeonScene extends Phaser.Scene {
    constructor() {
        super('DungeonScene');
    }

    create() {
        const TILE = 16;
        this.TILE = TILE;
        this.stepCount = 0;

        // 간단한 던전 맵 30x20
        // prettier-ignore
        const mapData = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ];

        // 맵 렌더링
        this.collisionMap = [];
        this.bossDoor = null;
        for (let row = 0; row < mapData.length; row++) {
            this.collisionMap[row] = [];
            for (let col = 0; col < mapData[row].length; col++) {
                const tileId = mapData[row][col];
                let tex = 'tile_dungeon_floor';
                if (tileId === 1) tex = 'tile_dungeon_wall';
                else if (tileId === 2) tex = 'tile_door';
                this.add.image(col * TILE + TILE / 2, row * TILE + TILE / 2, tex);
                this.collisionMap[row][col] = tileId === 1;
                if (tileId === 2) this.bossDoor = { row, col };
            }
        }

        // 보스방 라벨
        if (this.bossDoor) {
            this.add.text(this.bossDoor.col * TILE + TILE / 2, this.bossDoor.row * TILE - 4, '보스방', {
                fontSize: '7px', fontFamily: 'monospace', color: '#ff4444',
            }).setOrigin(0.5).setDepth(11);
        }

        // 플레이어 (전투 후 복귀 시 이전 위치 사용)
        const saved = GameState.dungeonPos;
        this.playerTile = saved ? { ...saved } : { col: 2, row: 1 };
        GameState.dungeonPos = null;
        this.player = this.add.image(
            this.playerTile.col * TILE + TILE / 2,
            this.playerTile.row * TILE + TILE / 2,
            'player'
        ).setDepth(10);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.moveDelay = 0;
        this.MOVE_INTERVAL = 150;
        this.inBattle = false;

        // 보스방 진입 확인 대화 시스템
        this.dialog = new DialogSystem(this, (action) => {
            if (action === 'enterBoss') {
                this.inBattle = true;
                GameState.dungeonPos = { ...this.playerTile };
                this.cameras.main.fadeOut(400, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('BattleScene', { monsterKey: 'darkKnight' });
                });
            }
        });
        this.spaceKey = this.input.keyboard.addKey('SPACE');

        // HUD
        this.hudText = this.add.text(2, 2, '', {
            fontSize: '8px', fontFamily: 'monospace', color: '#ffffff',
            backgroundColor: '#00000088', padding: { x: 4, y: 2 },
        }).setDepth(20);
        this.updateHud();

        this.add.text(478, 2, 'ESC: 마을로', {
            fontSize: '8px', fontFamily: 'monospace', color: '#ffffff',
            backgroundColor: '#00000088', padding: { x: 4, y: 2 },
        }).setOrigin(1, 0).setDepth(20);

        // ESC로 마을 복귀
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.inBattle) return;
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('TownScene');
            });
        });

        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    updateHud() {
        const p = GameState.player;
        this.hudText.setText(`HP:${p.hp}/${p.maxHp}  Lv:${p.level}  G:${p.gold}`);
    }

    update(time) {
        if (this.inBattle) return;

        // 대화 중이면 대화만 업데이트
        if (this.dialog.isActive) {
            this.dialog.update();
            return;
        }

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
        this.stepCount++;

        // 보스방 입구 체크 — 확인 대화 표시
        if (this.bossDoor && newRow === this.bossDoor.row && newCol === this.bossDoor.col) {
            const bossConfirm = {
                pages: [
                    { text: '이 문 너머에서 강력한 기운이 느껴진다...' },
                    {
                        text: '보스방에 입장하시겠습니까?',
                        choices: [
                            { label: '입장한다', action: 'enterBoss' },
                            { label: '아직 준비가 안 됐다', action: null },
                        ],
                    },
                ],
            };
            this.dialog.start(bossConfirm, '???');
            return;
        }

        // 랜덤 인카운터 (5걸음마다 20% 확률)
        if (this.stepCount % 5 === 0 && Math.random() < 0.2) {
            const key = DUNGEON_ENCOUNTERS[Math.floor(Math.random() * DUNGEON_ENCOUNTERS.length)];
            this.inBattle = true;
            GameState.dungeonPos = { col: newCol, row: newRow };
            this.cameras.main.flash(300, 255, 255, 255);
            setTimeout(() => {
                this.scene.start('BattleScene', { monsterKey: key });
            }, 300);
        }
    }
}
