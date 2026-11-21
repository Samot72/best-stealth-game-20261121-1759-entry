// Lamplight entry point: wires input, world and renderer together, runs the
// title -> play -> caught/win flow across the three galleries, and serves the
// ?shot= staging scenes the screenshots were taken with.

import { LEVELS } from './config.js';
import { createInput } from './input.js';
import { createRenderer, SCREEN_CAUGHT, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { stageShot } from './shots.js';
import { createWorld, EVENT_CAUGHT, EVENT_EXIT } from './world.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld();
const renderer = createRenderer(canvas);
const input = createInput(canvas);

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
let screen = shot ? stageShot(shot, world) : SCREEN_TITLE;
let button = null;

function setScreen(next) {
  screen = next;
  status.textContent = `Lamplight — ${next}`;
}

canvas.addEventListener('pointerdown', (event) => {
  if (!button) return;
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  if (x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h) activateButton();
});

function activateButton() {
  if (screen === SCREEN_TITLE) setScreen(SCREEN_PLAY);
  else if (screen === SCREEN_CAUGHT) { world.loadLevel(world.state.levelIndex); setScreen(SCREEN_PLAY); }
  else if (screen === SCREEN_WIN) { world.state.jewels = 0; world.state.time = 0; world.loadLevel(0); setScreen(SCREEN_TITLE); }
}

window.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && screen !== SCREEN_PLAY) activateButton();
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (screen === SCREEN_PLAY && !shot) {
    const events = world.step(dt, input.readMove(world.state.player));
    if (events & EVENT_CAUGHT) setScreen(SCREEN_CAUGHT);
    else if (events & EVENT_EXIT) {
      if (world.state.levelIndex + 1 < LEVELS.length) {
        world.loadLevel(world.state.levelIndex + 1);
        world.state.banner = `Level ${world.state.levelIndex + 1} — ${world.state.level.name}`;
        world.state.bannerTime = 2.4;
      } else setScreen(SCREEN_WIN);
    }
  } else if (screen === SCREEN_PLAY && shot) {
    // Staged scene: keep guards idly stepping is unnecessary — the frame is frozen as staged.
  }
  button = renderer.draw(world.state, screen);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
