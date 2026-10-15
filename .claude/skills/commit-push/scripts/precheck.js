#!/usr/bin/env node
// Pre-commit checks for the EDI Soft static site. Run from anywhere inside the repo:
//   node .claude/skills/commit-push/scripts/precheck.js
// Exit code 1 if any FAIL; WARN lines are informational.
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
const rel = p => path.join(root, p);
let fails = 0;
const ok = m => console.log(`OK    ${m}`);
const warn = m => console.log(`WARN  ${m}`);
const fail = m => { fails++; console.log(`FAIL  ${m}`); };

// 1. JS syntax
for (const f of fs.readdirSync(rel('src/js')).filter(f => f.endsWith('.js'))) {
  try { execFileSync(process.execPath, ['--check', rel(`src/js/${f}`)], { stdio: 'pipe' }); ok(`syntax src/js/${f}`); }
  catch (e) { fail(`syntax src/js/${f}: ${String(e.stderr).split('\n').slice(0, 4).join(' ')}`); }
}

// 2. i18n: VI/EN parity + every key used in HTML/JS exists
const html = fs.readFileSync(rel('index.html'), 'utf8');
let tr;
try {
  const m = { exports: {} };
  const stub = { getItem: () => null, setItem: () => {} };
  new Function('module', 'localStorage', 'document',
    fs.readFileSync(rel('src/js/i18n.js'), 'utf8') + '\nmodule.exports = translations;')(m, stub, {});
  tr = m.exports;
} catch (e) { fail(`i18n.js could not be evaluated: ${e.message}`); }
if (tr) {
  const vi = Object.keys(tr.vi), en = Object.keys(tr.en);
  const viOnly = vi.filter(k => !(k in tr.en)), enOnly = en.filter(k => !(k in tr.vi));
  viOnly.length || enOnly.length ? fail(`i18n key mismatch — vi-only: [${viOnly}] en-only: [${enOnly}]`) : ok(`i18n VI/EN parity (${vi.length} keys)`);

  const used = new Set([...html.matchAll(/data-i18n(?:-aria|-title|-placeholder)?="([^"]+)"/g)].map(x => x[1]));
  const js = fs.readFileSync(rel('src/js/main.js'), 'utf8');
  // Keys looked up as t()['key'] must exist; any other string literal equal to a key also counts as "used"
  for (const x of js.matchAll(/\[['"]([a-z][a-z0-9-]+)['"]\]/g)) if (x[1].includes('-')) used.add(x[1]);
  for (const x of js.matchAll(/['"]([a-z][a-z0-9-]+)['"]/g)) if (x[1] in tr.vi) used.add(x[1]);
  const missing = [...used].filter(k => !(k in tr.vi));
  missing.length ? fail(`keys used but not translated: [${missing}]`) : ok(`all ${used.size} used keys are translated`);
  const unused = vi.filter(k => !used.has(k) && !['lang-btn'].includes(k));
  if (unused.length) warn(`translation keys not used anywhere: [${unused}]`);

  // HTML default text should equal the VI translation (whitespace-insensitive)
  const norm = s => s.replace(/\s+/g, ' ').trim();
  const dec = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  const drift = [...html.matchAll(/data-i18n="([a-z0-9-]+)"[^>]*>([^<]*)</g)]
    .filter(([, k, v]) => norm(v) && tr.vi[k] !== undefined && norm(dec(v)) !== norm(tr.vi[k])).map(x => x[1]);
  drift.length ? warn(`HTML default text differs from VI translation: [${drift}]`) : ok('HTML default text matches VI');
}

// 3. JSON-LD
const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (ld) { try { JSON.parse(ld[1]); ok('JSON-LD parses'); } catch (e) { fail(`JSON-LD invalid: ${e.message}`); } }

// 4. Changed files: blocked paths and secret-looking content
const status = execSync('git status --porcelain', { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
const staged = execSync('git diff --cached --name-only', { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
const blocked = /^(\.claude\/|.*\.env(\..*)?$|.*\.(pem|key|p12)$|.*id_rsa)/;
const badStaged = staged.filter(f => blocked.test(f));
badStaged.length ? fail(`blocked files are staged: [${badStaged}] — unstage with git restore --staged`) : ok('no blocked files staged');
const changed = status.map(l => l.slice(3).replace(/^"|"$/g, '')).filter(f => !blocked.test(f) && !f.endsWith('/'));
const secretRe = /-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|\bsk-[A-Za-z0-9_-]{20,}|\bghp_[A-Za-z0-9]{30,}|\bxox[bp]-[A-Za-z0-9-]{20,}/;
const secretHits = changed.filter(f => { try { return secretRe.test(fs.readFileSync(rel(f), 'utf8')); } catch { return false; } });
secretHits.length ? fail(`possible secrets in: [${secretHits}]`) : ok(`no secret patterns in ${changed.length} changed file(s)`);
const untrackedOther = status.filter(l => l.startsWith('??')).map(l => l.slice(3)).filter(f => !f.startsWith('.claude'));
if (untrackedOther.length) warn(`untracked files (decide whether to add): [${untrackedOther}]`);

console.log(fails ? `\n${fails} check(s) failed` : '\nAll checks passed');
process.exit(fails ? 1 : 0);
