// Lamplight hand-in program (Node 22, standard library only).
// Copies the static game in game/ and the maker's screenshots in screenshots/
// into the output directory, then writes dossier.json there with the kit's
// vendored buildDossier, exactly as the competition's gate expects.
// Locally: MAKEFUN_OUTPUT_DIR=/tmp/stealth-out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Gate caps from the kit: dossier text budget of 160 KiB, at most 4
// screenshots of 256 KiB each, and game/ within 993 entries / 48 MiB /
// 1000-byte paths. The grader runs this twice and expects identical bytes,
// so nothing here may depend on the clock, randomness or the environment
// beyond MAKEFUN_OUTPUT_DIR.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
