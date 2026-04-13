/**
 * main.js — Phaser 게임 설정 & 진입점
 *
 * Phaser는 CDN(script 태그)으로 로드되어 window.Phaser에 존재.
 * 씬 파일들은 ES Module로 import.
 */

import { BootScene }    from './scenes/BootScene.js';
import { TitleScene }   from './scenes/TitleScene.js';
import { TownScene }    from './scenes/TownScene.js';
import { DungeonScene } from './scenes/DungeonScene.js';
import { BattleScene }  from './scenes/BattleScene.js';
import { EndingScene }  from './scenes/EndingScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',

    // 바람의나라 느낌의 저해상도 → 스케일업
    width: 480,
    height: 320,
    pixelArt: true,                 // 안티앨리어싱 끄기
    roundPixels: true,

    scale: {
        mode: Phaser.Scale.FIT,     // 화면에 맞게 확대
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },      // 탑다운 RPG → 중력 없음
            debug: false,
        },
    },

    scene: [
        BootScene,
        TitleScene,
        TownScene,
        DungeonScene,
        BattleScene,
        EndingScene,
    ],
};

const game = new Phaser.Game(config);
window.__game = game;
