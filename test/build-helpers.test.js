'use strict';
// Unit tests for build.js's pure helpers (zero-dependency; node --test).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { esc, formatArchiveTs, renderCites, renderVizChips, decadeOf, translator, siteBase, alternates, localizeData } = require('../build.js');

test('esc escapes HTML metacharacters', () => {
  assert.equal(esc('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
  assert.equal(esc(null), '');
  assert.equal(esc(5), '5');
});

test('formatArchiveTs renders a Wayback timestamp as YYYY-MM-DD', () => {
  assert.equal(formatArchiveTs('20260714120000'), '2026-07-14');
  assert.equal(formatArchiveTs(''), '');
  assert.equal(formatArchiveTs(undefined), '');
});

test('renderCites links known ids, passes raw URLs through, drops unknowns', () => {
  const nums = new Map([['wiki', 1], ['official', 2]]);
  const html = renderCites(['wiki', 'official'], nums);
  assert.match(html, /#ref-1/);
  assert.match(html, /#ref-2/);
  assert.match(renderCites(['https://example.org/x'], nums), /\[web\]/);
  assert.equal(renderCites(['nope'], nums), '');
  assert.equal(renderCites([], nums), '');
  assert.equal(renderCites(undefined, nums), '');
});

test('renderVizChips renders header pill links, or nothing when undeclared', () => {
  const html = renderVizChips([{ href: '#chronology', label: '📜 Chronology' }]);
  assert.match(html, /class="viz-chips"/);
  assert.match(html, /<a href="#chronology">📜 Chronology<\/a>/);
  assert.equal(renderVizChips([]), '');
  assert.equal(renderVizChips(undefined), '');
  assert.match(renderVizChips([{ href: '#a"b', label: '<x>' }]), /#a&quot;b.*&lt;x&gt;/);
});

test('decadeOf groups years into decades', () => {
  assert.equal(decadeOf(1970), '1970s');
  assert.equal(decadeOf(1979), '1970s');
  assert.equal(decadeOf(2026), '2020s');
});

test('translator returns the translation when present, else the English source', () => {
  const t = translator({ Hello: 'Hola' });
  assert.equal(t('Hello'), 'Hola');
  assert.equal(t('Missing'), 'Missing');
  assert.equal(t(null), null);
});

test('siteBase normalizes to exactly one trailing slash', () => {
  assert.equal(siteBase({ siteUrl: 'https://x.io/fsp' }), 'https://x.io/fsp/');
  assert.equal(siteBase({ siteUrl: 'https://x.io/fsp///' }), 'https://x.io/fsp/');
  assert.match(siteBase({}), /\/$/);
});

test('alternates emits a self canonical + hreflang for every locale + x-default', () => {
  const html = alternates('https://x.io/fsp/', 'a.html', 'pt');
  assert.match(html, /<link rel="canonical" href="https:\/\/x\.io\/fsp\/pt\/a\.html">/);
  assert.match(html, /hreflang="en" href="https:\/\/x\.io\/fsp\/en\/a\.html"/);
  assert.match(html, /hreflang="x-default" href="https:\/\/x\.io\/fsp\/"/);
});

test('localizeData translates whitelisted prose, sets lang, and never touches references', () => {
  const data = {
    meta: { title: 'T', description: 'Hello', language: 'en' },
    events: [{ year: 1970, title: 'Hello', place: 'Rome', date: '1970', dateVerified: true, sources: ['r'] }],
    figures: [{ name: 'Hello', role: 'Hello', sources: ['r'] }],
    references: [{ id: 'r', title: 'Hello', url: 'https://x', publisher: 'P', type: 'x' }],
  };
  const es = localizeData(data, { Hello: 'Hola' }, 'es');
  assert.equal(es.meta.language, 'es');
  assert.equal(es.meta.description, 'Hola');       // description: translated
  assert.equal(es.events[0].title, 'Hola');        // event title: translated
  assert.equal(es.figures[0].name, 'Hello');       // proper name: NOT translated
  assert.equal(es.references[0].title, 'Hello');   // reference title: NOT translated
  assert.equal(es.events[0].date, '1970');         // dates untouched
  // English (empty dict) is the identity transform on content.
  const en = localizeData(data, {}, 'en');
  assert.equal(JSON.stringify(en.events), JSON.stringify(data.events));
});
// --- collectTranslatable: the coverage report and the renderer, same set -----
//
// These two walks used to be written twice, in two files, under a comment
// asserting they matched. They did not, in both directions at once: the
// reporting copy skipped `references` (missing every publisherNote the pages
// render) and applied the general key set to `approvalLadder` (counting the
// closed `status` enum, and instructing whoever ran it to translate
// `not-found`). The bug that matters here is not either mistranslation — it is
// a coverage number that measures a set the renderer never uses. So the test
// is not "does it collect the right keys" but "is it the SAME set", derived by
// instrumenting localizeData and comparing.

const fs = require('node:fs');
const path = require('node:path');
const { collectTranslatable, keysFor, TRANSLATABLE_KEYS, SUBTREE_TRANSLATABLE } = require('../build.js');

/**
 * Every string localizeData actually hands to the translator, in walk order.
 *
 * The lookup is `Object.prototype.hasOwnProperty.call(dict, s)`, which on a
 * Proxy fires `getOwnPropertyDescriptor` — not `has`, and not `get`. Trapping
 * the wrong one yields an empty list, which would make the comparison below
 * pass for the wrong reason, so the trap is asserted to have fired.
 *
 * Empty and whitespace-only strings are dropped: localizeData passes them
 * through the translator (harmlessly, they can't be dictionary keys) while
 * collectTranslatable filters them, because listing "" as a string awaiting
 * translation is noise in a coverage report.
 */
function stringsSeenByLocalize(data) {
  const seen = [];
  const dict = new Proxy({}, {
    getOwnPropertyDescriptor: (_t, k) => { if (typeof k === 'string') seen.push(k); return undefined; },
  });
  localizeData(data, dict, 'es');
  assert.ok(seen.length > 0, 'instrumentation failed: the translator lookup was never observed');
  return seen.filter((s) => s.trim());
}

const LADDER_FIXTURE = {
  meta: { title: 'T', description: 'D', language: 'en', lastUpdated: '2026-01-01' },
  approvalLadder: {
    heading: 'How far the case went',
    note: 'A note the reader reads.',
    stages: [
      { label: 'Diocese', when: '1851', who: 'The bishop', status: 'favourable', outcome: 'Declared worthy of belief.' },
      { label: 'Rome', when: '1852', who: 'Pius IX', status: 'not-found', noDocument: 'Nothing located.' },
    ],
  },
  events: [{ year: 1851, date: '1851-09-19', dateVerified: true, title: 'A title', text: 'Some prose.', place: 'Grenoble' }],
  references: [{ id: 'r', title: 'A Book Nobody Should Translate', publisher: 'Someone', publisherNote: 'Devotional, cited for the date only.', type: 'book' }],
};

test('collectTranslatable returns exactly the strings localizeData translates', () => {
  const collected = collectTranslatable(LADDER_FIXTURE);
  const localized = stringsSeenByLocalize(LADDER_FIXTURE);
  assert.deepEqual(new Set(collected), new Set(localized),
    'the coverage walk and the render walk disagree — one of them is lying about what gets translated');
  assert.equal(collected.length, new Set(collected).size, 'collectTranslatable must deduplicate');
});

test('collectTranslatable honours the approvalLadder allowlist and skips the status enum', () => {
  const ladder = SUBTREE_TRANSLATABLE.approvalLadder;
  if (!ladder) {
    // This repo's dataset has no approval ladder, so it declares no allowlist and
    // the subtree falls through to the general keys. That is correct — but assert
    // the premise rather than just returning, so a repo that later grows a ladder
    // without an allowlist fails here instead of quietly translating its enum.
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'chronology.json'), 'utf8'));
    assert.ok(!data.approvalLadder,
      'the dataset has an approvalLadder but SUBTREE_TRANSLATABLE declares no allowlist for it — '
      + 'the status enum would be sent through the dictionaries and the localized build would fail');
    return;
  }
  const got = new Set(collectTranslatable(LADDER_FIXTURE));
  assert.ok(got.has('Declared worthy of belief.'));
  assert.ok(got.has('Nothing located.'));
  assert.ok(got.has('The bishop'));
  assert.ok(got.has('A note the reader reads.'));
  // `status` is prose elsewhere, which is exactly why it needs pinning here.
  assert.ok(TRANSLATABLE_KEYS.has('status'), 'precondition: status is generally translatable');
  assert.ok(!ladder.has('status'), 'precondition: not inside the ladder allowlist');
  assert.ok(!got.has('favourable'), 'translating the status enum breaks the localized build');
  assert.ok(!got.has('not-found'));
});

test('collectTranslatable includes references[].publisherNote but not the citation itself', () => {
  const got = new Set(collectTranslatable(LADDER_FIXTURE));
  assert.ok(got.has('Devotional, cited for the date only.'), 'publisherNote renders on the page');
  assert.ok(!got.has('A Book Nobody Should Translate'), "a book's title is its name");
  assert.ok(!got.has('Someone'));
});

test('keysFor resolves the nearest enclosing subtree and is sticky through descendants', () => {
  assert.equal(keysFor('references', null)[1], SUBTREE_TRANSLATABLE.references);
  // A nested object under references keeps the bibliographic key set.
  assert.equal(keysFor('anything', 'references')[1], SUBTREE_TRANSLATABLE.references);
  assert.equal(keysFor('anything', null)[1], TRANSLATABLE_KEYS);
  // A dataset key colliding with Object.prototype must not resolve to it.
  assert.equal(keysFor('constructor', null)[1], TRANSLATABLE_KEYS);
});
