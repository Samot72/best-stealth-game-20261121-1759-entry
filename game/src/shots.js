// Lamplight screenshot staging behind ?shot=title|play|jewel|win.
// Each scene builds a real game state with the same world code normal play uses
// (a fresh world, guards stepped forward, the thief placed by hand), then hands
// main.js the screen to draw. Staging never changes how the game plays without
// the ?shot= parameter.

import { LEVELS } from './config.js';
import { SCREEN_CAUGHT, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

const STEP = 1 / 60;

function stepSeconds(world, seconds, move) {
  for (let i = 0; i < seconds / STEP; i += 1) world.step(STEP, move || { x: 0, y: 0 });
}

export function stageShot(name, world) {
  const state = world.state;
  if (name === 'play') {
    // Level 1 mid-patrol: the thief waits at the edge of a lantern cone, meter rising.
    world.loadLevel(0);
    stepSeconds(world, 2.4);
    state.player.x = 648;
    state.player.y = 218;
    stepSeconds(world, 0.45);
    state.detection = Math.max(state.detection, 0.42);
    return SCREEN_PLAY;
  }
  if (name === 'jewel') {
    // Level 2, jewel just lifted: banner up, thief beside the empty case, guards closing.
    world.loadLevel(1);
    stepSeconds(world, 3.1);
    state.player.x = LEVELS[1].jewel.x + 30;
    state.player.y = LEVELS[1].jewel.y - 6;
    state.jewelTaken = true;
    state.jewels = 2;
    state.banner = 'JEWEL TAKEN — now reach the exit door!';
    state.bannerTime = 2.6;
    state.detection = 0.58;
    return SCREEN_PLAY;
  }
  if (name === 'caught') {
    world.loadLevel(0);
    stepSeconds(world, 1.5);
    state.detection = 1;
    return SCREEN_CAUGHT;
  }
  if (name === 'win') {
    world.loadLevel(2);
    stepSeconds(world, 2.0);
    state.jewels = 3;
    state.jewelTaken = true;
    state.time = 187.4;
    return SCREEN_WIN;
  }
  return SCREEN_TITLE;
}
