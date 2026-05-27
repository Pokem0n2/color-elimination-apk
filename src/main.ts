import Phaser from 'phaser';
import GameScene from './scenes/GameScene';

const dpr = window.devicePixelRatio || 1;
const w = window.innerWidth;
const h = window.innerHeight;

const config: Phaser.Types.Core.GameConfig & { resolution?: number; autoRound?: boolean } = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: w,
  height: h,
  resolution: dpr,
  autoRound: true,
  backgroundColor: '#F7F2EC',
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [GameScene],
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true,
  },
};

const game = new Phaser.Game(config);

// 手动处理 resize，避免 RESIZE 模式覆盖 resolution
window.addEventListener('resize', () => {
  const nw = window.innerWidth;
  const nh = window.innerHeight;
  game.scale.resize(nw, nh);
});
