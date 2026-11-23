// Ember Duel — program penyerahan (Node 22, stdlib saja).
// Menyalin game/ dan screenshots/ dari repo ini ke /output, lalu menulis
// /output/dossier.json dengan buildDossier dari vendor/makefun-game.ts.
// Di luar grader, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   MAKEFUN_OUTPUT_DIR=/tmp/bcg-out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const gameDir = join(repoDir, 'game');
const shotsDir = join(repoDir, 'screenshots');

if (!existsSync(join(gameDir, 'index.html'))) {
  throw new Error('game/index.html tidak ditemukan: game belum lengkap');
}
if (!existsSync(shotsDir)) {
  throw new Error('screenshots/ tidak ditemukan: 3-4 screenshot wajib ada');
}
const shotFiles = readdirSync(shotsDir).filter((f) => !f.startsWith('.'));
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`screenshots/ berisi ${shotFiles.length} file, harus 3-4`);
}

mkdirSync(outDir, { recursive: true });
cpSync(gameDir, join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`Ember Duel diserahkan: ${shotFiles.length} screenshot, dossier ${dossier.length} byte.`);
