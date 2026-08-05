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
 * approximating it: same TRANSLATABLE_KEYS, same references allowlist, same
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

/** Parse a `new Set([...])` literal out of build.js.
 *
 * Read out of the source rather than imported so that the audit fails LOUDLY on
 * a rename or a deletion, naming the declaration it could not find, instead of
 * quietly walking with an empty set and reporting a fully translated site.
 * Comments are stripped FIRST: an apostrophe inside one ("the lane's
 * grounding") desynchronizes quote pairing and silently drops every key after
 * it — which is exactly how an early version of this audit reported 8 missing
 * strings where there were 25. The count assertion makes that failure loud.
 */
function parseSet(name, min) {
  const src = fs.readFileSync(path.join(ROOT, 'build.js'), 'utf8');
  const parts = src.split(`const ${name} = new Set([`);
  assert.strictEqual(parts.length, 2, `build.js does not declare ${name}`);
  const block = parts[1].split(/\]\);/)[0];
  const code = block.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  const keys = (code.match(/'([^']+)'/g) || []).map((s) => s.slice(1, -1));
  assert.ok(keys.length >= min, `failed to parse ${name} out of build.js (got ${keys.length})`);
  return new Set(keys);
}

/** The per-subtree allowlists, parsed out of build.js's SUBTREE_TRANSLATABLE.
 *
 * A map from a subtree's key to the keys that are prose INSIDE it, because the
 * exceptions multiply: `references` first, then a bibliography where `title` is
 * a book's name and must not be translated. As booleans threaded through the
 * walk each new exception touched every call site; as entries in a map they
 * cost one line and this parser stays the same.
 *
 * Every entry beyond `references` is OPTIONAL by construction — a repo with no
 * bibliography declares no `works` allowlist, the walk never narrows there, and
 * a dataset with no such key builds byte-identically (core adr/0001).
 *
 * Comments are stripped BEFORE parsing: the ADOPT block inside the map carries
 * a commented example entry, and an example a repo has not adopted must not be
 * read as one it has.
 */
function parseSubtreeSets() {
  const src = fs.readFileSync(path.join(ROOT, 'build.js'), 'utf8');
  const parts = src.split('const SUBTREE_TRANSLATABLE = {');
  assert.strictEqual(parts.length, 2, 'build.js does not declare SUBTREE_TRANSLATABLE');
  const body = parts[1].split(/^};/m)[0];
  const code = body.replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  const map = {};
  for (const m of code.matchAll(/([A-Za-z_$][\w$]*)\s*:\s*new Set\(\[([^\]]*)\]\)/g)) {
    map[m[1]] = new Set((m[2].match(/'([^']+)'/g) || []).map((s) => s.slice(1, -1)));
  }
  assert.ok(
    map.references && map.references.size,
    'failed to parse SUBTREE_TRANSLATABLE out of build.js');
  return map;
}

/** Every string build.js would route through the dictionaries.
 *
 * Line for line the walk in `localizeData`, including the rule that resolves
 * the allowlist: the nearest enclosing declared subtree wins and is sticky.
 */
function translatableStrings() {
  const KEYS = parseSet('TRANSLATABLE_KEYS', 10);
  const SUBTREES = parseSubtreeSets();
  const out = [];
  const walk = (val, key, subtree) => {
    const here = Object.prototype.hasOwnProperty.call(SUBTREES, key) ? key : subtree;
    const keys = SUBTREES[here] || KEYS;
    if (Array.isArray(val)) return val.forEach((v) => walk(v, key, here));
    if (val && typeof val === 'object') {
      return Object.keys(val).forEach((k) => walk(val[k], k, here));
    }
    if (typeof val === 'string' && keys.has(key)) out.push(val);
  };
  walk(data, null, null);
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

/**
 * Everything above trusts that the walk in this file selects the same strings
 * `localizeData` translates. That trust is exactly what broke when the walk and
 * the compiler drifted, so it is checked directly: translate the dataset with a
 * dictionary that MARKS every string, then read back which ones the compiler
 * actually moved. Marking per string (rather than one sentinel for all)
 * preserves the identity of each, so the two sets are comparable.
 *
 * Any divergence — a new subtree allowlist in build.js, a boolean smuggled back
 * into the walk, a rule reproduced slightly differently here — surfaces as a
 * named list of strings instead of as a mistranslated page.
 */
test('this walk selects exactly the strings localizeData translates', () => {
  const { localizeData } = require('../build.js');
  // NUL: legal in a JSON string and present in no real one, so a marked value
  // cannot collide with dataset prose. (build.js only builds when run directly,
  // so requiring it here compiles nothing.)
  const MARK = '\u0000';
  const markDict = {};
  for (const s of allStrings()) markDict[s] = MARK + s;
  const localized = localizeData(data, markDict, 'en');

  const moved = new Set();
  const collect = (v) => {
    if (Array.isArray(v)) return v.forEach(collect);
    if (v && typeof v === 'object') return Object.values(v).forEach(collect);
    if (typeof v === 'string' && v.startsWith(MARK)) moved.add(v.slice(MARK.length));
  };
  collect(localized);

  const selected = new Set(translatableStrings());
  // Two empty sets agree about nothing. A dataset that routes no string at all
  // through the dictionaries would make this test vacuous rather than green.
  assert.ok(selected.size, 'no translatable strings found — this comparison would be vacuous');
  const onlyCompiler = [...moved].filter((s) => !selected.has(s)).sort();
  const onlyTest = [...selected].filter((s) => !moved.has(s)).sort();
  assert.deepStrictEqual(
    { onlyCompiler, onlyTest }, { onlyCompiler: [], onlyTest: [] },
    `this file no longer mirrors localizeData. onlyCompiler = strings the build ` +
    `translates and this audit ignores (they will render untranslated and nothing ` +
    `else would say so); onlyTest = strings this audit demands translations for ` +
    `that the build never translates (a Spanish "translation" of a book title).`);
});

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
