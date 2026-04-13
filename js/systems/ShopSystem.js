/**
 * ShopSystem — 상점 UI (씬 위에 오버레이)
 *
 * 아이템 목록 표시, ↑↓ 선택, ENTER 구매, ESC 닫기
 */
import { ITEMS, SHOP_ITEMS } from '../data/items.js';
import { GameState } from '../data/gameState.js';

export class ShopSystem {
    constructor(scene, onClose) {
        this.scene = scene;
        this.onClose = onClose || (() => {});
        this.active = false;
        this.selectedIndex = 0;
        this.elements = [];

        this.keyUp = scene.input.keyboard.addKey('UP');
        this.keyDown = scene.input.keyboard.addKey('DOWN');
        this.keyEnter = scene.input.keyboard.addKey('ENTER');
        this.keyEsc = scene.input.keyboard.addKey('ESC');
        this.keySpace = scene.input.keyboard.addKey('SPACE');
        this.keyE = scene.input.keyboard.addKey('E');
    }

    get isActive() {
        return this.active;
    }

    open() {
        this.active = true;
        this.selectedIndex = 0;
        this.mode = 'shop'; // 'shop' or 'inventory'
        this.draw();
    }

    close() {
        this.active = false;
        this.clearElements();
        this.onClose();
    }

    clearElements() {
        this.elements.forEach(el => el.destroy());
        this.elements = [];
    }

    draw() {
        this.clearElements();
        const W = 480, H = 320;

        // 배경
        const bg = this.scene.add.rectangle(W / 2, H / 2, W - 20, H - 20, 0x111133, 0.95)
            .setStrokeStyle(2, 0x6666cc).setDepth(150);
        this.elements.push(bg);

        // 탭
        const shopTab = this.scene.add.text(30, 18, '[ 구매 ]', {
            fontSize: '10px', fontFamily: 'monospace',
            color: this.mode === 'shop' ? '#ffcc44' : '#666666',
        }).setDepth(151);
        const invTab = this.scene.add.text(100, 18, '[ 가방 ]', {
            fontSize: '10px', fontFamily: 'monospace',
            color: this.mode === 'inventory' ? '#ffcc44' : '#666666',
        }).setDepth(151);
        this.elements.push(shopTab, invTab);

        // 골드 표시
        const goldText = this.scene.add.text(W - 30, 18, `Gold: ${GameState.player.gold}`, {
            fontSize: '10px', fontFamily: 'monospace', color: '#ffcc44',
        }).setOrigin(1, 0).setDepth(151);
        this.elements.push(goldText);

        // 장비 표시
        const wpn = GameState.equipment.weapon ? ITEMS[GameState.equipment.weapon].name : '없음';
        const arm = GameState.equipment.armor ? ITEMS[GameState.equipment.armor].name : '없음';
        const equipText = this.scene.add.text(W - 30, 32, `무기:${wpn}  방어구:${arm}`, {
            fontSize: '8px', fontFamily: 'monospace', color: '#88aacc',
        }).setOrigin(1, 0).setDepth(151);
        this.elements.push(equipText);

        if (this.mode === 'shop') {
            this.drawShopList();
        } else {
            this.drawInventoryList();
        }

        // 조작 안내
        const help = this.scene.add.text(W / 2, H - 18, 'E:탭전환  ↑↓:선택  ENTER:구매/사용  ESC:닫기', {
            fontSize: '7px', fontFamily: 'monospace', color: '#888888',
        }).setOrigin(0.5).setDepth(151);
        this.elements.push(help);
    }

    drawShopList() {
        const startY = 50;

        // 헤더
        const header = this.scene.add.text(30, startY, '아이템          가격   효과', {
            fontSize: '9px', fontFamily: 'monospace', color: '#aaaaaa',
        }).setDepth(151);
        this.elements.push(header);

        SHOP_ITEMS.forEach((key, i) => {
            const item = ITEMS[key];
            const owned = GameState.inventory[key] || 0;
            const equipped = (GameState.equipment.weapon === key || GameState.equipment.armor === key);
            const label = `${item.name}${owned > 0 ? ' x' + owned : ''}${equipped ? ' [장착]' : ''}`;
            const line = `${label.padEnd(14)} ${String(item.price).padStart(4)}G  ${item.desc}`;

            const canBuy = GameState.player.gold >= item.price;
            const isSelected = i === this.selectedIndex;

            const txt = this.scene.add.text(30, startY + 16 + i * 18, (isSelected ? '▶ ' : '  ') + line, {
                fontSize: '9px', fontFamily: 'monospace',
                color: isSelected ? '#ffcc44' : (canBuy ? '#ffffff' : '#664444'),
            }).setDepth(151);
            this.elements.push(txt);
        });

        // 메시지 영역
        this.msgText = this.scene.add.text(30, 260, '', {
            fontSize: '9px', fontFamily: 'monospace', color: '#44ff44',
        }).setDepth(151);
        this.elements.push(this.msgText);
    }

