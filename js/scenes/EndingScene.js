/**
 * EndingScene — 엔딩 화면 (보스 처치 후)
 * 순차 애니메이션으로 승리 연출 + 최종 스탯 표시
 */
import { GameState } from '../data/gameState.js';

export class EndingScene extends Phaser.Scene {
    constructor() {
        super('EndingScene');
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.fadeIn(1500, 0, 0, 0);

        const elements = [];

        // 1) 승리 텍스트 (1초 후)
        const victoryText = this.add.text(width / 2, height * 0.15, '축하합니다!', {
            fontSize: '24px', fontFamily: 'monospace',
            color: '#ffcc44', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5).setAlpha(0);
        elements.push({ target: victoryText, delay: 1000, duration: 1500 });

        // 2) 처치 메시지 (2초 후)
        const defeatMsg = this.add.text(width / 2, height * 0.28, '어둠기사를 처치했습니다!', {
            fontSize: '12px', fontFamily: 'monospace', color: '#ffffff',
        }).setOrigin(0.5).setAlpha(0);
        elements.push({ target: defeatMsg, delay: 2000, duration: 1000 });

        // 3) 히어로 그래픽 (2.5초 후)
        const heroGfx = this.add.graphics();
        heroGfx.setAlpha(0);
        this.drawHeroVictory(heroGfx, width / 2, height * 0.48);
        elements.push({ target: heroGfx, delay: 2500, duration: 800 });

        // 4) 최종 스탯 (3.5초 후)
        const p = GameState.player;
        const statsLines = [
            `━━━ 최종 기록 ━━━`,
            `레벨: ${p.level}`,
            `HP: ${p.maxHp}  MP: ${p.maxMp}`,
            `ATK: ${p.atk}  DEF: ${p.def}`,
            `보유 골드: ${p.gold}`,
        ];
        const statsText = this.add.text(width / 2, height * 0.68, statsLines.join('\n'), {
            fontSize: '10px', fontFamily: 'monospace', color: '#88ccff',
            align: 'center', lineSpacing: 4,
        }).setOrigin(0.5).setAlpha(0);
        elements.push({ target: statsText, delay: 3500, duration: 1000 });

        // 5) END 텍스트 (5초 후)
        const endText = this.add.text(width / 2, height * 0.85, '미니 던전 RPG  - END -', {
            fontSize: '10px', fontFamily: 'monospace', color: '#888888',
        }).setOrigin(0.5).setAlpha(0);
        elements.push({ target: endText, delay: 5000, duration: 1000 });

        // 6) 타이틀 복귀 안내 (6초 후)
        const returnText = this.add.text(width / 2, height * 0.93, 'ENTER 키로 타이틀로', {
            fontSize: '10px', fontFamily: 'monospace', color: '#aaaaaa',
        }).setOrigin(0.5).setAlpha(0);
        elements.push({ target: returnText, delay: 6000, duration: 800 });

        // 순차 페이드인 애니메이션
        elements.forEach(({ target, delay, duration }) => {
            this.tweens.add({
                targets: target,
                alpha: 1,
                duration,
                delay,
                ease: 'Power2',
            });
        });

        // 타이틀 복귀 텍스트 깜빡임 (등장 후)
        this.time.delayedCall(6800, () => {
            this.tweens.add({
                targets: returnText,
                alpha: 0.3, duration: 800, yoyo: true, repeat: -1,
            });
        });

        // 골든 파티클 효과 (3초 후)
        this.time.delayedCall(3000, () => {
            this.createVictoryParticles(width, height);
        });

        // ENTER 입력 (6초 후 활성화)
        this.canReturn = false;
        this.time.delayedCall(6000, () => {
            this.canReturn = true;
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            if (!this.canReturn) return;
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('TitleScene');
            });
        });
    }

    drawHeroVictory(g, cx, cy) {
        // 승리 포즈 히어로 (검을 높이 든 모습)
        const s = 2;
        // 몸통
        g.fillStyle(0x8B4513);
        g.fillRect(cx - 6 * s, cy - 2 * s, 12 * s, 14 * s);
        // 머리
        g.fillStyle(0xFFDBAC);
        g.fillRect(cx - 5 * s, cy - 10 * s, 10 * s, 10 * s);
        // 머리카락
        g.fillStyle(0x654321);
        g.fillRect(cx - 5 * s, cy - 12 * s, 10 * s, 4 * s);
        // 눈
        g.fillStyle(0x000000);
        g.fillRect(cx - 3 * s, cy - 6 * s, 2 * s, 2 * s);
        g.fillRect(cx + 1 * s, cy - 6 * s, 2 * s, 2 * s);
        // 검 (높이 든 모습)
        g.fillStyle(0xCCCCCC);
        g.fillRect(cx + 7 * s, cy - 20 * s, 2 * s, 16 * s);
        g.fillStyle(0xFFD700);
        g.fillRect(cx + 5 * s, cy - 4 * s, 6 * s, 2 * s);
        // 다리
        g.fillStyle(0x333333);
        g.fillRect(cx - 4 * s, cy + 12 * s, 4 * s, 6 * s);
        g.fillRect(cx, cy + 12 * s, 4 * s, 6 * s);
    }

    createVictoryParticles(w, h) {
        const colors = [0xFFD700, 0xFFCC44, 0xFFAA00, 0xFFFFFF];
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * w;
            const startY = -10;
            const endY = h + 10;
            const size = 1 + Math.random() * 2;
            const color = colors[Math.floor(Math.random() * colors.length)];

            const particle = this.add.graphics();
            particle.fillStyle(color, 0.8);
            particle.fillRect(-size / 2, -size / 2, size, size);
            particle.setPosition(x, startY);

            this.tweens.add({
                targets: particle,
                y: endY,
                x: x + (Math.random() - 0.5) * 60,
                alpha: 0,
                duration: 3000 + Math.random() * 3000,
                delay: Math.random() * 2000,
                repeat: -1,
                onRepeat: () => {
                    particle.setPosition(Math.random() * w, -10);
                    particle.setAlpha(0.8);
                },
            });
        }
    }
}
