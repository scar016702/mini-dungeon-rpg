/**
 * DialogSystem — NPC 대화 UI
 *
 * 씬 위에 오버레이로 대화창을 표시한다.
 * SPACE/ENTER로 다음 페이지, 선택지가 있으면 ↑↓ + ENTER로 선택.
 */
export class DialogSystem {
    /**
     * @param {Phaser.Scene} scene
     * @param {function} [onEnd] 대화 종료 콜백
     */
    constructor(scene, onEnd) {
        this.scene = scene;
        this.onEnd = onEnd || (() => {});
        this.active = false;
        this.pages = [];
        this.pageIndex = 0;
        this.choiceIndex = 0;
        this.choiceTexts = [];

        const W = 480, H = 320;
        const boxH = 80;
        const boxY = H - boxH - 4;

        // 대화창 배경
        this.bg = scene.add.rectangle(W / 2, boxY + boxH / 2, W - 16, boxH, 0x111133, 0.92)
            .setStrokeStyle(2, 0x6666cc)
            .setDepth(100)
            .setVisible(false);

        // 화자 이름
        this.nameText = scene.add.text(16, boxY + 4, '', {
            fontSize: '9px', fontFamily: 'monospace', color: '#ffcc44',
        }).setDepth(101).setVisible(false);

        // 대화 텍스트
        this.dialogText = scene.add.text(16, boxY + 18, '', {
            fontSize: '10px', fontFamily: 'monospace', color: '#ffffff',
            wordWrap: { width: W - 40 }, lineSpacing: 4,
        }).setDepth(101).setVisible(false);

        // ▼ 계속 표시
        this.continueIcon = scene.add.text(W - 24, boxY + boxH - 14, '▼', {
            fontSize: '10px', color: '#aaaaaa',
        }).setDepth(101).setVisible(false);

        scene.tweens.add({
            targets: this.continueIcon,
            alpha: 0.3, duration: 500, yoyo: true, repeat: -1,
        });

        // 키 입력
        this.keySpace = scene.input.keyboard.addKey('SPACE');
        this.keyEnter = scene.input.keyboard.addKey('ENTER');
        this.keyUp = scene.input.keyboard.addKey('UP');
        this.keyDown = scene.input.keyboard.addKey('DOWN');
    }

    /** 대화 시작 */
    start(dialogData, speakerName) {
        this.pages = dialogData.pages;
        this.pageIndex = 0;
        this.speakerName = speakerName || '';
        this.active = true;
        this.showPage();
    }

    get isActive() {
        return this.active;
    }

    showPage() {
        const page = this.pages[this.pageIndex];
        if (!page) {
            this.close();
            return;
        }

        this.bg.setVisible(true);
        this.nameText.setVisible(true).setText(this.speakerName);
        this.dialogText.setVisible(true).setText(page.text);

        // 선택지 정리
        this.clearChoices();

        if (page.choices) {
            this.continueIcon.setVisible(false);
            this.choiceIndex = 0;
            const startY = this.bg.y + 10;
            page.choices.forEach((choice, i) => {
                const txt = this.scene.add.text(300, startY + i * 16, choice.label, {
                    fontSize: '10px', fontFamily: 'monospace', color: '#ffffff',
                }).setDepth(102);
                this.choiceTexts.push(txt);
            });
            this.updateChoiceHighlight();
        } else {
            this.continueIcon.setVisible(true);
        }
    }

    clearChoices() {
        this.choiceTexts.forEach(t => t.destroy());
        this.choiceTexts = [];
    }

    updateChoiceHighlight() {
        this.choiceTexts.forEach((txt, i) => {
            txt.setText((i === this.choiceIndex ? '▶ ' : '  ') +
                this.pages[this.pageIndex].choices[i].label);
            txt.setColor(i === this.choiceIndex ? '#ffcc44' : '#aaaaaa');
        });
    }

    /** 매 프레임 update에서 호출 */
    update() {
        if (!this.active) return;

        const page = this.pages[this.pageIndex];

        if (page && page.choices) {
            // 선택지 모드
            if (Phaser.Input.Keyboard.JustDown(this.keyUp)) {
                this.choiceIndex = (this.choiceIndex - 1 + page.choices.length) % page.choices.length;
                this.updateChoiceHighlight();
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyDown)) {
                this.choiceIndex = (this.choiceIndex + 1) % page.choices.length;
                this.updateChoiceHighlight();
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyEnter) || Phaser.Input.Keyboard.JustDown(this.keySpace)) {
                const choice = page.choices[this.choiceIndex];
                this.clearChoices();

                if (choice.action) {
                    // 특수 액션 (예: openShop)
                    this.close(choice.action);
                    return;
                }
                if (choice.next) {
                    // 다른 대화로 이동
                    this.close(null, choice.next);
                    return;
                }
                // next가 null이면 그냥 닫기
                this.close();
            }
        } else {
            // 일반 텍스트 → 다음 페이지
            if (Phaser.Input.Keyboard.JustDown(this.keyEnter) || Phaser.Input.Keyboard.JustDown(this.keySpace)) {
                this.pageIndex++;
                if (this.pageIndex >= this.pages.length) {
                    this.close();
                } else {
                    this.showPage();
                }
            }
        }
    }

    close(action, nextDialogKey) {
        this.active = false;
        this.bg.setVisible(false);
        this.nameText.setVisible(false);
        this.dialogText.setVisible(false);
        this.continueIcon.setVisible(false);
        this.clearChoices();
        this.onEnd(action, nextDialogKey);
    }
}