    drawInventoryList() {
        const startY = 50;
        const invKeys = Object.keys(GameState.inventory);

        if (invKeys.length === 0) {
            const empty = this.scene.add.text(30, startY + 16, '가방이 비어 있습니다.', {
                fontSize: '10px', fontFamily: 'monospace', color: '#888888',
            }).setDepth(151);
            this.elements.push(empty);
            return;
        }

        const header = this.scene.add.text(30, startY, '아이템          수량   효과', {
            fontSize: '9px', fontFamily: 'monospace', color: '#aaaaaa',
        }).setDepth(151);
        this.elements.push(header);

        invKeys.forEach((key, i) => {
            const item = ITEMS[key];
            const count = GameState.inventory[key];
            const equipped = (GameState.equipment.weapon === key || GameState.equipment.armor === key);
            const label = `${item.name}${equipped ? ' [장착]' : ''}`;
            const action = item.type === 'consumable' ? '사용' : '장착';
            const line = `${label.padEnd(14)} x${String(count).padStart(2)}   ${item.desc}`;

            const isSelected = i === this.selectedIndex;
            const txt = this.scene.add.text(30, startY + 16 + i * 18,
                (isSelected ? `▶ ${line}  [${action}]` : `  ${line}`), {
                fontSize: '9px', fontFamily: 'monospace',
                color: isSelected ? '#ffcc44' : '#ffffff',
            }).setDepth(151);
            this.elements.push(txt);
        });

        this.msgText = this.scene.add.text(30, 260, '', {
            fontSize: '9px', fontFamily: 'monospace', color: '#44ff44',
        }).setDepth(151);
        this.elements.push(this.msgText);
    }

    showMsg(text) {
        if (this.msgText) this.msgText.setText(text);
    }

    getListLength() {
        if (this.mode === 'shop') return SHOP_ITEMS.length;
        return Object.keys(GameState.inventory).length;
    }

    update() {
        if (!this.active) return;

        if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
            this.close();
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
            this.mode = this.mode === 'shop' ? 'inventory' : 'shop';
            this.selectedIndex = 0;
            this.draw();
            return;
        }

        const len = this.getListLength();
        if (len === 0) return;

        if (Phaser.Input.Keyboard.JustDown(this.keyUp)) {
            this.selectedIndex = (this.selectedIndex - 1 + len) % len;
            this.draw();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyDown)) {
            this.selectedIndex = (this.selectedIndex + 1) % len;
            this.draw();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyEnter) || Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            if (this.mode === 'shop') {
                this.buyItem();
            } else {
                this.useItem();
            }
        }
    }

    buyItem() {
        const key = SHOP_ITEMS[this.selectedIndex];
        const item = ITEMS[key];

        if (GameState.player.gold < item.price) {
            this.showMsg('골드가 부족합니다!');
            return;
        }

        // 장비는 1개만 소유 가능
        if ((item.type === 'weapon' || item.type === 'armor') &&
            ((GameState.inventory[key] || 0) > 0 ||
             GameState.equipment.weapon === key ||
             GameState.equipment.armor === key)) {
            this.showMsg('이미 가지고 있습니다!');
            return;
        }

        GameState.player.gold -= item.price;
        GameState.addItem(key);
        this.showMsg(`${item.name} 구매!`);

        // 장비 아이템이면 자동 장착
        if (item.type === 'weapon' || item.type === 'armor') {
            GameState.equip(key);
            this.showMsg(`${item.name} 구매 & 장착!`);
        }

        this.draw();
    }

    useItem() {
        const invKeys = Object.keys(GameState.inventory);
        if (this.selectedIndex >= invKeys.length) return;

        const key = invKeys[this.selectedIndex];
        const item = ITEMS[key];

        if (item.type === 'consumable') {
            if (GameState.removeItem(key)) {
                const msg = item.effect(GameState.player);
                this.showMsg(msg);
            }
        } else if (item.type === 'weapon' || item.type === 'armor') {
            GameState.equip(key);
            this.showMsg(`${item.name} 장착!`);
        }

        // 인덱스 보정
        const newLen = Object.keys(GameState.inventory).length;
        if (this.selectedIndex >= newLen) this.selectedIndex = Math.max(0, newLen - 1);
        this.draw();
    }
}
