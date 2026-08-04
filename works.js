'use strict';
/**
 * works.js — the bibliography panel.
 *
 * A no-op when the dataset carries no `works` key, so the build stays
 * byte-identical to the plain template (core ADR-0001, the same contract
 * philosophers.js and doctrines.js hold to).
 *
 * Why a panel and not chronology events
 * -------------------------------------
 * Six books were already in the chronology as events, and adding the other
 * twenty-four would have buried a fifty-five-event life under a booklist. More
 * to the point, the interesting thing about this output is not any single title
 * but its SHAPE — where the work clusters and where it stops. A chronology
 * interleaved with everything else cannot show that; a bibliography grouped
 * into phases, with a density strip over it, can.
 *
 * The density strip
 * -----------------
 * One bar per year, height by number of titles first published in it. It is
 * the only part of this panel that states something the list does not: the
 * 1983 cluster, the dense stretch from 1992 to 1998, the thinning across the
 * 2000s — two titles in twelve years, either side of the emigration, while he
 * was teaching rather than publishing — and the late run where a newspaper
 * column became ten volumes. Years with no title are drawn as an empty slot
 * rather than skipped: the gaps are the point, and a compressed axis would
 * hide the very thing worth seeing.
 */

/** The optional key, normalised. Returns null when there is nothing to draw. */
function getWorks(data) {
  const w = data && data.works;
  if (!w || !Array.isArray(w.phases) || !w.phases.length) return null;
  return w;
}

/** Every dated title, flattened out of the phases. */
function allItems(w) {
  return w.phases.flatMap((p) => (Array.isArray(p.items) ? p.items : []));
}

/** Bars per year across the whole run, empty years included. */
function renderDensity(items, esc, t) {
  // A series is ONE row in the list and many bars in the strip. Counting the
  // ten Cartas de um Terráqueo volumes once, at 2013, drew 2014-2019 as silent
  // years in which a volume in fact appeared almost annually — the strip would
  // have contradicted the note directly beneath it. `years` carries the real
  // publication years where they are known; where they are not, the entry
  // counts once and the caption says the strip counts what is dated.
  const years = items.flatMap((i) => (Array.isArray(i.years) && i.years.length ? i.years : [i.year]))
    .map(Number).filter((y) => Number.isFinite(y));
  if (years.length < 2) return '';
  const from = Math.min(...years), to = Math.max(...years);
  const counts = new Map();
  for (const y of years) counts.set(y, (counts.get(y) || 0) + 1);
  const span = to - from + 1;
  const max = Math.max(...counts.values());
  const W = 720, H = 118, padL = 8, padB = 26, padT = 10;
  const slot = (W - padL * 2) / span;
  const barW = Math.max(3, Math.min(14, slot - 2));
  const plotH = H - padB - padT;
  const bars = [];
  const ticks = [];
  for (let y = from; y <= to; y++) {
    const n = counts.get(y) || 0;
    const x = padL + (y - from) * slot + (slot - barW) / 2;
    const h = n ? Math.max(4, (plotH * n) / max) : 0;
    // An empty year still gets a mark, low and pale: a missing bar and a zero
    // bar read identically otherwise, and the silences carry the argument.
    bars.push(n
      ? `      <rect class="wk-bar" x="${x.toFixed(1)}" y="${(padT + plotH - h).toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="1.5"><title>${esc(String(y))} — ${n}</title></rect>`
      : `      <rect class="wk-bar wk-bar-none" x="${x.toFixed(1)}" y="${(padT + plotH - 2).toFixed(1)}" width="${barW.toFixed(1)}" height="2" rx="1" />`);
    // Endpoints always, decades otherwise — but not a decade sitting on top of
    // an endpoint. 2020 and 2022 are two slots apart and their labels collide.
    const nearEnd = Math.abs(y - from) < 3 || Math.abs(y - to) < 3;
    if (y === from || y === to || (y % 10 === 0 && !nearEnd)) {
      ticks.push(`      <text class="wk-tick" x="${(x + barW / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle">${esc(String(y))}</text>`);
    }
  }
  return `<figure class="wk-density">
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('wkDensityAlt', 'Titles published per year'))}">
${bars.join('\n')}
${ticks.join('\n')}
  </svg>
  <figcaption>${esc(t('wkDensityCap', 'Titles per year, first publication; a multi-volume series counts once per volume where the volume years are known. Empty years are drawn, not skipped.'))}</figcaption>
</figure>`;
}

const KIND_KEY = {
  book: 'wkKindBook', notes: 'wkKindNotes', collection: 'wkKindCollection',
  edition: 'wkKindEdition', debate: 'wkKindDebate', series: 'wkKindSeries',
  course: 'wkKindCourse',
};
const KIND_EN = {
  book: 'book', notes: 'course notes', collection: 'collection',
  edition: 'edited / annotated', debate: 'debate', series: 'series',
  course: 'from a course',
};

function renderWorksSection(data, ui, helpers) {
  const w = getWorks(data);
  if (!w) return '';
  const esc = helpers.esc;
  const t = (k, fallback) => (ui && ui[k]) || fallback;

  const phases = w.phases.map((p) => {
    const rows = (p.items || []).map((it) => {
      // The kind comes from a closed vocabulary so it can be translated as UI
      // chrome. An unknown kind renders as nothing rather than as English on a
      // localized page.
      const kind = KIND_KEY[it.kind] ? `<span class="wk-kind">${esc(t(KIND_KEY[it.kind], KIND_EN[it.kind]))}</span>` : '';
      const pub = it.publisher && it.publisher !== '—'
        ? `<span class="wk-pub">${esc(it.publisher)}</span>` : '';
      const note = it.note ? `\n          <p class="wk-note">${esc(it.note)}</p>` : '';
      return `        <li class="wk-item">
          <span class="wk-year">${esc(String(it.year))}</span>
          <span class="wk-title">${esc(it.title)}</span>
          ${kind}${pub}${note}
        </li>`;
    }).join('\n');
    return `      <section class="wk-phase">
        <h3>${esc(p.label)} <span class="wk-span">${esc(p.span)}</span></h3>
        ${p.blurb ? `<p class="wk-blurb">${esc(p.blurb)}</p>` : ''}
        <ol class="wk-list">
${rows}
        </ol>
      </section>`;
  }).join('\n');

  const cols = w.columns && Array.isArray(w.columns.items) && w.columns.items.length
    ? `      <section class="wk-phase wk-columns">
        <h3>${esc(t('wkColumns', 'The press work'))}</h3>
        <p class="wk-blurb">${esc(w.columns.note || '')}</p>
        <ul class="wk-runs">
${w.columns.items.map((c) => `          <li><span class="wk-what">${esc(c.what)}</span> <span class="wk-role">${esc(c.role)}</span> <span class="wk-when">${esc(c.when)}</span></li>`).join('\n')}
        </ul>
      </section>` : '';

  return `    <section id="works">
      <h2>${esc(t('worksHeading', 'The books, in order'))}</h2>
      <p class="notice notice-attribution">${esc(w.note)}</p>
${renderDensity(allItems(w), esc, t)}
${phases}
${cols}
      <p class="section-note">${esc(w.sourceNote)}</p>
    </section>
`;
}

module.exports = { getWorks, renderWorksSection, renderDensity };
