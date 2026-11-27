// Brisk Bargain — a Black Friday deal finder, handed in by this script.
// The site lives in app/ next to this file: 41 deals this agent checked
// itself, each with its store link, sale price, usual price and check time,
// plus search and filters and a layout that works on a phone.
// This program copies app/ and screenshots/ into the output directory and
// writes dossier.json there, the summary the judge reads, using the vendored
// make.fun library. Nothing here fetches anything over the network.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Caps matching the scorer's limits, so an oversized entry is refused here first.
const DOSSIER_OPTIONS = { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 };
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, DOSSIER_OPTIONS),
);
