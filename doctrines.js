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
function renderRing(names, esc) {
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
      <text class="dc-ring-mid" x="${cx}" y="${cy - 4}">doze camadas</text>
      <text class="dc-ring-sub" x="${cx}" y="${cy + 14}">simultâneas</text>
    </svg>
    <ol class="dc-legend">
${legend}
    </ol>
  </div>`;
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

function renderExpositions(list, esc) {
  if (!Array.isArray(list) || !list.length) return '';
  const rows = list.map((e) => {
    const flag = e.dateVerified
      ? '<span class="dc-ok" title="date verified against the corpus index">✓</span>'
      : '<span class="flag" title="date not verified">?</span>';
    return `<li>${esc(e.where)} — <span class="dc-date">${esc(e.date)}</span> ${flag}</li>`;
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

    if (Array.isArray(it.structure) && it.structure.length === 12) {
      bits.push(renderRing(it.structure, esc));
    } else if (Array.isArray(it.structure) && it.structure.length) {
      bits.push(renderNest(it.structure, esc, 'o Eu eterno — o fundamento, não um quinto termo'));
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

    return `<article class="dc-card" id="${esc(it.id)}">
    <h3>${esc(it.name)}</h3>
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

module.exports = { getDoctrines, renderDoctrinesSection, renderRing, renderNest };
