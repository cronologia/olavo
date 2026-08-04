'use strict';
/**
 * doctrines.js — the "Doutrinas" panel: concepts the subject named and taught
 * as his own.
 *
 * OPTIONAL RENDERER (core ADR-0001). Everything here is gated on the dataset's
 * top-level `doctrines` key; with the key absent the build is byte-identical to
 * one without this feature, which the fixture tests verify.
 *
 * Editorial contract, and the reason this file needs one at all
 * ------------------------------------------------------------
 * The rest of the site records what OTHERS said about the subject, or what he
 * said about other philosophers. This section states his own doctrines, which
 * is the one place where a chronology could slide into advocacy. So:
 *
 *   - Every entry is framed as a claim of his, not as a truth. The renderer
 *     emits the standing note above the panel, and it is not optional.
 *   - Summaries are the project's own words. His formulations are paraphrased,
 *     never reproduced at length; the few quoted terms are his coinages.
 *   - Where he revised a doctrine, the revision renders as its own line rather
 *     than being folded into one authoritative statement.
 *   - Where the corpus contradicts the popular version of a doctrine, the
 *     entry says so (see `countNote` on the selves: he says four, not five).
 *
 * The diagrams
 * ------------
 * Two doctrines are structural and therefore drawable. Both are inline SVG,
 * theme-aware through currentColor, and carry no dependencies.
 *
 * The twelve layers render as a RING of equal segments rather than a ladder,
 * because he explicitly repudiated the developmental reading: all twelve press
 * simultaneously. A rising staircase would encode the interpretation he
 * corrected.
 */

/** The dataset's optional key; null when absent. */
function getDoctrines(data) {
  const d = data && data.doctrines;
  if (!d || !Array.isArray(d.items) || !d.items.length) return null;
  return d;
}

/** Twelve equal segments on a ring — simultaneous demands, not a staircase.
 *
 * The segments carry NUMBERS and the names sit in a legend beside them. Twelve
 * Portuguese layer names set radially inside a 30-degree wedge overflow it and
 * collide in the hub; a numbered ring plus an ordered list stays readable at
 * any width and keeps the names selectable as text.
 */
function renderRing(names, esc, t) {
  const n = names.length;
  const cx = 170, cy = 170, rOuter = 150, rInner = 66;
  const seg = (2 * Math.PI) / n;
  const parts = names.map((name, i) => {
    const a0 = i * seg - Math.PI / 2;
    const a1 = a0 + seg;
    const pt = (r, a) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    const path = `M ${pt(rInner, a0)} L ${pt(rOuter, a0)} A ${rOuter} ${rOuter} 0 0 1 ${pt(rOuter, a1)} L ${pt(rInner, a1)} A ${rInner} ${rInner} 0 0 0 ${pt(rInner, a0)} Z`;
    const mid = a0 + seg / 2;
    const lr = (rInner + rOuter) / 2;
    const lx = (cx + lr * Math.cos(mid)).toFixed(1);
    const ly = (cy + lr * Math.sin(mid)).toFixed(1);
    return `      <g class="dc-seg dc-seg-${(i % 3) + 1}">
        <path d="${path}"><title>${esc(`${i + 1}. ${name}`)}</title></path>
        <text x="${lx}" y="${ly}">${i + 1}</text>
      </g>`;
  });
  const legend = names.map((name, i) =>
    `      <li><span class="dc-num dc-seg-${(i % 3) + 1}">${i + 1}</span>${esc(name)}</li>`).join('\n');
  return `<div class="dc-ringwrap">
    <svg class="dc-ring" viewBox="0 0 340 340" role="img"
       aria-label="The twelve layers as twelve segments of a single ring, pressing simultaneously: ${esc(names.map((x, i) => `${i + 1} ${x}`).join('; '))}">
${parts.join('\n')}
      <text class="dc-ring-mid" x="${cx}" y="${cy - 4}">${esc(t('dcRingMid', 'twelve layers'))}</text>
      <text class="dc-ring-sub" x="${cx}" y="${cy + 14}">${esc(t('dcRingSub', 'simultaneous'))}</text>
    </svg>
    <ol class="dc-legend">
${legend}
    </ol>
  </div>`;
}

