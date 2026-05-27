export const GRID_SIZE = 10;

export interface CellColor {
  level: number;
  name: string;
  color: number;
  shadowColor: number;
}

// 纪念碑谷风格：柔和马卡龙色系，从浅到深营造层次感
export const CELL_COLORS: CellColor[] = [
  { level: 0, name: '空',   color: 0xEDE8E4, shadowColor: 0xDDD8D4 }, // 极淡米灰，保留建筑轮廓
  { level: 1, name: '雾',   color: 0xC5B9CD, shadowColor: 0xB0A4B8 }, // 薰衣草灰
  { level: 2, name: '砂',   color: 0xE6D5C3, shadowColor: 0xD1C0AE }, // 暖沙色
  { level: 3, name: '霞',   color: 0xE8A598, shadowColor: 0xD39080 }, // 珊瑚粉
  { level: 4, name: '暮',   color: 0xF4C2C2, shadowColor: 0xDFADAD }, // 浅玫瑰
  { level: 5, name: '夕',   color: 0xF5E6CA, shadowColor: 0xE0D1B5 }, // 暖黄奶油
  { level: 6, name: '苔',   color: 0xB5D5C5, shadowColor: 0xA0C0B0 }, // 薄荷绿
  { level: 7, name: '海',   color: 0xA8C8EC, shadowColor: 0x93B3D7 }, // 淡天蓝
  { level: 8, name: '渊',   color: 0x8FA3B5, shadowColor: 0x7A8EA0 }, // 蓝灰（纪念碑谷建筑阴影色）
  { level: 9, name: '夜',   color: 0x5A5A6E, shadowColor: 0x454558 }, // 深紫灰（最深）
];

// 界面主题色
export const THEME = {
  bg: 0xF7F2EC,         // 温暖纸色背景
  textMain: '#5A5A6E',
  textSub: '#8A8A9E',
  accent: 0xE8A598,     // 珊瑚粉强调色
  accentDark: 0xD39080,
  popupBg: 0xFFFFFF,
  overlay: 0x2A2A3A,
};
