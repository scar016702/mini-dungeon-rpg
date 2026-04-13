/**
 * BattleScene — 턴제 전투
 *
 * data: { monsterKey: string }
 * 전투 공식: damage = max(1, atk - def + random(-2, 2))
 */
import { MONSTERS } from '../data/monsters.js';
import { GameState } from '../data/gameState.js';
import { ITEMS } from '../data/items.js';

export class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene');
    }

    init(data) {
        this.monsterKey = data.monsterKey || 'slime';
    }

    create() {
        const W = 480, H = 320;
        this.cameras.main.setBackgroundColor('#111122');

        const monsterData = MONSTERS[this.monsterKey];
        this.monster = { ...monsterData, currentHp: monsterData.hp };
        this.player = GameState.player;
        this.battleOver = false;
        this.playerTurn = true;
        this.isDefending = false;

        // --- 몬스터 표시 영역 (상단) ---
        this.drawMonsterSprite(W / 2, 80, monsterData);

        this.monsterNameText = this.add.text(W / 2, 130, monsterData.name, {
            fontSize: '14px', fontFamily: 'monospace', color: '#ff8888',
        }).setOrigin(0.5);

        this.monsterHpText = this.add.text(W / 2, 148, '', {
            fontSize: '11px', fontFamily: 'monospace', color: '#ffffff',
        }).setOrigin(0.5);

        // --- 플레이어 스탯 (중간) ---
        this.playerStatsText = this.add.text(20, 170, '', {
            fontSize: '10px', fontFamily: 'monospace', color: '#88ccff',
            lineSpacing: 4,
        });

        // --- 전투 로그 (중간 우측) ---
        this.logText = this.add.text(250, 170, '', {
            fontSize: '9px', fontFamily: 'monospace', color: '#cccccc',
            wordWrap: { width: 220 }, lineSpacing: 3,
        });

        // --- 메뉴 (하단) ---
        const menuY = 260;
        this.add.rectangle(W / 2, menuY + 20, W - 20, 70, 0x222244, 0.9)
            .setStrokeStyle(2, 0x4444aa);

        this.menuItems = [];
        const labels = ['공격', 'MP 공격', '아이템', '도망'];
        labels.forEach((label, i) => {
            const x = 60 + i * 110;
            const txt = this.add.text(x, menuY + 10, label, {
                fontSize: '12px', fontFamily: 'monospace', color: '#ffffff',
                backgroundColor: '#333366', padding: { x: 8, y: 4 },
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            txt.on('pointerover', () => {
                if (!this.battleOver && this.playerTurn) txt.setColor('#ffcc44');
            });
            txt.on('pointerout', () => txt.setColor('#ffffff'));
            txt.on('pointerdown', () => this.onMenuSelect(i));

            this.menuItems.push(txt);
        });

        // 키보드 메뉴 선택
        this.selectedMenu = 0;
        this.updateMenuHighlight();

        this.input.keyboard.on('keydown-LEFT', () => this.moveMenu(-1));
        this.input.keyboard.on('keydown-RIGHT', () => this.moveMenu(1));
        this.input.keyboard.on('keydown-ENTER', () => this.onMenuSelect(this.selectedMenu));
        this.input.keyboard.on('keydown-SPACE', () => this.onMenuSelect(this.selectedMenu));

        this.updateDisplay();
        this.addLog(`${monsterData.name}이(가) 나타났다!`);

        this.cameras.main.fadeIn(300, 0, 0, 0);
    }

    /** setTimeout 래퍼 — 씬 전환 후에는 콜백 실행 안 함 */
    delay(ms, fn) {
        const scene = this;
        setTimeout(() => {
            if (scene.scene && scene.scene.isActive('BattleScene')) {
                fn.call(scene);
            }
        }, ms);
    }

    drawMonsterSprite(x, y, data) {
        const size = data.isBoss ? 48 : 32;
        const g = this.add.graphics();
        g.fillStyle(data.color, 1);
        g.fillRect(x - size / 2, y - size / 2, size, size);
        g.fillStyle(0xff0000, 1);
        const eyeOff = size * 0.2;
        g.fillRect(x - eyeOff - 2, y - size * 0.1, 4, 4);
        g.fillRect(x + eyeOff - 2, y - size * 0.1, 4, 4);
        if (data.isBoss) {
            g.lineStyle(2, 0xff4444);
            g.strokeRect(x - size / 2 - 3, y - size / 2 - 3, size + 6, size + 6);
        }
    }

    moveMenu(dir) {
        if (this.battleOver || !this.playerTurn) return;
        this.selectedMenu = (this.selectedMenu + dir + 4) % 4;
        this.updateMenuHighlight();
    }

    updateMenuHighlight() {
        this.menuItems.forEach((item, i) => {
            item.setColor(i === this.selectedMenu ? '#ffcc44' : '#ffffff');
            item.setBackgroundColor(i === this.selectedMenu ? '#444488' : '#333366');
        });
    }

    onMenuSelect(index) {
        if (this.battleOver || !this.playerTurn) return;

        this.playerTurn = false;

        switch (index) {
            case 0: this.doPlayerAttack(); break;
            case 1: this.doPlayerMpAttack(); break;
            case 2: this.doUseItem(); break;
            case 3: this.doFlee(); break;
        }
    }

    calcDamage(atk, def) {
        const rand = Math.floor(Math.random() * 5) - 2;
        return Math.max(1, atk - def + rand);
    }

    doPlayerAttack() {
        const dmg = this.calcDamage(this.player.atk, this.monster.def);
        this.monster.currentHp = Math.max(0, this.monster.currentHp - dmg);
        this.addLog(`플레이어의 공격! ${dmg} 데미지!`);
        this.cameras.main.shake(100, 0.01);
        this.updateDisplay();

        if (this.monster.currentHp <= 0) {
            this.onMonsterDefeated();
        } else {
            this.delay(600, () => this.doMonsterTurn());
        }
    }

    doPlayerMpAttack() {
        if (this.player.mp < 5) {
            this.addLog('MP가 부족하다!');
            this.playerTurn = true;
            return;
        }
        this.player.mp -= 5;
        const dmg = this.calcDamage(this.player.atk * 1.8, this.monster.def);
        this.monster.currentHp = Math.max(0, this.monster.currentHp - dmg);
        this.addLog(`강력한 마법 공격! ${dmg} 데미지! (MP-5)`);
        this.cameras.main.shake(150, 0.02);
        this.updateDisplay();

        if (this.monster.currentHp <= 0) {
            this.onMonsterDefeated();
        } else {
            this.delay(600, () => this.doMonsterTurn());
        }
    }

    doUseItem() {
        // HP 포션 우선 사용
        const potionKey = GameState.inventory['hp_potion'] ? 'hp_potion'
            : GameState.inventory['mp_potion'] ? 'mp_potion' : null;

        if (!potionKey) {
            this.addLog('사용할 아이템이 없다!');
            this.playerTurn = true;
            return;
        }

        const item = ITEMS[potionKey];
        if (GameState.removeItem(potionKey)) {
            const msg = item.effect(this.player);
            this.addLog(msg);
            this.updateDisplay();
            this.delay(600, () => this.doMonsterTurn());
        }
    }

    doPlayerDefend() {
        this.isDefending = true;
        this.addLog('방어 태세! 받는 데미지 절반.');
        this.delay(400, () => this.doMonsterTurn());
    }

    doFlee() {
        const chance = this.monster.isBoss ? 0 : 0.5;
        if (Math.random() < chance) {
            this.addLog('도망에 성공했다!');
            this.battleOver = true;
            this.delay(800, () => this.returnToDungeon());
        } else {
            this.addLog(this.monster.isBoss ? '보스에게서 도망칠 수 없다!' : '도망 실패!');
            this.delay(600, () => this.doMonsterTurn());
        }
    }

    doMonsterTurn() {
        if (this.battleOver) return;

        let dmg = this.calcDamage(this.monster.atk, this.player.def);
        if (this.isDefending) {
            dmg = Math.max(1, Math.floor(dmg / 2));
            this.isDefending = false;
        }
        this.player.hp = Math.max(0, this.player.hp - dmg);
        this.addLog(`${this.monster.name}의 공격! ${dmg} 데미지!`);
        this.cameras.main.flash(100, 255, 0, 0, true);
        this.updateDisplay();

        if (this.player.hp <= 0) {
            this.onPlayerDefeated();
        } else {
            this.playerTurn = true;
        }
    }

    onMonsterDefeated() {
        this.battleOver = true;
        this.addLog(`${this.monster.name}을(를) 쓰러뜨렸다!`);

        const expGain = this.monster.exp;
        const goldGain = this.monster.gold;
        this.player.gold += goldGain;
        this.addLog(`+${expGain} EXP, +${goldGain} Gold`);

        const leveled = GameState.gainExp(expGain);
        if (leveled) {
            this.addLog(`레벨 업! Lv.${this.player.level}!`);
        }
        this.updateDisplay();

        if (this.monster.isBoss) {
            this.addLog('어둠기사를 처치했다!');
            this.delay(2000, () => {
                this.cameras.main.fadeOut(1000, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('EndingScene');
                });
            });
        } else {
            this.delay(1500, () => this.returnToDungeon());
        }
    }

    onPlayerDefeated() {
        this.battleOver = true;
        this.addLog('쓰러졌다...');
        this.delay(1500, () => {
            if (this.monster.isBoss) {
                this.cameras.main.fadeOut(1000, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('GameOverScene');
                });
            } else {
                this.player.hp = Math.floor(this.player.maxHp / 2);
                this.player.gold = Math.floor(this.player.gold / 2);
                this.cameras.main.fadeOut(800, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('TownScene');
                });
            }
        });
    }

    returnToDungeon() {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('DungeonScene');
        });
    }

    updateDisplay() {
        const m = this.monster;
        this.monsterHpText.setText(`HP: ${m.currentHp} / ${m.hp}`);

        const p = this.player;
        this.playerStatsText.setText(
            `Lv.${p.level}  ${p.hp}/${p.maxHp} HP\n` +
            `${p.mp}/${p.maxMp} MP\n` +
            `ATK:${p.atk}  DEF:${p.def}\n` +
            `Gold:${p.gold}  EXP:${p.exp}/${GameState.expToLevel(p.level)}`
        );
    }

    addLog(msg) {
        const lines = (this.logText.text || '').split('\n');
        lines.push(msg);
        if (lines.length > 6) lines.shift();
        this.logText.setText(lines.join('\n'));
    }
}