/** A left-to-right chain: each stage presupposes the one before it.
 *
 * The four discourses are the case this exists for, and the shape is the
 * argument. He does not present them as four separate disciplines a reader
 * might take in any order: they are one scale of certainty, and the sequence
 * is — his words, paraphrased — the natural sequence of a human education.
 * You learn to imagine and express the world before you can argue about
 * conduct, and you argue about conduct before you can demonstrate anything.
 * So the diagram is a directed chain with a rising axis under it, NOT four
 * boxes side by side, which would encode exactly the reading he rejects.
 *
 * Contrast the ring: there the twelve press simultaneously and a sequence
 * would be the error. Same renderer file, opposite claim, so the dataset says
 * which one an entry gets (`diagram`) rather than the code guessing.
 */
function renderChain(names, esc, t) {
  const n = names.length;
  const W = 560, boxW = 112, gap = (W - 40 - n * boxW) / Math.max(1, n - 1);
  const nodes = names.map((name, i) => {
    const x = 20 + i * (boxW + gap);
    const arrow = i < n - 1
      ? `      <path class="dc-chain-arrow" d="M ${x + boxW + 6} 58 L ${x + boxW + gap - 6} 58" marker-end="url(#dc-arrow)" />`
      : '';
    // Long names wrap: two lines, split near the middle on a space.
    const words = name.split(' ');
    const mid = words.length > 2 ? Math.ceil(words.length / 2) : words.length;
    const l1 = words.slice(0, mid).join(' ');
    const l2 = words.slice(mid).join(' ');
    // The wash DARKENS monotonically along the chain, because the axis under it
    // says certainty rises. The ring's three-colour cycle is right there (twelve
    // equal segments, no order) and wrong here: reused, it made the analytical
    // discourse the palest box on a diagram whose whole point is that it is the
    // most certain. Computed rather than classed so it stays monotonic for any
    // length.
    const wash = (0.12 + (0.34 * i) / Math.max(1, n - 1)).toFixed(3);
    return `      <g class="dc-chain-node">
        <rect x="${x}" y="28" width="${boxW}" height="60" rx="8" fill-opacity="${wash}" />
        <text class="dc-chain-num" x="${x + 10}" y="46">${i + 1}</text>
        <text class="dc-chain-label" x="${x + boxW / 2}" y="${l2 ? 62 : 68}">${esc(l1)}</text>
        ${l2 ? `<text class="dc-chain-label" x="${x + boxW / 2}" y="78">${esc(l2)}</text>` : ''}
      </g>
${arrow}`;
  });
  const lo = t('dcChainLow', 'least certainty');
  const hi = t('dcChainHigh', 'most certainty');
  return `<svg class="dc-chain" viewBox="0 0 ${W} 130" role="img"
     aria-label="${esc(t('dcChainAlt', 'Four discourses in a single sequence, each presupposing the one before it, from least to most certainty'))}: ${esc(names.map((x, i) => `${i + 1} ${x}`).join('; '))}">
    <defs>
      <marker id="dc-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 8 4 L 0 8 z" />
      </marker>
    </defs>
${nodes.join('\n')}
    <line class="dc-chain-axis" x1="20" y1="108" x2="${W - 20}" y2="108" marker-end="url(#dc-arrow)" />
    <text class="dc-chain-axis-label" x="20" y="124">${esc(lo)}</text>
    <text class="dc-chain-axis-label dc-chain-axis-end" x="${W - 20}" y="124">${esc(hi)}</text>
  </svg>`;
}

/** Nested frames: three functions around a substantial self, on a ground. */
function renderNest(names, esc, groundLabel) {
  const rows = names.map((name, i) => {
    const inset = i * 26;
    const w = 460 - inset * 2;
    const h = 232 - inset * 2;
    return `    <g class="dc-nest-l">
      <rect x="${30 + inset}" y="${26 + inset}" width="${w}" height="${h}" rx="10" />
      <text x="${44 + inset}" y="${46 + inset}">${esc(`${i + 1}. ${name}`)}</text>
    </g>`;
  });
  return `<svg class="dc-nest" viewBox="0 0 520 300" role="img"
     aria-label="Nested selves, outermost first: ${esc(names.join('; '))} — resting on ${esc(groundLabel)}">
${rows.join('\n')}
    <text class="dc-nest-ground" x="260" y="290">${esc(groundLabel)}</text>
  </svg>`;
}

/** `date` is machine-readable and language-neutral (ISO, or a bare year), so it
 * is NOT translated. Where the dating is prose rather than a date — "undated in
 * the corpus", "header reads Dec 2010 — contested" — it belongs in `dateNote`,
 * which IS translated. Keeping the two in one field put English sentences in
 * the middle of the Spanish and Portuguese pages.
 */
