// Lamplight rendering: the lamplit gallery, lantern cones, shadow pools, display
// cases, guards, the thief, the jewel and the exit — plus every screen.

import { FIELD, GUARD } from './config.js';
import { isHidden } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CAUGHT = 'caught';
export const SCREEN_WIN = 'win';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawCone(ctx, guard, alerted) {
  const { coneRange, coneHalfAngle } = GUARD;
  const grad = ctx.createRadialGradient(guard.x, guard.y, 8, guard.x, guard.y, coneRange);
  if (alerted > 0.55) {
    grad.addColorStop(0, 'rgba(255,92,60,0.50)');
    grad.addColorStop(1, 'rgba(255,92,60,0.03)');
  } else if (alerted > 0.05) {
    grad.addColorStop(0, 'rgba(255,176,66,0.48)');
    grad.addColorStop(1, 'rgba(255,176,66,0.03)');
  } else {
    grad.addColorStop(0, 'rgba(255,214,120,0.34)');
    grad.addColorStop(1, 'rgba(255,214,120,0.02)');
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.arc(guard.x, guard.y, coneRange, guard.angle - coneHalfAngle, guard.angle + coneHalfAngle);
  ctx.closePath();
  ctx.fill();
}

function drawGallery(ctx, state) {
  const level = state.level;
  ctx.fillStyle = '#171a2b';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  // Chequered marble floor below the HUD.
  const tile = 48;
  for (let y = FIELD.hudHeight; y < FIELD.height; y += tile) {
    for (let x = 0; x < FIELD.width; x += tile) {
      if (((x + y) / tile) % 2 === 0) { ctx.fillStyle = '#1b1f33'; ctx.fillRect(x, y, tile, tile); }
    }
  }
  // Shadow pools: the safe dark patches.
  for (const s of level.shadows) {
    ctx.fillStyle = '#0d1020';
    roundRect(ctx, s.x, s.y, s.w, s.h, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,110,180,0.25)';
    ctx.stroke();
  }
  // Walls.
  ctx.fillStyle = '#3d3350';
  for (const w of level.walls) { ctx.fillRect(w.x, w.y, w.w, w.h); }
  // Exit door.
  const e = level.exit;
  ctx.fillStyle = state.jewelTaken ? '#1f7a4d' : '#5a4326';
  roundRect(ctx, e.x, e.y, e.w, e.h, 6);
  ctx.fill();
  ctx.fillStyle = '#e8e4d8';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', e.x + e.w / 2, e.y + e.h / 2 + 4);
  // Display cases.
  for (const c of level.cases) {
    ctx.fillStyle = '#4a3b28';
    roundRect(ctx, c.x, c.y, c.w, c.h, 6);
    ctx.fill();
    ctx.fillStyle = 'rgba(160,200,255,0.20)';
    roundRect(ctx, c.x + 6, c.y + 6, c.w - 12, c.h - 12, 4);
    ctx.fill();
    ctx.strokeStyle = '#c9a86a';
    ctx.strokeRect(c.x + 6, c.y + 6, c.w - 12, c.h - 12);
  }
  // The jewel in its case.
  if (!state.jewelTaken) {
    const j = level.jewel;
    ctx.save();
    ctx.translate(j.x, j.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#57c8ff';
    ctx.shadowColor = '#57c8ff';
    ctx.shadowBlur = 16;
    ctx.fillRect(-8, -8, 16, 16);
    ctx.restore();
  }
}

function drawActors(ctx, state) {
  for (const g of state.guards) drawCone(ctx, g, g.alert);
  // The thief.
  const p = state.player;
  const hidden = state.guards.some((g) => g.alert > 0) ? false : state.guards.some((g) => isHidden(state.level, g, p.x, p.y));
  ctx.fillStyle = hidden ? '#5f6f9e' : '#d8dcff';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#23264a';
  ctx.beginPath();
  ctx.arc(p.x, p.y - 3, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0e0f22';
  ctx.fillRect(p.x - 11, p.y - 2, 22, 4); // mask band
  if (state.jewelTaken) {
    ctx.fillStyle = '#57c8ff';
    ctx.fillRect(p.x + 7, p.y + 4, 6, 6);
  }
  // Guards with lanterns.
  for (const g of state.guards) {
    ctx.fillStyle = g.alert > 0.05 ? '#ff5c3c' : '#c8433c';
    ctx.beginPath();
    ctx.arc(g.x, g.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd678';
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.angle) * 13, g.y + Math.sin(g.angle) * 13, 5, 0, Math.PI * 2);
    ctx.fill();
    if (g.alert > 0.05) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', g.x, g.y - 18);
    }
  }
}

function drawHud(ctx, state) {
  ctx.fillStyle = '#0b0e18';
  ctx.fillRect(0, 0, FIELD.width, FIELD.hudHeight);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Level ${state.levelIndex + 1}/3 — ${state.level.name}`, 14, 28);
  ctx.textAlign = 'right';
  ctx.fillText(`Jewels ${state.jewels}/3   Time ${state.time.toFixed(1)}s`, FIELD.width - 386, 28);
  // Detection meter.
  ctx.fillStyle = '#2a2e47';
  ctx.fillRect(FIELD.width - 164, 14, 150, 14);
  ctx.fillStyle = state.detection > 0.6 ? '#ff5c3c' : '#ffb042';
  ctx.fillRect(FIELD.width - 164, 14, 150 * state.detection, 14);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('SPOTTED', FIELD.width - 170, 28);
  if (state.bannerTime > 0) {
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#7ee2a8';
    ctx.fillText(state.banner, FIELD.width / 2, 84);
  }
  const hint = state.jewelTaken ? 'Reach the EXIT door!' : 'Steal the blue jewel, stay out of the lantern light';
  ctx.font = '13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(232,228,216,0.75)';
  ctx.fillText(hint, FIELD.width / 2, FIELD.height - 10);
}

function drawButton(ctx, label, x, y, w, h) {
  ctx.fillStyle = '#c9a86a';
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.fillStyle = '#17130a';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h / 2 + 6);
  return { x, y, w, h };
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let button = null;

  function draw(state, screen) {
    button = null;
    ctx.clearRect(0, 0, FIELD.width, FIELD.height);
    if (screen === SCREEN_TITLE) {
      ctx.fillStyle = '#0b0e18';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      ctx.fillStyle = '#ffd678';
      ctx.beginPath();
      ctx.arc(FIELD.width / 2, 120, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0b0e18';
      ctx.beginPath();
      ctx.arc(FIELD.width / 2, 112, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f3ead2';
      ctx.font = 'bold 64px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('LAMPLIGHT', FIELD.width / 2, 226);
      ctx.font = 'italic 19px Georgia, serif';
      ctx.fillStyle = '#b9c0e0';
      ctx.font = 'italic 17px Georgia, serif';
      ctx.fillText('The Lamplight Museum keeps its brightest jewel in the darkest room. Come and take it home.', FIELD.width / 2, 282);
      button = drawButton(ctx, 'START THE HEIST', FIELD.width / 2 - 110, 340, 220, 48);
      ctx.font = '15px system-ui, sans-serif';
      ctx.fillStyle = '#8f97bd';
      ctx.fillText('Move: WASD / Arrow keys / click to walk', FIELD.width / 2, 440);
      ctx.fillText('Stay out of the lantern cones — hide in shadow pools and behind display cases', FIELD.width / 2, 468);
      ctx.fillText('Steal each jewel, then slip out of the EXIT door unseen', FIELD.width / 2, 496);
      return button;
    }
    drawGallery(ctx, state);
    drawActors(ctx, state);
    drawHud(ctx, state);
    if (screen === SCREEN_CAUGHT) {
      ctx.fillStyle = 'rgba(10,4,4,0.72)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      ctx.fillStyle = '#ff7a5c';
      ctx.font = 'bold 52px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('CAUGHT!', FIELD.width / 2, 250);
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillStyle = '#e8e4d8';
      ctx.fillText(`The lantern light held you a moment too long — level ${state.levelIndex + 1}.`, FIELD.width / 2, 292);
      button = drawButton(ctx, 'TRY AGAIN', FIELD.width / 2 - 90, 330, 180, 46);
    } else if (screen === SCREEN_WIN) {
      ctx.fillStyle = 'rgba(4,12,8,0.78)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      ctx.fillStyle = '#7ee2a8';
      ctx.font = 'bold 50px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('A CLEAN GETAWAY', FIELD.width / 2, 240);
      ctx.font = '19px system-ui, sans-serif';
      ctx.fillStyle = '#e8e4d8';
      ctx.fillText(`All 3 jewels stolen in ${state.time.toFixed(1)} seconds. The museum never saw you.`, FIELD.width / 2, 288);
      button = drawButton(ctx, 'PLAY AGAIN', FIELD.width / 2 - 90, 330, 180, 46);
    }
    return button;
  }

  return { draw };
}
