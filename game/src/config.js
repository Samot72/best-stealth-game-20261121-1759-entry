// Lamplight configuration: field size, actor tuning and the three museum levels.
// A level is plain data: display cases and walls (they block movement and sight),
// shadow pools (dark floor where a thief is hidden even inside a lantern cone),
// guard patrols as waypoint loops, the jewel case, the exit door and the start.

export const FIELD = { width: 960, height: 600, hudHeight: 44 };

export const PLAYER = { radius: 11, speed: 148 };
export const GUARD = { radius: 12, speed: 62, coneRange: 168, coneHalfAngle: 0.46 };

export const DETECTION = { fillPerSecond: 1.15, decayPerSecond: 0.55 };

export const LEVELS = [
  {
    name: 'Gallery One — The Sapphire Hall',
    start: { x: 60, y: 520 },
    jewel: { x: 872, y: 110 },
    exit: { x: 896, y: 500, w: 44, h: 72 },
    cases: [
      { x: 210, y: 130, w: 110, h: 54 }, { x: 420, y: 130, w: 110, h: 54 },
      { x: 210, y: 330, w: 110, h: 54 }, { x: 420, y: 330, w: 110, h: 54 },
      { x: 640, y: 240, w: 110, h: 54 },
    ],
    walls: [ { x: 620, y: 90, w: 18, h: 120 }, { x: 120, y: 440, w: 150, h: 16 } ],
    shadows: [
      { x: 196, y: 190, w: 138, h: 40 }, { x: 406, y: 190, w: 138, h: 40 },
      { x: 196, y: 390, w: 138, h: 40 }, { x: 626, y: 300, w: 138, h: 40 },
      { x: 60, y: 90, w: 110, h: 90 },
    ],
    guards: [
      { path: [ { x: 360, y: 240 }, { x: 700, y: 240 } ], pause: 1.2 },
      { path: [ { x: 800, y: 470 }, { x: 800, y: 180 } ], pause: 1.0 },
    ],
  },
  {
    name: 'Gallery Two — The Ruby Wing',
    start: { x: 56, y: 96 },
    jewel: { x: 480, y: 512 },
    exit: { x: 896, y: 84, w: 44, h: 72 },
    cases: [
      { x: 180, y: 150, w: 100, h: 50 }, { x: 430, y: 150, w: 100, h: 50 }, { x: 680, y: 150, w: 100, h: 50 },
      { x: 180, y: 360, w: 100, h: 50 }, { x: 680, y: 360, w: 100, h: 50 },
      { x: 430, y: 262, w: 100, h: 50 },
    ],
    walls: [ { x: 330, y: 420, w: 16, h: 130 }, { x: 614, y: 90, w: 16, h: 130 } ],
    shadows: [
      { x: 168, y: 206, w: 124, h: 38 }, { x: 668, y: 206, w: 124, h: 38 },
      { x: 168, y: 416, w: 124, h: 38 }, { x: 668, y: 416, w: 124, h: 38 },
      { x: 418, y: 318, w: 124, h: 38 }, { x: 760, y: 480, w: 140, h: 70 },
    ],
    guards: [
      { path: [ { x: 330, y: 240 }, { x: 630, y: 240 } ], pause: 1.0 },
      { path: [ { x: 120, y: 480 }, { x: 380, y: 480 } ], pause: 0.8 },
      { path: [ { x: 840, y: 300 }, { x: 560, y: 300 }, { x: 840, y: 470 } ], pause: 0.8 },
    ],
  },
  {
    name: 'Gallery Three — The Darkest Room',
    start: { x: 60, y: 520 },
    jewel: { x: 480, y: 300 },
    exit: { x: 896, y: 500, w: 44, h: 72 },
    cases: [
      { x: 200, y: 140, w: 100, h: 50 }, { x: 660, y: 140, w: 100, h: 50 },
      { x: 200, y: 420, w: 100, h: 50 }, { x: 660, y: 420, w: 100, h: 50 },
      { x: 380, y: 240, w: 200, h: 34 }, { x: 380, y: 352, w: 200, h: 34 },
    ],
    walls: [ { x: 110, y: 250, w: 16, h: 140 }, { x: 834, y: 250, w: 16, h: 140 }, { x: 472, y: 90, w: 16, h: 90 } ],
    shadows: [
      { x: 188, y: 196, w: 124, h: 38 }, { x: 648, y: 196, w: 124, h: 38 },
      { x: 188, y: 476, w: 124, h: 38 }, { x: 648, y: 476, w: 124, h: 38 },
      { x: 380, y: 392, w: 200, h: 26 }, { x: 60, y: 90, w: 120, h: 80 },
    ],
    guards: [
      { path: [ { x: 480, y: 140 }, { x: 760, y: 300 }, { x: 480, y: 470 }, { x: 200, y: 300 } ], pause: 0.6 },
      { path: [ { x: 300, y: 520 }, { x: 300, y: 120 } ], pause: 0.7 },
      { path: [ { x: 660, y: 120 }, { x: 660, y: 520 } ], pause: 0.7 },
      { path: [ { x: 150, y: 300 }, { x: 810, y: 300 } ], pause: 0.5 },
    ],
  },
];
