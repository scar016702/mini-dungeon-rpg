/**
 * GameState — 전역 플레이어 상태
 * 씬 간 공유되는 데이터를 관리한다.
 */
import { ITEMS } from './items.js';

export const GameState = {
    player: {
        hp: 100,
        maxHp: 100,
        mp: 30,
        maxMp: 30,
        atk: 12,
        def: 5,
        gold: 50,
        level: 1,
        exp: 0,
    },

    /** 인벤토리: { itemKey: count } */
    inventory: {},

    /** 장비: { weapon: itemKey|null, armor: itemKey|null } */
    equipment: { weapon: null, armor: null },

    /** 장비로 인한 추가 스탯 */
    baseAtk: 12,
    baseDef: 5,

    /** 레벨업에 필요한 경험치 */
    expToLevel(level) {
        return level * 30;
    },

    /** 경험치 획득 및 레벨업 체크. 레벨업 시 true 반환 */
    gainExp(amount) {
        this.player.exp += amount;
        const needed = this.expToLevel(this.player.level);
        if (this.player.exp >= needed) {
            this.player.exp -= needed;
            this.player.level += 1;
            this.player.maxHp += 15;
            this.player.hp = this.player.maxHp;
            this.player.maxMp += 5;
            this.player.mp = this.player.maxMp;
            this.baseAtk += 3;
            this.baseDef += 2;
            this.recalcStats();
            return true;
        }
        return false;
    },

    /** 장비 스탯 반영 */
    recalcStats() {
        let bonusAtk = 0, bonusDef = 0;
        if (this.equipment.weapon) {
            const item = ITEMS[this.equipment.weapon];
            if (item && item.stat) bonusAtk += item.stat.atk || 0;
        }
        if (this.equipment.armor) {
            const item = ITEMS[this.equipment.armor];
            if (item && item.stat) bonusDef += item.stat.def || 0;
        }
        this.player.atk = this.baseAtk + bonusAtk;
        this.player.def = this.baseDef + bonusDef;
    },

    /** 아이템 추가 */
    addItem(key, count = 1) {
        this.inventory[key] = (this.inventory[key] || 0) + count;
    },

    /** 아이템 사용/제거. 성공 시 true */
    removeItem(key, count = 1) {
        if ((this.inventory[key] || 0) < count) return false;
        this.inventory[key] -= count;
        if (this.inventory[key] <= 0) delete this.inventory[key];
        return true;
    },

    /** 장비 장착 */
    equip(key) {
        const item = ITEMS[key];
        if (!item) return;
        const slot = item.type === 'weapon' ? 'weapon' : 'armor';
        // 기존 장비 해제
        if (this.equipment[slot]) {
            this.addItem(this.equipment[slot]);
        }
        this.removeItem(key);
        this.equipment[slot] = key;
        this.recalcStats();
    },

    /** 던전 내 플레이어 위치 (전투 후 복귀용) */
    dungeonPos: null,

    /** 상태 초기화 (새 게임) */
    reset() {
        Object.assign(this.player, {
            hp: 100, maxHp: 100,
            mp: 30, maxMp: 30,
            atk: 12, def: 5,
            gold: 50, level: 1, exp: 0,
        });
        this.baseAtk = 12;
        this.baseDef = 5;
        this.inventory = {};
        this.equipment = { weapon: null, armor: null };
        this.dungeonPos = null;
    },
};
