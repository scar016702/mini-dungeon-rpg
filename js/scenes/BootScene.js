/**
 * BootScene — placeholder 텍스처를 코드로 생성하고 프리로드
 */
export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // 로딩 텍스트
        const { width, height } = this.scale;
        this.add.text(width / 2, height / 2, '로딩 중...', {
            fontSize: '14px',
            color: '#ffffff',
        }).setOrigin(0.5);
    }

    create() {
        this.generateTextures();

        // URL 파라미터로 씬 바로 시작 (디버그용)
        const params = new URLSearchParams(window.location.search);
        const debugScene = params.get('scene');
        if (debugScene && this.scene.manager.keys[debugScene]) {
            const monsterKey = params.get('monster') || 'slime';
            this.scene.start(debugScene, { monsterKey });
        } else {
            this.scene.start('TitleScene');
        }
    }

    generateTextures() {
        const TILE = 16;

        // 풀 타일 (바닥)
        const grass = this.make.graphics({ add: false });
        grass.fillStyle(0x4a7c3f);
        grass.fillRect(0, 0, TILE, TILE);
        grass.fillStyle(0x5a8c4f);
        grass.fillRect(2, 2, 3, 3);
        grass.fillRect(9, 6, 2, 2);
        grass.fillRect(5, 11, 3, 2);
        grass.generateTexture('tile_grass', TILE, TILE);
        grass.destroy();

        // 길 타일
        const path = this.make.graphics({ add: false });
        path.fillStyle(0xc4a66a);
        path.fillRect(0, 0, TILE, TILE);
        path.fillStyle(0xb8986a);
        path.fillRect(3, 5, 2, 2);
        path.fillRect(10, 10, 2, 2);
        path.generateTexture('tile_path', TILE, TILE);
        path.destroy();

        // 벽 타일 (돌담)
        const wall = this.make.graphics({ add: false });
        wall.fillStyle(0x666666);
        wall.fillRect(0, 0, TILE, TILE);
        wall.fillStyle(0x555555);
        wall.fillRect(0, 0, TILE, 1);
        wall.fillRect(0, 0, 1, TILE);
        wall.fillStyle(0x777777);
        wall.fillRect(3, 3, 5, 5);
        wall.fillRect(9, 8, 5, 5);
        wall.generateTexture('tile_wall', TILE, TILE);
        wall.destroy();

        // 물 타일
        const water = this.make.graphics({ add: false });
        water.fillStyle(0x2266aa);
        water.fillRect(0, 0, TILE, TILE);
        water.fillStyle(0x3388cc);
        water.fillRect(2, 4, 6, 2);
        water.fillRect(8, 9, 5, 2);
        water.generateTexture('tile_water', TILE, TILE);
        water.destroy();

        // 건물 벽
        const building = this.make.graphics({ add: false });
        building.fillStyle(0x8b6f47);
        building.fillRect(0, 0, TILE, TILE);
        building.fillStyle(0x7a5f3a);
        building.fillRect(0, 0, TILE, 2);
        building.generateTexture('tile_building', TILE, TILE);
        building.destroy();

        // 문 타일
        const door = this.make.graphics({ add: false });
        door.fillStyle(0x8b6f47);
        door.fillRect(0, 0, TILE, TILE);
        door.fillStyle(0x5a3a1a);
        door.fillRect(3, 4, 10, 12);
        door.fillStyle(0xccaa44);
        door.fillRect(10, 10, 2, 2);
        door.generateTexture('tile_door', TILE, TILE);
        door.destroy();

        // 플레이어 스프라이트 (16x16 캐릭터)
        const player = this.make.graphics({ add: false });
        // 몸통
        player.fillStyle(0x3355aa);
        player.fillRect(4, 6, 8, 8);
        // 머리
        player.fillStyle(0xffcc99);
        player.fillRect(5, 1, 6, 6);
        // 머리카락
        player.fillStyle(0x553311);
        player.fillRect(5, 1, 6, 2);
        // 눈
        player.fillStyle(0x000000);
        player.fillRect(6, 4, 1, 1);
        player.fillRect(9, 4, 1, 1);
        // 다리
        player.fillStyle(0x664422);
        player.fillRect(5, 14, 2, 2);
        player.fillRect(9, 14, 2, 2);
        player.generateTexture('player', TILE, TILE);
        player.destroy();

        // NPC 스프라이트 (마을장)
        const npc = this.make.graphics({ add: false });
        npc.fillStyle(0xaa3333);
        npc.fillRect(4, 6, 8, 8);
        npc.fillStyle(0xffcc99);
        npc.fillRect(5, 1, 6, 6);
        npc.fillStyle(0xeeeeee);
        npc.fillRect(5, 1, 6, 2);
        npc.fillStyle(0x000000);
        npc.fillRect(6, 4, 1, 1);
        npc.fillRect(9, 4, 1, 1);
        npc.fillStyle(0x664422);
        npc.fillRect(5, 14, 2, 2);
        npc.fillRect(9, 14, 2, 2);
        npc.generateTexture('npc_elder', TILE, TILE);
        npc.destroy();

        // NPC 스프라이트 (상인)
        const merchant = this.make.graphics({ add: false });
        merchant.fillStyle(0x33aa55);
        merchant.fillRect(4, 6, 8, 8);
        merchant.fillStyle(0xffcc99);
        merchant.fillRect(5, 1, 6, 6);
        merchant.fillStyle(0x332211);
        merchant.fillRect(5, 1, 6, 2);
        merchant.fillStyle(0x000000);
        merchant.fillRect(6, 4, 1, 1);
        merchant.fillRect(9, 4, 1, 1);
        merchant.fillStyle(0x664422);
        merchant.fillRect(5, 14, 2, 2);
        merchant.fillRect(9, 14, 2, 2);
        merchant.generateTexture('npc_merchant', TILE, TILE);
        merchant.destroy();

        // 던전 바닥
        const dungeonFloor = this.make.graphics({ add: false });
        dungeonFloor.fillStyle(0x3a3a4a);
        dungeonFloor.fillRect(0, 0, TILE, TILE);
        dungeonFloor.fillStyle(0x4a4a5a);
        dungeonFloor.fillRect(1, 1, 2, 2);
        dungeonFloor.fillRect(12, 8, 2, 2);
        dungeonFloor.generateTexture('tile_dungeon_floor', TILE, TILE);
        dungeonFloor.destroy();

        // 던전 벽
        const dungeonWall = this.make.graphics({ add: false });
        dungeonWall.fillStyle(0x2a2a3a);
        dungeonWall.fillRect(0, 0, TILE, TILE);
        dungeonWall.fillStyle(0x3a3a4a);
        dungeonWall.fillRect(2, 2, 4, 4);
        dungeonWall.fillRect(8, 8, 6, 6);
        dungeonWall.generateTexture('tile_dungeon_wall', TILE, TILE);
        dungeonWall.destroy();
    }
}
