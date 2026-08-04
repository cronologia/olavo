'use strict';
/**
 * i18n completeness — every translatable string reaches every locale.
 *
 * Why this test exists
 * --------------------
 * The dictionaries are hand-authored under exact-key discipline (ADR-0004): a
 * key must be the CURRENT dataset string, byte for byte. The translator falls
 * back to the source string when a key is absent, which is the right runtime
 * behaviour — a missing translation must never blank the page — but it fails
 * SILENTLY. Nothing went red; the Spanish and Portuguese pages simply carried
 * English sentences, and the English page carried Portuguese ones.
 *
 * That is not hypothetical. The doctrines panel shipped with its titles and
 * its twelve layer names left in Portuguese in all three locales, and the
 * defect was found by the project owner looking at the rendered page. Two
 * further leaks survived the first fix: four exposition dates written as prose
 * ("undated in the corpus") sat in the untranslated `date` field, and two
 * dictionary keys had gone stale when their source prose was rewritten — so
 * their translations were dead weight while the new English text rendered
 * verbatim on both localized pages.
 *
 * Both directions are checked, because each catches a different failure:
 *
 *   MISSING key  -> the localized page renders English (or Portuguese) prose.
 *   STALE key    -> a translation exists for text no longer in the dataset;
 *                   its live counterpart is almost certainly untranslated.
 *
 * The walk deliberately mirrors build.js's `localizeData` rather than
 * approximating it: same TRANSLATABLE_KEYS, same `references` skip, same
 * array-inherits-the-parent-key rule. A test that checked a different set of
 * strings than the compiler translates would pass while the page was wrong.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const data = require(path.join(ROOT, 'data', 'chronology.json'));
const LANGS = ['es', 'pt'];

/** TRANSLATABLE_KEYS, read from build.js so the two cannot drift apart.
 *
 * Parsed rather than exported because build.js runs the whole build on
 * require. Comments are stripped first: an apostrophe inside one ("the lane's
 * grounding") desynchronizes quote pairing and silently drops every key after
 * it — which is exactly how an earlier version of this audit reported 8
 * missing strings where there were 25.
 */
function translatableKeys() {
  const src = fs.readFileSync(path.join(ROOT, 'build.js'), 'utf8');
  const block = src.split('const TRANSLATABLE_KEYS = new Set([')[1].split(/\]\);/)[0];
  const code = block.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  const keys = code.match(/'([^']+)'/g).map((s) => s.slice(1, -1));
  assert.ok(keys.length > 20, 'failed to parse TRANSLATABLE_KEYS out of build.js');
  return new Set(keys);
}

/** Every string build.js would route through the dictionaries, in order. */
function translatableStrings() {
  const KEYS = translatableKeys();
  const out = [];
  const walk = (val, key) => {
    if (key === 'references') return;
    if (Array.isArray(val)) return val.forEach((v) => walk(v, key));
    if (val && typeof val === 'object') return Object.keys(val).forEach((k) => walk(val[k], k));
    if (typeof val === 'string' && KEYS.has(key)) out.push(val);
  };
  walk(data, null);
  return [...new Set(out)];
}

/** Every string anywhere in the dataset — the universe a key may name. */
function allStrings() {
  const seen = new Set();
  const walk = (v) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (v && typeof v === 'object') return Object.values(v).forEach(walk);
    if (typeof v === 'string') seen.add(v);
  };
  walk(data);
  return seen;
}

const dict = (lang) =>
  JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'i18n', `${lang}.json`), 'utf8')).strings;

for (const lang of LANGS) {
  test(`${lang}: every translatable dataset string has a translation`, () => {
    const d = dict(lang);
    const missing = translatableStrings().filter((s) => !(s in d));
    assert.deepStrictEqual(
      missing, [],
      `${missing.length} string(s) would render untranslated on the ${lang} page. ` +
      `Add them to data/i18n/${lang}.json verbatim (exact-key discipline, ADR-0004).`);
  });

  test(`${lang}: no dictionary key has gone stale`, () => {
    const universe = allStrings();
    const stale = Object.keys(dict(lang)).filter((k) => !universe.has(k));
    assert.deepStrictEqual(
      stale, [],
      `${stale.length} key(s) in data/i18n/${lang}.json match nothing in the dataset. ` +
      `The source prose was almost certainly rewritten: re-key the translation ` +
      `to the current string rather than leaving both.`);
  });

  test(`${lang}: coverage in _meta matches the dictionary`, () => {
    const doc = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'data', 'i18n', `${lang}.json`), 'utf8'));
    assert.strictEqual(
      doc._meta.coverage, `${Object.keys(doc.strings).length} strings`,
      `${lang}: _meta.coverage is a hand-written count and has drifted`);
  });
}

test('doctrine dating: prose goes in dateNote, dates stay in date', () => {
  const items = (data.doctrines && data.doctrines.items) || [];
  assert.ok(items.length, 'no doctrines to check');
  for (const it of items) {
    for (const e of it.expositions || []) {
      assert.ok(e.date || e.dateNote, `${it.id}: exposition "${e.where}" has neither date nor dateNote`);
      if (e.date) {
        assert.match(
          e.date, /^\d{4}(-\d{2}(-\d{2})?)?$/,
          `${it.id}: "${e.date}" is prose, not a date — it will render untranslated ` +
          `on the es/pt pages. Move it to dateNote.`);
      }
    }
  }
});