function renderExpositions(list, esc) {
  if (!Array.isArray(list) || !list.length) return '';
  const rows = list.map((e) => {
    const flag = e.dateVerified
      ? '<span class="dc-ok" title="date verified against the corpus index">✓</span>'
      : '<span class="flag" title="date not verified">?</span>';
    const when = e.dateNote || e.date || '';
    return `<li>${esc(e.where)} — <span class="dc-date">${esc(when)}</span> ${flag}</li>`;
  });
  return `<ul class="dc-exp">${rows.join('')}</ul>`;
}

/** The panel. `ui` supplies headings so es/pt route through the dictionaries. */
function renderDoctrinesSection(doctrines, ui, helpers) {
  const d = getDoctrines({ doctrines });
  if (!d) return '';
  const esc = helpers.esc;
  const t = (k, fallback) => (ui && ui[k]) || fallback;

  const cards = d.items.map((it) => {
    const bits = [];
    bits.push(`<p class="dc-claim">${esc(it.claim)}</p>`);

    // The dataset names the diagram, because the SHAPE is a claim: a ring says
    // simultaneous, a chain says ordered, and nesting says contained. Inferring
    // it from the array length would let a new entry silently acquire an
    // argument nobody made. `diagram` is optional; the length rule is kept as
    // the fallback so entries written before it are unchanged.
    if (Array.isArray(it.structure) && it.structure.length) {
      const kind = it.diagram || (it.structure.length === 12 ? 'ring' : 'nest');
      if (kind === 'ring') bits.push(renderRing(it.structure, esc, t));
      else if (kind === 'chain') bits.push(renderChain(it.structure, esc, t));
      else bits.push(renderNest(it.structure, esc, t('dcGround', 'the eternal I — the ground, not a fifth term')));
    }
    if (it.countNote) {
      bits.push(`<p class="dc-note dc-correction"><strong>${esc(t('dcCount', 'On the count'))}:</strong> ${esc(it.countNote)}</p>`);
    }
    if (it.origin) {
      bits.push(`<p class="dc-note"><strong>${esc(t('dcOrigin', 'Where it comes from'))}:</strong> ${esc(it.origin)}</p>`);
    }
    if (it.lineageNote) {
      bits.push(`<p class="dc-note"><strong>${esc(t('dcLineage', 'Lineage'))}:</strong> ${esc(it.lineageNote)}</p>`);
    }
    if (it.revision) {
      bits.push(`<p class="dc-note dc-revision"><strong>${esc(t('dcRevision', 'He revised it'))}:</strong> ${esc(it.revision)}</p>`);
    }
    if (it.caveat) {
      bits.push(`<p class="dc-note dc-caveat"><strong>${esc(t('dcCaveat', 'Caveat'))}:</strong> ${esc(it.caveat)}</p>`);
    }
    if (Array.isArray(it.credits) && it.credits.length) {
      bits.push(`<p class="dc-credits"><strong>${esc(t('dcCredits', 'He credits'))}:</strong> ${it.credits.map((c) => `<span class="dc-chip">${esc(c)}</span>`).join(' ')}</p>`);
    }
    bits.push(`<p class="dc-exp-h">${esc(t('dcWhere', 'Where he expounds it'))}</p>`);
    bits.push(renderExpositions(it.expositions, esc));

    // The Portuguese term is GLOSSED, not repeated: on the pt page the
    // translated title IS the original, and printing both gives "As doze
    // camadas da personalidade As doze camadas da personalidade".
    const gloss = it.originalTerm && it.originalTerm !== it.title
      ? ` <span class="dc-orig">${esc(it.originalTerm)}</span>` : '';

    return `<article class="dc-card" id="${esc(it.id)}">
    <h3>${esc(it.title)}${gloss}</h3>
${bits.join('\n')}
  </article>`;
  });

  return `
<section id="doctrines" class="doctrines">
  <h2>${esc(t('hDoctrines', 'His own doctrines'))}</h2>
  <p class="section-intro dc-standing">${esc(d.note)}</p>
  <p class="section-intro dc-sources">${esc(d.sourceNote)}</p>
  ${cards.join('\n  ')}
</section>`;
}

module.exports = { getDoctrines, renderDoctrinesSection, renderRing, renderNest, renderChain };
