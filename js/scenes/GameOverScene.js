/**
 * GameOverScene — 보스전 패배 시 게임 오버 화면
 */
export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.fadeIn(1500, 0, 0, 0);

        // YOU DIED
        const diedText = this.add.text(width / 2, height / 3, 'YOU DIED', {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#cc0000',
            stroke: '#440000',
            strokeThickness: 4,
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: diedText,
            alpha: 1,
            duration: 2000,
            ease: 'Power2',
        });

        // GAME END 안내
        const endText = this.add.text(width / 2, height / 3 + 40, '어둠기사에게 패배했습니다...', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#999999',
        }).setOrigin(0.5).setAlpha(0);

        this.time.delayedCall(1500, () => {
            this.tweens.add({
                targets: endText,
                alpha: 1,
                duration: 1000,
            });
        });

        const gameEndText = this.add.text(width / 2, height / 3 + 60, '- GAME END -', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#cc0000',
        }).setOrigin(0.5).setAlpha(0);

        this.time.delayedCall(2500, () => {
            this.tweens.add({
                targets: gameEndText,
                alpha: 1,
                duration: 1000,
            });
        });

        // 타이틀로 돌아가기 안내
        const returnText = this.add.text(width / 2, height * 0.8, 'ENTER 키로 타이틀로', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#aaaaaa',
        }).setOrigin(0.5).setAlpha(0);

        this.time.delayedCall(3500, () => {
            returnText.setAlpha(1);
            this.tweens.add({
                targets: returnText,
                alpha: 0.3,
                duration: 800,
                yoyo: true,
                repeat: -1,
            });

            this.input.keyboard.once('keydown-ENTER', () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('TitleScene');
                });
            });
        });
    }
}
