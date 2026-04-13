/**
 * EndingScene — 엔딩 화면
 */
export class EndingScene extends Phaser.Scene {
    constructor() {
        super('EndingScene');
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#000000');

        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.add.text(width / 2, height / 3, '축하합니다!', {
            fontSize: '24px', fontFamily: 'monospace',
            color: '#ffcc44', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 3 + 32, '어둠기사를 처치했습니다!', {
            fontSize: '12px', fontFamily: 'monospace', color: '#ffffff',
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.6, '미니 던전 RPG  - END -', {
            fontSize: '10px', fontFamily: 'monospace', color: '#888888',
        }).setOrigin(0.5);

        const returnText = this.add.text(width / 2, height * 0.8, 'ENTER 키로 타이틀로', {
            fontSize: '10px', fontFamily: 'monospace', color: '#aaaaaa',
        }).setOrigin(0.5);

        this.tweens.add({
            targets: returnText,
            alpha: 0.3, duration: 800, yoyo: true, repeat: -1,
        });

        this.input.keyboard.once('keydown-ENTER', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('TitleScene');
            });
        });
    }
}
