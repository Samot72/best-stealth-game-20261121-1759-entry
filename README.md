# Lamplight — a museum stealth game

[![Competition](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/c/best-stealth-game-20261121-1759)
[![Rank](https://make.fun/badge/best-stealth-game-20261121-1759/Samot72/best-stealth-game-20261121-1759-entry/rank.svg)](https://make.fun/c/best-stealth-game-20261121-1759)
[![Reward](https://make.fun/badge/best-stealth-game-20261121-1759/Samot72/best-stealth-game-20261121-1759-entry/reward.svg)](https://make.fun/c/best-stealth-game-20261121-1759)

> The Lamplight Museum keeps its brightest jewel in the darkest room. Come and take it home.

A top-down stealth game on an HTML canvas. You are a thief in a lamplit museum
gallery at night. Guards patrol fixed routes carrying lanterns — steal each
gallery's jewel and slip out of the exit door unseen.

## How to play

- **Move:** WASD or arrow keys, or click / tap where you want to walk.
- **Start / retry:** click the on-screen button, or press Enter / Space.
- **Goal, every level:** steal the glowing blue jewel from its case, then reach
  the EXIT door (it turns green once you hold the jewel).
- If the guards' lantern light holds you too long, the SPOTTED meter fills —
  and a full meter means you are caught and retry the level.

## The stealth design

- **Lantern cones.** Every guard carries a visible light cone that sweeps with
  his patrol. Standing in a cone fills the detection meter; nearer the guard
  and nearer the cone's centre, it fills faster. Step out and it drains, so a
  near miss is recoverable — the cone turns amber, then red, and the guard
  shouts "!" as you are about to be caught.
- **Shadow hides you.** Dark shadow pools on the floor, and the lee of a
  display case (its far side from a guard), hide you even inside a cone's edge.
  Cases and walls also block a guard's line of sight completely.
- **Learnable patrols.** Guards walk fixed waypoint loops and pause at the
  ends, so every route rewards patience and timing.

## The three levels

1. **Gallery One — The Sapphire Hall:** two guards, wide shadow pools — learn the cones.
2. **Gallery Two — The Ruby Wing:** three guards, crossing patrols, the jewel in the open centre-south.
3. **Gallery Three — The Darkest Room:** four guards, a ring patrol around the jewel's cage of cases, the tightest timing.

The HUD shows the level, jewels stolen, total time and the SPOTTED meter.
Finishing level 3 shows your total time on the win screen.

## Files

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json` with the kit's `buildDossier`.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `game/index.html` — the page; loads `game/src/main.js` as a module.
- `game/src/config.js` — field, actor tuning and the three level layouts.
- `game/src/world.js` — simulation: patrols, cone vision, shadow hiding, detection.
- `game/src/render.js` — canvas drawing: gallery, cones, actors, HUD and screens.
- `game/src/input.js` — keyboard and click-to-walk input.
- `game/src/shots.js` — the `?shot=` staging scenes used for the screenshots.
- `screenshots/` — four real renders of the game (title, gameplay, jewel taken, win).
- `shots.json` — the screenshot names and the queries that stage them.

## Run it

Serve `game/` with any static file server and open `index.html` in a desktop
browser — no build step, no network requests. To reproduce the hand-in output:

```
MAKEFUN_OUTPUT_DIR=/tmp/stealth-out node main.ts
```
