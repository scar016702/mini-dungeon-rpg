/**
 * 몬스터 데이터 정의
 */
export const MONSTERS = {
    slime: {
        name: '슬라임',
        hp: 20, atk: 5, def: 2,
        exp: 10, gold: 5,
        color: 0x44cc44,
        desc: '최약체 몬스터',
    },
    bat: {
        name: '박쥐',
        hp: 30, atk: 8, def: 3,
        exp: 15, gold: 8,
        color: 0x8844aa,
        desc: '스피드형 몬스터',
    },
    skeleton: {
        name: '스켈레톤',
        hp: 50, atk: 12, def: 6,
        exp: 25, gold: 15,
        color: 0xcccccc,
        desc: '중간보스급 몬스터',
    },
    darkKnight: {
        name: '어둠기사',
        hp: 150, atk: 20, def: 10,
        exp: 100, gold: 50,
        color: 0x440044,
        desc: '던전의 보스',
        isBoss: true,
    },
};

/** 던전 일반 인카운터에서 등장하는 몬스터 키 목록 */
export const DUNGEON_ENCOUNTERS = ['slime', 'bat', 'skeleton'];
