// Lamplight world: game state, guard patrols, lantern-cone vision, shadow hiding
// and the detection meter. Pure simulation — rendering lives in render.js.

import { DETECTION, FIELD, GUARD, LEVELS, PLAYER } from './config.js';

export const EVENT_CAUGHT = 1;
export const EVENT_JEWEL = 2;
export const EVENT_EXIT = 4;

function circleHitsRect(x, y, r, rect) {
  const nx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - nx;
  const dy = y - ny;
  return dx * dx + dy * dy < r * r;
}

function pointInRect(x, y, rect, pad) {
  return x >= rect.x - pad && x <= rect.x + rect.w + pad && y >= rect.y - pad && y <= rect.y + rect.h + pad;
}

/** True when a display case or wall stands between guard and point. */
export function sightBlocked(level, x0, y0, x1, y1) {
  const solids = level.cases.concat(level.walls);
  const dist = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.max(1, Math.floor(dist / 7));
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    for (const s of solids) if (pointInRect(x, y, s, 0)) return true;
  }
  return false;
}

/** Shadow pools and the lee of a case (its far side from the guard) hide the thief. */
export function isHidden(level, guard, px, py) {
  for (const s of level.shadows) if (pointInRect(px, py, s, 2)) return true;
  for (const c of level.cases) {
    // A band just beyond the case, on the side away from the guard, is in its lee.
    const cx = c.x + c.w / 2;
    const cy = c.y + c.h / 2;
    const away = Math.atan2(py - guard.y, px - guard.x);
    const toCase = Math.atan2(cy - guard.y, cx - guard.x);
    let diff = Math.abs(away - toCase);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    const d = Math.hypot(px - cx, py - cy);
    if (diff < 0.5 && d < Math.max(c.w, c.h) * 0.72 && sightBlocked(level, guard.x, guard.y, px, py)) return true;
  }
  return false;
}

/** 0 when the guard cannot see the point, else a 0..1 strength (nearer and more central = stronger). */
export function visionStrength(level, guard, px, py) {
  const dx = px - guard.x;
  const dy = py - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist > GUARD.coneRange || dist < 4) return dist < 4 ? 1 : 0;
  let diff = Math.abs(Math.atan2(dy, dx) - guard.angle);
  if (diff > Math.PI) diff = 2 * Math.PI - diff;
  if (diff > GUARD.coneHalfAngle) return 0;
  if (sightBlocked(level, guard.x, guard.y, px, py)) return 0;
  if (isHidden(level, guard, px, py)) return 0;
  const centre = 1 - diff / GUARD.coneHalfAngle;
  const near = 1 - dist / GUARD.coneRange;
  return 0.35 + 0.65 * (0.5 * centre + 0.5 * near);
}

export function createWorld() {
  const state = {
    levelIndex: 0,
    level: LEVELS[0],
    player: { x: 0, y: 0 },
    guards: [],
    detection: 0,
    seenBy: -1,
    jewelTaken: false,
    jewels: 0,
    time: 0,
    levelTime: 0,
    banner: '',
    bannerTime: 0,
  };

  function loadLevel(index) {
    state.levelIndex = index;
    state.level = LEVELS[index];
    state.player.x = state.level.start.x;
    state.player.y = state.level.start.y;
    state.guards = state.level.guards.map((g) => ({
      x: g.path[0].x, y: g.path[0].y, angle: 0, target: 1, wait: 0,
      pause: g.pause, path: g.path, alert: 0,
    }));
    for (const g of state.guards) {
      const n = g.path[1];
      g.angle = Math.atan2(n.y - g.y, n.x - g.x);
    }
    state.detection = 0;
    state.seenBy = -1;
    state.jewelTaken = false;
    state.levelTime = 0;
  }

  function moveActor(actor, dx, dy, radius) {
    const solids = state.level.cases.concat(state.level.walls);
    let nx = actor.x + dx;
    nx = Math.max(radius + 6, Math.min(FIELD.width - radius - 6, nx));
    if (!solids.some((s) => circleHitsRect(nx, actor.y, radius, s))) actor.x = nx;
    let ny = actor.y + dy;
    ny = Math.max(FIELD.hudHeight + radius + 4, Math.min(FIELD.height - radius - 6, ny));
    if (!solids.some((s) => circleHitsRect(actor.x, ny, radius, s))) actor.y = ny;
  }

  function stepGuards(dt) {
    for (const g of state.guards) {
      if (g.wait > 0) { g.wait -= dt; continue; }
      const target = g.path[g.target];
      const dx = target.x - g.x;
      const dy = target.y - g.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 3) {
        g.target = (g.target + 1) % g.path.length;
        g.wait = g.pause;
        const n = g.path[g.target];
        g.angle = Math.atan2(n.y - g.y, n.x - g.x);
        continue;
      }
      const want = Math.atan2(dy, dx);
      let turn = want - g.angle;
      while (turn > Math.PI) turn -= 2 * Math.PI;
      while (turn < -Math.PI) turn += 2 * Math.PI;
      g.angle += Math.max(-3.2 * dt, Math.min(3.2 * dt, turn));
      g.x += Math.cos(g.angle) * GUARD.speed * dt;
      g.y += Math.sin(g.angle) * GUARD.speed * dt;
    }
  }

  /** Advance the simulation. move is a unit-ish {x, y} from input. Returns event flags. */
  function step(dt, move) {
    let events = 0;
    state.time += dt;
    state.levelTime += dt;
    if (state.bannerTime > 0) state.bannerTime -= dt;
    moveActor(state.player, move.x * PLAYER.speed * dt, move.y * PLAYER.speed * dt, PLAYER.radius);
    stepGuards(dt);

    let strongest = 0;
    state.seenBy = -1;
    state.guards.forEach((g, i) => {
      const v = visionStrength(state.level, g, state.player.x, state.player.y);
      g.alert = v;
      if (v > strongest) { strongest = v; state.seenBy = i; }
    });
    if (strongest > 0) state.detection = Math.min(1, state.detection + DETECTION.fillPerSecond * strongest * dt);
    else state.detection = Math.max(0, state.detection - DETECTION.decayPerSecond * dt);
    if (state.detection >= 1) events |= EVENT_CAUGHT;

    const j = state.level.jewel;
    if (!state.jewelTaken && Math.hypot(state.player.x - j.x, state.player.y - j.y) < 26) {
      state.jewelTaken = true;
      state.jewels += 1;
      state.banner = 'JEWEL TAKEN — now reach the exit door!';
      state.bannerTime = 2.6;
      events |= EVENT_JEWEL;
    }
    const e = state.level.exit;
    if (state.jewelTaken && pointInRect(state.player.x, state.player.y, e, 4)) events |= EVENT_EXIT;
    return events;
  }

  loadLevel(0);
  return { state, step, loadLevel };
}
