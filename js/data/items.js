/**
 * 아이템 데이터 정의
 */
export const ITEMS = {
    hp_potion: {
        name: 'HP 포션',
        price: 15,
        type: 'consumable',
        desc: 'HP +30 회복',
        effect(player) {
            const heal = Math.min(30, player.maxHp - player.hp);
            player.hp += heal;
            return `HP ${heal} 회복!`;
        },
    },
    mp_potion: {
        name: 'MP 포션',
        price: 20,
        type: 'consumable',
        desc: 'MP +15 회복',
        effect(player) {
            const heal = Math.min(15, player.maxMp - player.mp);
            player.mp += heal;
            return `MP ${heal} 회복!`;
        },
    },
    steel_sword: {
        name: '강철 검',
        price: 80,
        type: 'weapon',
        desc: 'ATK +5',
        stat: { atk: 5 },
    },
    leather_armor: {
        name: '가죽 갑옷',
        price: 60,
        type: 'armor',
        desc: 'DEF +3',
        stat: { def: 3 },
    },
};

/** 상점에서 판매하는 아이템 키 목록 */
export const SHOP_ITEMS = ['hp_potion', 'mp_potion', 'steel_sword', 'leather_armor'];
