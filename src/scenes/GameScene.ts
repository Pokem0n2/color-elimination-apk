import Phaser from 'phaser';
import { GRID_SIZE, CELL_COLORS, THEME } from '../config/gameConfig';

export default class GameScene extends Phaser.Scene {
  private grid: number[][] = [];
  private cellObjects: {
    bg: Phaser.GameObjects.Rectangle;
    shadow: Phaser.GameObjects.Graphics;
    level: number;
  }[][] = [];
  private stepCount = 0;
  private stepText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private popupContainer!: Phaser.GameObjects.Container;
  private popupScoreText!: Phaser.GameObjects.Text;
  private isGameOver = false;

  private cellSize = 0;
  private offsetX = 0;
  private offsetY = 0;
  private readonly gridGap = 6;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor(THEME.bg);
    this.scale.on('resize', this.resize, this);
    this.initGrid();
    this.calculateLayout();
    this.createUI();
    this.renderGrid();
    this.createPopup();
  }

  private initGrid() {
    this.grid = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const row: number[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        row.push(Phaser.Math.Between(1, 9));
      }
      this.grid.push(row);
    }
    this.stepCount = 0;
    this.isGameOver = false;
  }

  private calculateLayout() {
    const width = this.scale.width;
    const height = this.scale.height;
    const headerHeight = 110;
    const available = Math.min(width, height - headerHeight) - 40;
    this.cellSize = Math.floor(
      (available - (GRID_SIZE - 1) * this.gridGap) / GRID_SIZE
    );
    const totalW = GRID_SIZE * this.cellSize + (GRID_SIZE - 1) * this.gridGap;
    const totalH = totalW;
    this.offsetX = (width - totalW) / 2;
    this.offsetY = headerHeight + (height - headerHeight - totalH) / 2;
    if (this.offsetY < headerHeight + 12) {
      this.offsetY = headerHeight + 12;
    }
  }

  private createUI() {
    const cx = this.scale.width / 2;

    // 优雅标题
    this.add
      .text(cx, 32, 'Color Elimination', {
        fontSize: '22px',
        color: THEME.textMain,
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontStyle: '300',
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    // 分隔线
    const line = this.add.graphics();
    line.lineStyle(1, 0xD8D2CC, 1);
    line.lineBetween(cx - 60, 56, cx + 60, 56);

    this.stepText = this.add.text(20, 72, 'Steps  0', {
      fontSize: '15px',
      color: THEME.textSub,
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontStyle: '300',
    });

    const best = parseInt(localStorage.getItem('bestScore') || '9999');
    this.bestText = this.add
      .text(this.scale.width - 20, 72, `Best  ${best === 9999 ? '—' : best}`, {
        fontSize: '15px',
        color: THEME.textSub,
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontStyle: '300',
      })
      .setOrigin(1, 0);

    // 重置按钮：柔和圆角胶囊
    const btnW = 80;
    const btnH = 34;
    const btnBg = this.add
      .rectangle(cx, 74, btnW, btnH, THEME.accent)
      .setInteractive({ useHandCursor: true });
    btnBg.setOrigin(0.5);
    // 手动圆角：由于 Phaser Rectangle 不支持圆角，用两个圆 + 矩形拼
    // 但为了简单，我们利用 radius 参数（Phaser 3.60+ 支持）
    // 这里先保持矩形，通过阴影营造柔和感
    const btnShadow = this.add.graphics();
    btnShadow.fillStyle(THEME.accentDark, 0.3);
    btnShadow.fillRoundedRect(cx - btnW / 2 + 2, 74 - btnH / 2 + 2, btnW, btnH, 17);
    btnShadow.setDepth(-1);

    const btnLabel = this.add
      .text(cx, 74, 'Reset', {
        fontSize: '14px',
        color: '#FFFFFF',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontStyle: '300',
      })
      .setOrigin(0.5);

    btnBg.on('pointerdown', () => {
      this.tweens.add({
        targets: [btnBg, btnLabel],
        scaleX: 0.94,
        scaleY: 0.94,
        yoyo: true,
        duration: 100,
      });
      this.scene.restart();
    });
  }

  private renderGrid() {
    this.cellObjects.forEach((row) =>
      row.forEach((cell) => {
        cell.bg.destroy();
        cell.shadow.destroy();
      })
    );
    this.cellObjects = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      const rowObjects: { bg: Phaser.GameObjects.Rectangle; shadow: Phaser.GameObjects.Graphics; level: number }[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const x =
          this.offsetX + c * (this.cellSize + this.gridGap) + this.cellSize / 2;
        const y =
          this.offsetY + r * (this.cellSize + this.gridGap) + this.cellSize / 2;

        const level = this.grid[r][c];
        const info = CELL_COLORS[level];

        // 阴影层：纪念碑谷建筑感的柔和投影
        const shadow = this.add.graphics();
        if (level > 0) {
          shadow.fillStyle(info.shadowColor, 0.6);
          shadow.fillRoundedRect(
            x - this.cellSize / 2 + 3,
            y - this.cellSize / 2 + 4,
            this.cellSize,
            this.cellSize,
            Math.max(4, this.cellSize * 0.12)
          );
        } else {
          // 空格子：极淡的虚线轮廓，像未建造的平台
          shadow.lineStyle(1.5, 0xD8D2CC, 0.5);
          shadow.strokeRoundedRect(
            x - this.cellSize / 2 + 3,
            y - this.cellSize / 2 + 4,
            this.cellSize,
            this.cellSize,
            Math.max(4, this.cellSize * 0.12)
          );
        }
        shadow.setDepth(-1);

        // 主体层
        const rect = this.add.rectangle(
          x,
          y,
          this.cellSize,
          this.cellSize,
          info.color
        );
        // 给方块加圆角：利用 setInteractive + hitArea 或直接视觉处理
        // Phaser Rectangle 本身不能圆角，我们用 graphics 画圆角矩形替换
        // 但为了保持 interactive 方便，我们还是用 Rectangle 做 hitArea，上面盖一层圆角 graphics
        // 这里简单处理：小方块视觉上是矩形，通过 gap 和阴影营造建筑感

        if (level === 0) {
          rect.setAlpha(0.25);
        }

        rect.setInteractive({ useHandCursor: true });

        rect.on('pointerdown', () => {
          if (this.isGameOver) return;
          if (this.grid[r][c] === 0) return;
          this.onCellClick(r, c, rect, shadow);
        });

        rowObjects.push({ bg: rect, shadow, level });
      }
      this.cellObjects.push(rowObjects);
    }
  }

  private onCellClick(
    row: number,
    col: number,
    clickedRect: Phaser.GameObjects.Rectangle,
    clickedShadow: Phaser.GameObjects.Graphics
  ) {
    // 柔和按压反馈
    this.tweens.add({
      targets: clickedRect,
      scaleX: 0.9,
      scaleY: 0.9,
      yoyo: true,
      duration: 120,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: clickedShadow,
      alpha: 0.3,
      yoyo: true,
      duration: 120,
      ease: 'Sine.easeInOut',
    });

    let changed = false;

    for (let c = 0; c < GRID_SIZE; c++) {
      if (this.grid[row][c] > 0) {
        this.grid[row][c]--;
        changed = true;
      }
    }

    for (let r = 0; r < GRID_SIZE; r++) {
      if (r === row) continue;
      if (this.grid[r][col] > 0) {
        this.grid[r][col]--;
        changed = true;
      }
    }

    if (!changed) return;

    this.stepCount++;
    this.stepText.setText(`Steps  ${this.stepCount}`);

    this.updateGridVisuals();

    if (this.checkWin()) {
      this.onWin();
    }
  }

  private updateGridVisuals() {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const level = this.grid[r][c];
        const cell = this.cellObjects[r][c];
        const info = CELL_COLORS[level];

        // 更新主体颜色
        cell.bg.setFillStyle(info.color);
        cell.bg.setAlpha(level === 0 ? 0.25 : 1);

        // 重绘阴影
        cell.shadow.clear();
        const x = cell.bg.x;
        const y = cell.bg.y;
        if (level > 0) {
          cell.shadow.fillStyle(info.shadowColor, 0.6);
          cell.shadow.fillRoundedRect(
            x - this.cellSize / 2 + 3,
            y - this.cellSize / 2 + 4,
            this.cellSize,
            this.cellSize,
            Math.max(4, this.cellSize * 0.12)
          );
        } else {
          cell.shadow.lineStyle(1.5, 0xD8D2CC, 0.5);
          cell.shadow.strokeRoundedRect(
            x - this.cellSize / 2 + 3,
            y - this.cellSize / 2 + 4,
            this.cellSize,
            this.cellSize,
            Math.max(4, this.cellSize * 0.12)
          );
        }

        // 重新绑定点击
        cell.bg.removeAllListeners('pointerdown');
        cell.bg.on('pointerdown', () => {
          if (this.isGameOver) return;
          if (this.grid[r][c] === 0) return;
          this.onCellClick(r, c, cell.bg, cell.shadow);
        });
      }
    }
  }

  private checkWin(): boolean {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r][c] > 0) return false;
      }
    }
    return true;
  }

  private onWin() {
    this.isGameOver = true;

    const best = parseInt(localStorage.getItem('bestScore') || '9999');
    let isNewRecord = false;
    if (this.stepCount < best) {
      localStorage.setItem('bestScore', this.stepCount.toString());
      this.bestText.setText(`Best  ${this.stepCount}`);
      isNewRecord = true;
    }

    this.popupScoreText.setText(
      `${this.stepCount} steps${isNewRecord ? '  (New Record!)' : ''}`
    );

    this.popupContainer.setVisible(true);
    this.popupContainer.setAlpha(0);
    this.tweens.add({
      targets: this.popupContainer,
      alpha: 1,
      duration: 350,
      ease: 'Sine.easeOut',
    });
  }

  private createPopup() {
    const w = this.scale.width;
    const h = this.scale.height;

    // 半透明遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(THEME.overlay, 0.45);
    overlay.fillRect(0, 0, w, h);

    const cardW = 300;
    const cardH = 200;
    const cx = w / 2;
    const cy = h / 2;

    // 卡片阴影
    const cardShadow = this.add.graphics();
    cardShadow.fillStyle(0x000000, 0.15);
    cardShadow.fillRoundedRect(
      cx - cardW / 2 + 4,
      cy - cardH / 2 + 6,
      cardW,
      cardH,
      20
    );

    // 卡片主体
    const card = this.add.graphics();
    card.fillStyle(THEME.popupBg, 1);
    card.fillRoundedRect(
      cx - cardW / 2,
      cy - cardH / 2,
      cardW,
      cardH,
      20
    );

    // 装饰线条
    const decoLine = this.add.graphics();
    decoLine.lineStyle(2, THEME.accent, 1);
    decoLine.lineBetween(cx - 40, cy - cardH / 2 + 46, cx + 40, cy - cardH / 2 + 46);

    const title = this.add
      .text(cx, cy - cardH / 2 + 28, 'Complete', {
        fontSize: '22px',
        color: THEME.textMain,
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontStyle: '300',
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    this.popupScoreText = this.add
      .text(cx, cy - 6, '', {
        fontSize: '18px',
        color: THEME.textSub,
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontStyle: '300',
      })
      .setOrigin(0.5);

    // 再玩一次按钮
    const btnW = 140;
    const btnH = 42;
    const btnY = cy + 48;

    const btnShadow = this.add.graphics();
    btnShadow.fillStyle(THEME.accentDark, 0.3);
    btnShadow.fillRoundedRect(
      cx - btnW / 2 + 2,
      btnY - btnH / 2 + 3,
      btnW,
      btnH,
      21
    );

    const restartBtn = this.add
      .rectangle(cx, btnY, btnW, btnH, THEME.accent)
      .setInteractive({ useHandCursor: true });
    restartBtn.setOrigin(0.5);

    const restartLabel = this.add
      .text(cx, btnY, 'Play Again', {
        fontSize: '15px',
        color: '#FFFFFF',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontStyle: '300',
      })
      .setOrigin(0.5);

    restartBtn.on('pointerdown', () => {
      this.tweens.add({
        targets: [restartBtn, restartLabel],
        scaleX: 0.94,
        scaleY: 0.94,
        yoyo: true,
        duration: 100,
        onComplete: () => {
          this.scene.restart();
        },
      });
    });

    this.popupContainer = this.add.container(0, 0, [
      overlay,
      cardShadow,
      card,
      decoLine,
      title,
      this.popupScoreText,
      btnShadow,
      restartBtn,
      restartLabel,
    ]);
    this.popupContainer.setVisible(false);
    this.popupContainer.setDepth(100);
  }

  private resize(gameSize: Phaser.Structs.Size) {
    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
    this.scene.restart();
  }
}
