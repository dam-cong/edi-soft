#!/usr/bin/env node
// SEO checks for the EDI Soft static site.
//   node .claude/skills/seo/scripts/seo-check.js                 # local files (index.html, robots.txt, sitemap.xml)
//   node .claude/skills/seo/scripts/seo-check.js https://info.editech.vn/   # live page + headers
// Exit code 1 if any FAIL; WARN/INFO are informational.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const url = process.argv[2];
const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
let fails = 0;
const ok = m => console.log(`OK    ${m}`);
const info = m => console.log(`INFO  ${m}`);
const warn = m => console.log(`WARN  ${m}`);
const fail = m => { fails++; console.log(`FAIL  ${m}`); };
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i')) || [])[1];
const metaOf = (html, key) => {
  const t = [...html.matchAll(/<meta\s[^>]*>/gi)].map(m => m[0])
    .find(t => attr(t, 'name') === key || attr(t, 'property') === key);
  return t && attr(t, 'content');
};
const strip = s => s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();

(async () => {
  let html, robots, sitemap, headers;
  if (url) {
    const res = await fetch(url, { redirect: 'manual' });
    res.status === 200 ? ok(`HTTP ${res.status}`) : fail(`HTTP ${res.status} ${res.headers.get('location') || ''}`);
    headers = res.headers; html = await res.text();
    const origin = new URL(url).origin;
    robots = await fetch(`${origin}/robots.txt`).then(r => r.ok ? r.text() : '');
    sitemap = await fetch(`${origin}/sitemap.xml`).then(r => r.ok ? r.text() : '');
  } else {
    const read = f => fs.existsSync(path.join(root, f)) ? fs.readFileSync(path.join(root, f), 'utf8') : '';
    html = read('index.html'); robots = read('robots.txt'); sitemap = read('sitemap.xml');
  }

  // 1. Head basics
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1]?.trim();
  !title ? fail('missing <title>') : title.length > 65 ? warn(`title ${title.length} chars (>65, may be truncated)`) : ok(`title ${title.length} chars`);
  const desc = metaOf(html, 'description');
  !desc ? fail('missing meta description') : desc.length < 70 || desc.length > 160 ? warn(`description ${desc.length} chars (aim 70-160)`) : ok(`description ${desc.length} chars`);
  const lang = (html.match(/<html[^>]*\slang="([^"]+)"/i) || [])[1];
  lang ? ok(`html lang="${lang}"`) : fail('missing <html lang>');
  metaOf(html, 'viewport') ? ok('viewport') : fail('missing viewport');
  const robotsMeta = metaOf(html, 'robots') || '';
  /noindex/i.test(robotsMeta) ? fail(`meta robots = "${robotsMeta}"`) : ok('indexable (no noindex)');
  if (metaOf(html, 'keywords')) info('meta keywords present: Google ignores it (harmless)');

  // 2. Canonical / OG / Twitter
  const canonTag = (html.match(/<link[^>]*rel="canonical"[^>]*>/i) || [])[0];
  const canon = canonTag && attr(canonTag, 'href');
  !canon ? fail('missing canonical') : !/^https:\/\//.test(canon) ? fail(`canonical not absolute https: ${canon}`) : ok(`canonical ${canon}`);
  const ogUrl = metaOf(html, 'og:url');
  if (canon && ogUrl && ogUrl !== canon) warn(`og:url (${ogUrl}) != canonical`);
  for (const k of ['og:title', 'og:description', 'og:image', 'twitter:card']) metaOf(html, k) ? ok(k) : warn(`missing ${k}`);
  const ogImg = metaOf(html, 'og:image');
  if (ogImg && !url) {
    const local = path.join(root, new URL(ogImg).pathname);
    fs.existsSync(local) ? ok('og:image file exists') : fail(`og:image not found locally: ${local}`);
  }
  if (/hreflang=/i.test(html)) ok('hreflang present');
  else info('no hreflang: EN is client-side only (JS swap), so Google indexes VI only');

  // 3. Headings
  const hs = [...html.matchAll(/<h([1-6])\b/gi)].map(m => +m[1]);
  const h1 = hs.filter(h => h === 1).length;
  h1 === 1 ? ok('exactly one <h1>') : fail(`${h1} <h1> tags (need exactly 1)`);
  const skips = hs.filter((h, i) => i && h > hs[i - 1] + 1).length;
  skips ? warn(`${skips} heading level skip(s) (e.g. h2 -> h4)`) : ok(`heading hierarchy (${hs.length} headings)`);

  // 4. Images
  const imgs = [...html.matchAll(/<img\s[^>]*>/gi)].map(m => m[0]);
  const noAlt = imgs.filter(t => attr(t, 'alt') === undefined).length;
  const noSize = imgs.filter(t => !attr(t, 'width') || !attr(t, 'height')).length;
  noAlt ? fail(`${noAlt}/${imgs.length} <img> without alt`) : ok(`all ${imgs.length} <img> have alt`);
  if (noSize) warn(`${noSize}/${imgs.length} <img> without width/height (CLS risk)`);
  if (!url) for (const t of imgs) {
    const src = attr(t, 'src');
    if (src && !/^(https?:|data:)/.test(src)) {
      const f = path.join(root, src); if (!fs.existsSync(f)) { fail(`img not found: ${src}`); continue; }
      const kb = fs.statSync(f).size / 1024; if (kb > 200) warn(`${src} is ${kb.toFixed(0)} KB (>200 KB, consider WebP/AVIF)`);
    }
  }

  // 5. Links: in-page anchors resolve
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  const broken = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map(m => m[1]))].filter(a => !ids.has(a));
  broken.length ? fail(`anchors without target: [${broken}]`) : ok('all #anchors resolve');

  // 6. Structured data
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  if (!blocks.length) warn('no JSON-LD');
  for (const [, raw] of blocks) {
    try {
      const d = JSON.parse(raw), nodes = d['@graph'] || [d];
      d['@context'] ? ok(`JSON-LD parses (${nodes.length} node(s))`) : fail('JSON-LD without @context');
      const types = new Set(raw.match(/"@type"\s*:\s*"[^"]+"/g).map(s => s.split('"')[3]));
      if (types.has('HowTo')) fail('HowTo schema is deprecated (no rich result since 2023)');
      if (types.has('FAQPage')) info('FAQPage: no Google rich result since 2026-05-07; keep, do not expand for SERP');
      const rel = raw.match(/"(url|logo|image|@id)"\s*:\s*"(?!https?:)[^"#][^"]*"/g);
      if (rel) fail(`relative URLs in JSON-LD: ${rel.slice(0, 3)}`);
    } catch (e) { fail(`JSON-LD invalid: ${e.message}`); }
  }

  // 7. robots.txt + sitemap
  !robots ? fail('robots.txt missing') : /^disallow:\s*\/\s*$/im.test(robots) ? fail('robots.txt blocks everything') : ok('robots.txt allows crawl');
  /^sitemap:/im.test(robots) ? ok('robots.txt declares Sitemap') : warn('robots.txt has no Sitemap line');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  locs.length ? ok(`sitemap.xml ${locs.length} URL(s)`) : fail('sitemap.xml missing or empty');
  if (canon && locs.length && !locs.includes(canon)) warn('canonical URL not listed in sitemap.xml');
  if (!url) {
    const lastmod = (sitemap.match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1];
    const changed = execSync('git log -1 --format=%cs -- index.html', { cwd: root, encoding: 'utf8' }).trim();
    if (lastmod && changed && changed > lastmod) warn(`sitemap lastmod ${lastmod} older than last index.html commit ${changed}`);
  }

  // 8. Content volume
  const words = strip(html.replace(/<head[\s\S]*?<\/head>/i, '')).split(' ').length;
  words < 500 ? warn(`~${words} visible words (homepage min ~500)`) : ok(`~${words} visible words`);

  // 9. Response headers (live only)
  if (headers) {
    const xr = headers.get('x-robots-tag'); if (xr && /noindex/i.test(xr)) fail(`X-Robots-Tag: ${xr}`);
    for (const h of ['strict-transport-security', 'x-content-type-options', 'content-security-policy', 'cache-control'])
      headers.get(h) ? ok(`header ${h}`) : info(`header ${h} not set (configure in vercel.json)`);
  }

  console.log(fails ? `\n${fails} FAIL` : '\nNo FAIL');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e.message); process.exit(2); });
