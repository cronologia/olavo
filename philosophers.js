/*
 * philosophers.js — per-philosopher reception pages (this repo's own renderer).
 *
 * This project's second layer: one page per philosopher Olavo referenced,
 * carrying (a) the thinker's own life-and-works timeline from standard public
 * references and (b) a "reception in the COF" section computed from
 * data/cof-reception.json (which lectures engage him, on which dates).
 *
 * Contract (mirrors core ADR-0001): the feature exists only when
 * data/philosophers.json is present — without it the build is byte-identical
 * to the plain template. Pages assert RECEPTION, never philosophy: what Olavo
 * said and when, not what the philosopher "really" meant (AGENTS.md rule 6).
 *
 * Dates caveat: ~332 of the 589 corpus files carry no verified date; an
 * undated row means an undated FILE, not an undated lecture. Never invent a
 * date here — the corpus's dating defects are documented upstream.
 */
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * The philosopher pages are driven by an OPTIONAL top-level `philosophers`
 * key on data/chronology.json (ADR-0001 idiom: absent key = byte-identical
 * build). This accessor exists so callers never poke the shape directly.
 */
function getPhilosophers(data) {
  return (data && data.philosophers && Array.isArray(data.philosophers.philosophers))
    ? data.philosophers
    : null;
}

function loadReception(dataDir) {
  const file = path.join(dataDir, 'cof-reception.json');
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function philosopherRoutes(ph) {
  return (ph.philosophers || []).map((p) => `philosophers/${p.slug}.html`);
}

/* ---- rendering ---------------------------------------------------------- */

function renderTimelineRows(entry, refNum, esc, renderCites, ui) {
  return (entry.timeline || [])
    .map((t) => {
      const flag = t.approx ? ` <span class="flag" title="${esc(ui.phApproxTitle)}">≈</span>` : '';
      return `        <tr><td class="year-cell">${esc(t.when)}${flag}</td><td>${esc(t.label)}${renderCites(t.sources, refNum)}</td></tr>`;
    })
    .join('\n');
}

function renderReceptionRows(rec, esc) {
  return (rec.topAulas || [])
    .map((a) => {
      const date = a.date ? esc(a.date) : '<span class="flag" title="undated transcription file">—</span>';
      return `        <tr><td class="year-cell">${esc(String(a.aula))}</td><td>${date}</td><td>${esc(String(a.hits))}</td></tr>`;
    })
    .join('\n');
}

/**
 * Full HTML for one philosopher page. `helpers` carries the template build's
 * own primitives (esc, renderCites, seoHead, langSwitcher, alternates) so this
 * module never re-implements them and stays consistent with the main page.
 */
function renderPhilosopherPage(opts) {
  const { entry, reception, meta, ui, lang, base, route, references, helpers, analytics } = opts;
  const { esc, renderCites, seoHead, langSwitcher } = helpers;

  // Local citation numbering: only the references this page actually uses,
  // in the shared file order.
  const used = new Set(entry.sources || []);
  for (const t of entry.timeline || []) for (const s of t.sources || []) used.add(s);
  if (reception) { used.add('cof-transcriptions'); used.add('cof-audio'); }
  const pageRefs = references.filter((r) => used.has(r.id));
  const refNum = new Map(pageRefs.map((r, i) => [r.id, i + 1]));

  const pageMeta = {
    ...meta,
    title: `${entry.name} — ${meta.title}`,
    subtitle: entry.dates ? `${entry.fullName || entry.name} (${entry.dates})` : (entry.fullName || entry.name),
    description: entry.summary,
  };

  // The qualitative half of the reception layer (olavo#11 wave 2). The table
  // below says WHICH lectures engage a philosopher and how often; this says
  // what he actually claimed about him, and comes from a different and earlier
  // corpus — the 2002 course, seven years before the one the counts measure.
  // Rendered above the table because a reader wants the claim before the
  // frequency, and gated on the optional `readings` key so a philosopher
  // without one is unchanged.
  const readings = Array.isArray(entry.readings) ? entry.readings : [];
  const readingsHtml = readings.length ? `
    <section id="readings">
      <h2>${esc(ui.phReadingsHeading)}</h2>
      <p class="notice notice-attribution">${esc(ui.phReadingsNote)}</p>
      <ul class="ph-readings">
${readings.map((r) => `        <li>
          <p>${esc(r.claim)}</p>
          <p class="ph-reading-src">${esc(r.where)} — <span class="dc-date">${esc(r.date)}</span> ${
            r.dateVerified
              ? '<span class="dc-ok" title="date verified">✓</span>'
              : '<span class="flag" title="date not verified">?</span>'}</p>
        </li>`).join('\n')}
      </ul>
    </section>
` : '';

  const receptionHtml = reception ? `
    <section id="reception">
      <h2>${esc(ui.phReceptionHeading)}</h2>
      <p class="section-intro">${esc(ui.phReceptionIntro(reception.filesWithHits, reception.engagedAulas))}</p>
      <p class="notice notice-attribution">${esc(ui.phReceptionNote)}</p>
      <div class="table-scroll">
      <table class="meetings">
        <thead><tr><th>${esc(ui.phAula)}</th><th>${esc(ui.phDate)}</th><th>${esc(ui.phHits)}</th></tr></thead>
        <tbody>
${renderReceptionRows(reception, esc)}
        </tbody>
      </table>
      </div>
      <p class="section-intro">${esc(ui.phDateCaveat)}${renderCites(['cof-transcriptions', 'cof-audio'], refNum)}</p>
    </section>
` : '';

  return `<!DOCTYPE html>
<html lang="${esc(meta.language || 'en')}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(pageMeta.title)}</title>
  <meta name="description" content="${esc(entry.summary || '')}">
${analytics || ''}
  <link rel="stylesheet" href="../../styles.css">
${seoHead(pageMeta, base, route, lang)}
</head>
<body>
  <header class="site-header">
    <div class="wrap">
      ${langSwitcher(route, lang, ui)}
      <h1>${esc(entry.name)}</h1>
      <p class="subtitle">${esc(pageMeta.subtitle)}${entry.origin ? ` — ${esc(entry.origin)}` : ''}</p>
      <p class="lead">${esc(entry.summary || '')}${renderCites(entry.sources, refNum)}</p>
      <p class="updated"><a href="../index.html#philosophers">← ${esc(ui.phBack)}</a></p>
    </div>
  </header>${ui.disclaimer ? `\n  <div class="i18n-disclaimer" role="note">🌐 ${esc(ui.disclaimer)}</div>` : ''}

  <nav class="site-nav">
    <div class="wrap">
      <a href="#timeline">${esc(ui.phTimelineHeading)}</a>${readings.length ? `\n      <a href="#readings">${esc(ui.phReadingsHeading)}</a>` : ''}${reception ? `\n      <a href="#reception">${esc(ui.phReceptionHeading)}</a>` : ''}
      <a href="#references">${esc(ui.references)}</a>
    </div>
  </nav>

  <main class="wrap">
    <section id="timeline">
      <h2>${esc(ui.phTimelineHeading)}</h2>
      <div class="table-scroll">
      <table class="meetings">
        <thead><tr><th>${esc(ui.thYear)}</th><th>${esc(ui.thEvent)}</th></tr></thead>
        <tbody>
${renderTimelineRows(entry, refNum, esc, renderCites, ui)}
        </tbody>
      </table>
      </div>
    </section>
${readingsHtml}${receptionHtml}
    <section id="references">
      <h2>${esc(ui.referencesHeading)}</h2>
      <ol class="references">
${pageRefs.map((r, i) => `        <li id="ref-${i + 1}"><a href="${esc(r.url)}" rel="noopener">${esc(r.title)}</a> — ${esc(r.publisher)}</li>`).join('\n')}
      </ol>
    </section>
  </main>

  <footer class="site-footer">
    <div class="wrap">
      <p>${ui.footer}</p>
    </div>
  </footer>
</body>
</html>
`;
}

/** Main-page section: one card per philosopher, linking to its page. */
function renderPhilosophersIndexSection(ph, receptionAll, ui, helpers) {
  const { esc } = helpers;
  const cards = (ph.philosophers || [])
    .map((p) => {
      const rec = receptionAll && receptionAll.philosophers && receptionAll.philosophers[p.receptionKey || p.slug];
      const recLine = rec ? `<p class="muted">${esc(ui.phCardReception(rec.filesWithHits, rec.engagedAulas))}</p>` : '';
      return `      <div class="cp-card">
        <h3><a href="philosophers/${esc(p.slug)}.html">${esc(p.name)}</a>${p.dates ? ` <span class="muted">(${esc(p.dates)})</span>` : ''}</h3>
        <p>${esc(p.summary || '')}</p>
        ${recLine}
      </div>`;
    })
    .join('\n');
  return `    <section id="philosophers">
      <h2>${esc(ui.philosophersHeading)}</h2>
      <p class="section-intro">${esc(ph.intro || '')}</p>
      <div class="party-grid">
${cards}
      </div>
    </section>

`;
}

module.exports = {
  getPhilosophers, loadReception, philosopherRoutes,
  renderPhilosopherPage, renderPhilosophersIndexSection,
  renderTimelineRows, renderReceptionRows,
};
