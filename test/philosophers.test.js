'use strict';
/*
 * Tests for philosophers.js — this repo's own per-philosopher reception pages.
 * Fixtures only; independent of whether data/philosophers.json is shipped.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const build = require('../build.js');
const ph = require('../philosophers.js');

const helpers = {
  esc: build.esc,
  renderCites: build.renderCites,
  seoHead: build.seoHead,
  langSwitcher: build.langSwitcher,
};

const META = {
  title: 'Olavo de Carvalho — Cronologia',
  description: 'test',
  language: 'en',
  siteUrl: 'https://cronologia.github.io/olavo/',
  lastUpdated: '2026-08-02',
};

const ENTRY = {
  slug: 'kant',
  name: 'Kant',
  fullName: 'Immanuel Kant',
  dates: '1724–1804',
  origin: 'Königsberg, Prussia',
  summary: 'German philosopher of the Enlightenment. <script>alert(1)</script>',
  timeline: [
    { when: '1724', label: 'Born in Königsberg', sources: ['sep-kant'] },
    { when: 'c. 1755', label: 'Begins lecturing', sources: ['sep-kant'], approx: true },
    { when: '1781', label: 'Critique of Pure Reason', sources: ['sep-kant'] },
  ],
  sources: ['sep-kant'],
};

const RECEPTION = {
  canonical: 'Kant',
  filesWithHits: 222,
  totalHits: 1113,
  engagedAulas: 75,
  topAulas: [
    { aula: 273, id: 'COF273', hits: 45, date: '2014-12-06', dateVerified: true },
    { aula: 271, id: 'COF271', hits: 44, date: null, dateVerified: false },
  ],
};

const REFS = [
  { id: 'sep-kant', title: 'Immanuel Kant (SEP)', url: 'https://plato.stanford.edu/entries/kant/', publisher: 'Stanford Encyclopedia of Philosophy', type: 'encyclopedia' },
  { id: 'cof-transcriptions', title: 'COF transcriptions', url: 'https://github.com/alissonryan/cof-olavo', publisher: 'Community repo', type: 'corpus' },
  { id: 'cof-audio', title: 'COF em Áudio', url: 'https://archive.org/details/COFemAudio', publisher: 'Internet Archive', type: 'corpus' },
  { id: 'unused-ref', title: 'Never cited', url: 'https://example.org/', publisher: 'X', type: 'web' },
];

function renderKant(overrides = {}) {
  return ph.renderPhilosopherPage({
    entry: ENTRY, reception: RECEPTION, meta: META, ui: build.UI.en, lang: 'en',
    base: 'https://cronologia.github.io/olavo/', route: 'philosophers/kant.html',
    references: REFS, helpers, analytics: '',
    ...overrides,
  });
}

test('philosopher page renders timeline, reception and escapes HTML', () => {
  const html = renderKant();
  assert.match(html, /Critique of Pure Reason/);
  assert.match(html, /Reception in the COF/);
  assert.match(html, /222 of the 589 transcription files/);
  assert.match(html, /&lt;script&gt;/);        // summary is escaped
  assert.doesNotMatch(html, /<script>alert/);  // never raw
  // undated aula renders a dash flag, not an invented date
  assert.match(html, /undated transcription file/);
  // approx timeline entry carries the ≈ flag
  assert.match(html, /≈/);
});

test('page references are only the cited ones, in shared order', () => {
  const html = renderKant();
  assert.match(html, /Immanuel Kant \(SEP\)/);
  assert.match(html, /COF transcriptions/); // pulled in by the reception section
  assert.doesNotMatch(html, /Never cited/);
});

test('reception section is omitted when no reception data exists', () => {
  const html = renderKant({ reception: null });
  assert.doesNotMatch(html, /Reception in the COF/);
  assert.doesNotMatch(html, /COF transcriptions/);
});

test('index section links every philosopher and shows reception counts', () => {
  const receptionAll = { philosophers: { kant: RECEPTION } };
  const section = ph.renderPhilosophersIndexSection(
    { intro: 'Ten thinkers.', philosophers: [ENTRY] }, receptionAll, build.UI.en, { esc: build.esc });
  assert.match(section, /philosophers\/kant\.html/);
  assert.match(section, /present in 222 files/);
});

test('routes cover every slug', () => {
  const routes = ph.philosopherRoutes({ philosophers: [ENTRY, { slug: 'hegel' }] });
  assert.deepEqual(routes, ['philosophers/kant.html', 'philosophers/hegel.html']);
});

test('shipped data, when present, is internally consistent', () => {
  const dataDir = path.join(__dirname, '..', 'data');
  const chronology = JSON.parse(fs.readFileSync(path.join(dataDir, 'chronology.json'), 'utf8'));
  const shipped = ph.getPhilosophers(chronology);
  if (!shipped) return; // feature not shipped yet — nothing to check
  const reception = ph.loadReception(dataDir);
  const refIds = new Set(shipped.references.map((r) => r.id));
  for (const p of shipped.philosophers) {
    assert.ok(/^[a-z0-9-]+$/.test(p.slug), `${p.slug}: slug must be kebab-case`);
    assert.ok(p.timeline.length >= 5, `${p.slug}: timeline too thin`);
    for (const t of p.timeline) {
      assert.ok(Array.isArray(t.sources) && t.sources.length > 0, `${p.slug}: uncited timeline entry "${t.label}"`);
      for (const s of t.sources) assert.ok(refIds.has(s), `${p.slug}: unknown ref id "${s}"`);
    }
    // Reception has TWO sources: the 585-lecture COF corpus (2009-2022), which
    // yields the frequency table, and the 2002 História Essencial da Filosofia
    // course, which yields the qualitative `readings`. A page needs at least
    // one — a philosopher with neither has no reception to record and no
    // business on a site about whom he engaged.
    //
    // This used to demand the COF table, which was right while the corpus was
    // the only source. Fílon de Alexandria is the case that broke it: extended
    // treatment across one 2002 session, and in the whole COF corpus a single
    // mention that turns out to sit inside a passage he is quoting from another
    // author rather than his own engagement.
    const key = p.receptionKey || p.slug;
    const inCof = !!(reception && reception.philosophers[key]);
    const hasReadings = Array.isArray(p.readings) && p.readings.length > 0;
    assert.ok(inCof || hasReadings,
      `${p.slug}: no reception at all — neither COF data under key "${key}" nor readings`);
  }
  // The reception corpus refs must exist so the reception section can cite them.
  assert.ok(refIds.has('cof-transcriptions') && refIds.has('cof-audio'));
});
