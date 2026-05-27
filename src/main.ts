import Phaser from 'phaser';
import GameScene from './scenes/GameScene';

const dpr = window.devicePixelRatio || 1;

const config: Phaser.Types.Core.GameConfig & { resolution?: number; autoRound?: boolean } = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: dpr,
  autoRound: true,
  backgroundColor: '#F7F2EC',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [GameScene],
};

new Phaser.Game(config);
