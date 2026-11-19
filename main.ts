// Sunset Cover Studio — entrypoint for make.fun's gta6-cover-art-01.
// Copies the app and its screenshots into the output directory, then writes
// the dossier the scorer compares against the library's own build.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR set to a scratch folder:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// It writes the same bytes on every run: the copy is a plain file copy and
// the dossier is a deterministic function of the files it reads.

import { buildDossier } from './vendor/makefun-app.ts';
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

// The dossier caps this bounty grades by: the text budget, the screenshot
// budget, and the app's file, size and path budgets, as RULES.txt states.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function copyTree(sourceDir, targetDir) {
  mkdirSync(targetDir, { recursive: true });
  for (const entry of readdirSync(sourceDir).sort()) {
    const from = join(sourceDir, entry);
    const to = join(targetDir, entry);
    if (statSync(from).isDirectory()) {
      copyTree(from, to);
    } else {
      cpSync(from, to);
    }
  }
}

function main() {
  mkdirSync(outDir, { recursive: true });
  const appDir = join(repoRoot, 'app');
  const shotsDir = join(repoRoot, 'screenshots');
  if (!existsSync(appDir)) throw new Error('app/ is missing from the repository');
  copyTree(appDir, join(outDir, 'app'));
  if (existsSync(shotsDir)) copyTree(shotsDir, join(outDir, 'screenshots'));
  const dossier = buildDossier(outDir, DOSSIER_CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

main();
