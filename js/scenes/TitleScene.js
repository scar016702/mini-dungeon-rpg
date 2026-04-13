/**
 * TitleScene — 타이틀 화면 + 인트로 영상
 *
 * 돌바닥 배경, 용사 vs 어둠기사, 횃불, 반짝이 이펙트
 */
import { GameState } from '../data/gameState.js';

export class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    preload() {
        // 에셋 없음 — 모든 그래픽은 코드로 생성
    }

    create() {
        const W = 480, H = 320;
        this.cameras.main.setBackgroundColor('#14142a');

        // --- 돌바닥 배경 ---
        this.drawStoneFloor(W, H);

        // --- 어두운 비네트 오버레이 ---
        this.drawVignette(W, H);

        // --- 횃불 (좌/우) ---
        this.drawTorch(120, 155);
        this.drawTorch(360, 155);

        // --- 용사 캐릭터 ---
        this.drawHero(200, 185);

        // --- 어둠기사 캐릭터 ---
        this.drawDarkKnight(280, 175);

        // --- 타이틀 텍스트 ---
        this.add.text(W / 2, 65, '미니 던전 RPG', {
            fontSize: '28px',
            fontFamily: 'monospace',
            color: '#f0c040',
            stroke: '#000000',
            strokeThickness: 5,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true },
        }).setOrigin(0.5).setDepth(10);

        // --- 서브 타이틀 ---
        this.add.text(W / 2, 105, '어둠기사를 처치하라!', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#bbbbcc',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5).setDepth(10);

        // --- ENTER 시작 안내 ---
        const startText = this.add.text(W / 2, 265, 'ENTER 키를 눌러 시작', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ccccdd',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5).setDepth(10);

        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 900,
            yoyo: true,
            repeat: -1,
        });

        // --- 반짝이 파티클 ---
        this.createSparkles(W, H);

        // --- 입력 ---
        this.input.keyboard.once('keydown-ENTER', () => {
            GameState.reset();
            this.goToTown();
        });

        this.cameras.main.fadeIn(800, 0, 0, 0);
    }

    // ===== 그래픽 헬퍼 =====

    drawStoneFloor(W, H) {
        const g = this.add.graphics().setDepth(0);
        // 어두운 배경
        g.fillStyle(0x14142a);
        g.fillRect(0, 0, W, H);

        // 돌바닥 (하단 영역)
        const floorY = 140;
        for (let y = floorY; y < H; y += 16) {
            for (let x = 0; x < W; x += 16) {
                // 회갈색 돌바닥
                const r = 0x30 + Math.floor(Math.random() * 0x10);
                const gb = 0x28 + Math.floor(Math.random() * 0x0c);
                const shade = (r << 16) | (gb << 8) | (gb - 4);
                g.fillStyle(shade);
                g.fillRect(x, y, 15, 15);
                // 돌 사이 어두운 줄
                g.fillStyle(0x1a1820);
                g.fillRect(x + 15, y, 1, 16);
                g.fillRect(x, y + 15, 16, 1);
            }
        }

        // 중앙에 약간 밝은 원형 영역 (조명 효과)
        const cx = W / 2, cy = 190;
        for (let r = 100; r > 0; r -= 5) {
            const alpha = 0.02;
            g.fillStyle(0x886644, alpha);
            g.fillCircle(cx, cy, r);
        }
    }

    drawVignette(W, H) {
        const g = this.add.graphics().setDepth(1);
        // 상단 어둡게
        for (let i = 0; i < 60; i++) {
            g.fillStyle(0x14142a, 1 - i / 60);
            g.fillRect(0, i, W, 1);
        }
        // 좌우 어둡게
        for (let i = 0; i < 80; i++) {
            const alpha = (1 - i / 80) * 0.4;
            g.fillStyle(0x14142a, alpha);
            g.fillRect(i, 0, 1, H);
            g.fillRect(W - i, 0, 1, H);
        }
    }

    drawTorch(x, y) {
        const g = this.add.graphics().setDepth(5);

        // 횃불 막대
        g.fillStyle(0x664422);
        g.fillRect(x - 2, y, 4, 24);

        // 횃불 받침
        g.fillStyle(0x554433);
        g.fillRect(x - 4, y + 24, 8, 4);

        // 불꽃 (정적 기본)
        g.fillStyle(0xff6600);
        g.fillRect(x - 4, y - 6, 8, 8);
        g.fillStyle(0xffaa00);
        g.fillRect(x - 3, y - 4, 6, 5);
        g.fillStyle(0xffdd44);
        g.fillRect(x - 1, y - 2, 3, 3);

        // 불빛 glow 효과
        const glow = this.add.graphics().setDepth(4);
        for (let r = 40; r > 0; r -= 4) {
            glow.fillStyle(0xff8800, 0.015);
            glow.fillCircle(x, y - 2, r);
        }

        // 불꽃 흔들림 애니메이션
        const flame = this.add.graphics().setDepth(6);
        this.tweens.addCounter({
            from: 0, to: 100,
            duration: 300,
            repeat: -1,
            onUpdate: (tween) => {
                flame.clear();
                const t = tween.getValue() / 100;
                const flicker = Math.sin(t * Math.PI * 2) * 2;
                flame.fillStyle(0xff6600, 0.8);
                flame.fillRect(x - 4 + flicker, y - 7, 8, 9);
                flame.fillStyle(0xffaa00, 0.9);
                flame.fillRect(x - 3 + flicker * 0.5, y - 5, 6, 6);
                flame.fillStyle(0xffee66);
                flame.fillRect(x - 1, y - 3, 3, 3);
            },
        });
    }

    drawHero(x, y) {
        const g = this.add.graphics().setDepth(7);

        // 몸통 (튜닉)
        g.fillStyle(0x887755);
        g.fillRect(x - 6, y, 12, 14);
        // 머리
        g.fillStyle(0xffcc99);
        g.fillRect(x - 5, y - 10, 10, 10);
        // 머리카락
        g.fillStyle(0x775533);
        g.fillRect(x - 5, y - 10, 10, 4);
        g.fillRect(x - 6, y - 8, 2, 6);
        // 눈
        g.fillStyle(0x222222);
        g.fillRect(x - 2, y - 5, 2, 2);
        g.fillRect(x + 3, y - 5, 2, 2);
        // 다리
        g.fillStyle(0x664422);
        g.fillRect(x - 4, y + 14, 4, 6);
        g.fillRect(x + 2, y + 14, 4, 6);

        // 검 (오른손)
        g.fillStyle(0xcccccc);
        g.fillRect(x + 8, y - 8, 2, 18);
        g.fillStyle(0xaaaaaa);
        g.fillRect(x + 6, y + 2, 6, 2);
        g.fillStyle(0x886622);
        g.fillRect(x + 7, y + 4, 4, 4);
    }

    drawDarkKnight(x, y) {
        const g = this.add.graphics().setDepth(7);

        // 몸통 (갑옷) — 더 큰 체격
        g.fillStyle(0x222233);
        g.fillRect(x - 10, y - 4, 20, 20);
        // 어깨 장식
        g.fillStyle(0x333344);
        g.fillRect(x - 14, y - 4, 6, 8);
        g.fillRect(x + 8, y - 4, 6, 8);

        // 투구
        g.fillStyle(0x2a2a3a);
        g.fillRect(x - 8, y - 18, 16, 14);
        // 투구 장식
        g.fillStyle(0x333344);
        g.fillRect(x - 9, y - 6, 18, 3);
        // 눈 (붉은 빛)
        g.fillStyle(0xff2200);
        g.fillRect(x - 4, y - 12, 3, 2);
        g.fillRect(x + 2, y - 12, 3, 2);

        // 다리
        g.fillStyle(0x1a1a2a);
        g.fillRect(x - 6, y + 16, 5, 8);
        g.fillRect(x + 2, y + 16, 5, 8);

        // 망토
        g.fillStyle(0x330022, 0.7);
        g.fillRect(x - 12, y - 2, 4, 22);
        g.fillRect(x + 8, y - 2, 4, 22);

        // 어둠 오라
        const aura = this.add.graphics().setDepth(6);
        for (let r = 30; r > 0; r -= 3) {
            aura.fillStyle(0x440044, 0.02);
            aura.fillCircle(x, y + 4, r);
        }

        // 오라 펄스 애니메이션
        const pulse = this.add.graphics().setDepth(5);
        this.tweens.addCounter({
            from: 0, to: 100,
            duration: 2000,
            repeat: -1,
            onUpdate: (tween) => {
                pulse.clear();
                const t = tween.getValue() / 100;
                const r = 20 + Math.sin(t * Math.PI * 2) * 8;
                pulse.fillStyle(0x440044, 0.05);
                pulse.fillCircle(x, y + 4, r);
            },
        });
    }

    createSparkles(W, H) {
        // 작은 반짝이 파티클들
        const positions = [
            { x: 60, y: 50 }, { x: 420, y: 280 },
            { x: 30, y: 200 }, { x: 450, y: 120 },
            { x: 240, y: 300 },
        ];

        positions.forEach((pos, i) => {
            const sparkle = this.add.graphics().setDepth(8);
            this.tweens.addCounter({
                from: 0, to: 100,
                duration: 1500 + i * 400,
                repeat: -1,
                onUpdate: (tween) => {
                    sparkle.clear();
                    const t = tween.getValue() / 100;
                    const alpha = Math.sin(t * Math.PI);
                    const size = 1 + alpha * 2;
                    sparkle.fillStyle(0xaaccff, alpha * 0.6);
                    // 십자 모양 반짝이
                    sparkle.fillRect(pos.x - size, pos.y, size * 2, 1);
                    sparkle.fillRect(pos.x, pos.y - size, 1, size * 2);
                },
            });
        });
    }

    goToTown() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('TownScene');
        });
    }
}
