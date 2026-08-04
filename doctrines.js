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
 * Inline SVG, theme-aware through currentColor, no dependencies. The dataset
 * NAMES the shape (`diagram`) rather than the code inferring it, because in
 * this panel a shape is an argument and not a layout choice.
 *
 * The pair that makes the rule concrete: the twelve layers are a RING, because
 * he explicitly repudiated the developmental reading and said all twelve press
 * at once — a staircase would encode the interpretation he corrected. The
 * landings of philosophy are a STAIRCASE, because there the whole claim is
 * that you may not reason below one. Same file, opposite shapes, and getting
 * them the wrong way round would misstate both.
 *
 *   ring      N equal segments, simultaneous, no order
 *   chain     ordered, each stage presupposing the last, on a rising axis
 *   steps     ordered and irreversible — no going below a landing
 *   triad     three coordinate rivals, mutually engaged, unordered
 *   triad-one three inseparable aspects of ONE act (hub label)
 *   set       a closed list of kinds, no order, NO relation between them
 *   nest      containment: outer functions around an inner substance
 *   strata    layers over a foundation the others rest on
 *   cycle     a closed loop that repeats — the shape says "again"
 *   parallax  two axes that should coincide and do not; the gap is the point
 *   halo      a core and the band of what surrounds it
 *   contrast  "not this, but that" — two readings, one struck through
 *   inversions  pairs flipped end for end
 *   selfloop  something resting on what it is trying to destroy
 *
 * One doctrine deliberately has NO diagram. See `contraditoria-ambigua`: no
 * developed statement of it survives, so any shape would be invention.
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
    ${ARROW_DEF}
${nodes.join('\n')}
    <line class="dc-chain-axis" x1="20" y1="108" x2="${W - 20}" y2="108" marker-end="url(#dc-arrow)" />
    <text class="dc-chain-axis-label" x="20" y="124">${esc(lo)}</text>
    <text class="dc-chain-axis-label dc-chain-axis-end" x="${W - 20}" y="124">${esc(hi)}</text>
  </svg>`;
}

/** One arrow marker, shared by every shape that needs one. Defining it inside
 * each SVG is fine — ids are document-scoped and duplicates would collide, so
 * the LAST definition would silently win for all of them. */
const ARROW_DEF = `<defs><marker id="dc-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 8 4 L 0 8 z" /></marker></defs>`;

/** Helpers shared by the shape renderers below. */
const wrapTo = (name, budget) => {
  const lines = [];
  for (const w of String(name).split(' ')) {
    if (lines.length && (lines[lines.length - 1] + ' ' + w).length <= budget) lines[lines.length - 1] += ' ' + w;
    else lines.push(w);
  }
  return lines;
};
const textBlock = (lines, x, yMid, esc, lead = 14, cls = '') =>
  lines.map((l, k) => `        <text${cls ? ` class="${cls}"` : ''} x="${x.toFixed(1)}" y="${(yMid + 4 - ((lines.length - 1) * lead) / 2 + k * lead).toFixed(1)}">${esc(l)}</text>`).join('\n');

/** Stacked layers over a foundation — the last entry is what the rest rest on.
 *
 * Knowledge by presence is the case: perception, memory and theory are laid
 * over something PRIOR to all of them. Order matters here and the base is not
 * merely the bottom item, so it is drawn wider and set apart.
 */
function renderStrata(names, esc) {
  const W = 520, h = 46, gap = 8;
  const rows = names.map((name, i) => {
    const base = i === names.length - 1;
    const inset = base ? 10 : 34;
    const y = 12 + i * (h + gap);
    return `      <g class="dc-strata-row${base ? ' dc-strata-base' : ''}">
        <rect x="${inset}" y="${y}" width="${W - inset * 2}" height="${h}" rx="7" />
${textBlock(wrapTo(name, 46), W / 2, y + h / 2, esc)}
      </g>`;
  });
  return `<svg class="dc-strata" viewBox="0 0 ${W} ${12 + names.length * (h + gap)}" role="img"
     aria-label="${esc(names.join('; then, beneath all of them: ').replace(/; then, beneath all of them: (?=[^;]*$)/, '; and beneath all of them: '))}">
${rows.join('\n')}
  </svg>`;
}

/** A closed loop: the shape says "and then it happens again".
 *
 * Empire — one falls, someone builds the next — and the collective imbecile,
 * where each party makes the others stupider and is made stupider in turn.
 * Deliberately not a chain: a chain ends.
 */
function renderCycle(names, esc) {
  const cx = 250, cy = 150, r = 100, n = names.length;
  const nodes = names.map((name, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    return `      <g class="dc-cycle-node">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="46" />
${textBlock(wrapTo(name, 13), x, y, esc, 13)}
      </g>`;
  });
  const arcs = names.map((_, i) => {
    const a0 = -Math.PI / 2 + (2 * Math.PI * i) / n + 0.42;
    const a1 = -Math.PI / 2 + (2 * Math.PI * (i + 1)) / n - 0.42;
    const R = r;
    const p = (a) => `${(cx + R * Math.cos(a)).toFixed(1)} ${(cy + R * Math.sin(a)).toFixed(1)}`;
    return `      <path class="dc-cycle-arc" d="M ${p(a0)} A ${R} ${R} 0 0 1 ${p(a1)}" marker-end="url(#dc-arrow)" />`;
  });
  return `<svg class="dc-cycle" viewBox="0 0 500 300" role="img"
     aria-label="${esc(names.join(' → ') + ' → ' + names[0])}">
    ${ARROW_DEF}
${arcs.join('\n')}
${nodes.join('\n')}
  </svg>`;
}

/** Two axes that ought to coincide and do not. The GAP is the doctrine.
 *
 * Cognitive parallax: the line a thinker's life actually runs along, and the
 * line his theory draws. Drawing them as a list of two would lose the only
 * thing the concept asserts, which is the displacement between them.
 */
function renderParallax(names, esc, t) {
  const W = 540, H = 170;
  const ax = [{ y: 44, x0: 26, x1: 372 }, { y: 104, x0: 96, x1: 442 }];
  const rows = names.slice(0, 2).map((name, i) => `      <g class="dc-px-axis">
        <line x1="${ax[i].x0}" y1="${ax[i].y}" x2="${ax[i].x1}" y2="${ax[i].y}" marker-end="url(#dc-arrow)" />
${textBlock(wrapTo(name, 44), (ax[i].x0 + ax[i].x1) / 2, ax[i].y - 16, esc, 13, 'dc-px-label')}
      </g>`);
  const gap = t('dcPxGap', 'displaced, and the gap is the defect');
  return `<svg class="dc-parallax" viewBox="0 0 ${W} ${H}" role="img"
     aria-label="${esc(names.join(' / ') + ' — ' + gap)}">
    ${ARROW_DEF}
${rows.join('\n')}
      <line class="dc-px-gap" x1="${ax[0].x1}" y1="${ax[0].y}" x2="${ax[1].x1}" y2="${ax[1].y}" />
      <text class="dc-px-gaplabel" x="${(ax[0].x1 + ax[1].x1) / 2}" y="${H - 16}">${esc(gap)}</text>
  </svg>`;
}

/** A core and the band around it — what is actual, and what surrounds it.
 *
 * The circle of latency (what is not actual but could become so) and the
 * horizon of consciousness (what falls inside what a mind can take in). The
 * band is dashed because in both doctrines the boundary is real but not a
 * wall: it moves, and it is the thing under discussion.
 */
function renderHalo(names, esc) {
  const cx = 250, cy = 146, H = 320;
  const core = names[0], band = names[1] || '';
  return `<svg class="dc-halo" viewBox="0 0 500 ${H}" role="img"
     aria-label="${esc(core + (band ? ` — ${band}` : ''))}">
      <circle class="dc-halo-band" cx="${cx}" cy="${cy}" r="122" />
      <circle class="dc-halo-core" cx="${cx}" cy="${cy}" r="62" />
${textBlock(wrapTo(core, 14), cx, cy, esc, 14, 'dc-halo-corelabel')}
${band ? textBlock(wrapTo(band, 44), cx, H - 26, esc, 14, 'dc-halo-bandlabel') : ''}
  </svg>`;
}

/** "Not this, but that." Two readings, the rejected one struck through.
 *
 * Several doctrines are stated as corrections of a default: law is guarantee
 * and NOT command; philosophy begins from an honest account of your own state
 * and NOT from a position adopted for argument. A neutral pair of boxes would
 * drop the negation, which is the whole assertion.
 */
function renderContrast(names, esc) {
  const W = 540, boxW = 232, h = 76;
  const cells = names.slice(0, 2).map((name, i) => {
    const x = i === 0 ? 20 : W - 20 - boxW;
    const cls = i === 0 ? ' dc-contrast-no' : ' dc-contrast-yes';
    return `      <g class="dc-contrast-cell${cls}">
        <rect x="${x}" y="16" width="${boxW}" height="${h}" rx="8" />
${textBlock(wrapTo(name, 26), x + boxW / 2, 16 + h / 2, esc, 15)}
${i === 0 ? `        <line class="dc-contrast-strike" x1="${x + 14}" y1="${16 + h / 2}" x2="${x + boxW - 14}" y2="${16 + h / 2}" />` : ''}
      </g>`;
  });
  return `<svg class="dc-contrast" viewBox="0 0 ${W} ${16 + h + 16}" role="img"
     aria-label="${esc(`not ${names[0]}, but ${names[1] || ''}`)}">
${cells.join('\n')}
      <path class="dc-contrast-arrow" d="M ${20 + boxW + 12} ${16 + h / 2} L ${W - 20 - boxW - 12} ${16 + h / 2}" marker-end="url(#dc-arrow)" />
    ${ARROW_DEF}
  </svg>`;
}

/** Pairs flipped end for end. The doctrine IS the reversal.
 *
 * The revolutionary mentality's three inversions: time, the subject-object
 * relation, moral responsibility. Each `structure` entry is "A|B", drawn as
 * A → B struck out above B → A.
 */
function renderInversions(names, esc, t) {
  const W = 540, rowH = 62;
  const rows = names.map((pair, i) => {
    const [a, b] = String(pair).split('|');
    const y = 24 + i * rowH;
    return `      <g class="dc-inv-row">
        <text class="dc-inv-normal" x="24" y="${y}">${esc(a || '')} → ${esc(b || '')}</text>
        <line class="dc-inv-strike" x1="20" y1="${y - 5}" x2="${W / 2 - 30}" y2="${y - 5}" />
        <text class="dc-inv-arrow" x="${W / 2 - 10}" y="${y}">⇒</text>
        <text class="dc-inv-flipped" x="${W / 2 + 16}" y="${y}">${esc(b || '')} → ${esc(a || '')}</text>
      </g>`;
  });
  return `<svg class="dc-inversions" viewBox="0 0 ${W} ${24 + names.length * rowH}" role="img"
     aria-label="${esc(t('dcInvAlt', 'Three inversions, each reversing a relation'))}">
${rows.join('\n')}
  </svg>`;
}

/** A rising staircase — and here, unlike the twelve layers, that IS the claim.
 *
 * A landing is something that, once seen, may not be reasoned below. The
 * irreversibility is the doctrine, so the steps rise and a barred arrow marks
 * the descent he says nobody has the right to make.
 */
function renderSteps(names, esc, t) {
  const W = 540, n = names.length, stepW = (W - 60) / n, stepH = 34;
  const H = 40 + n * stepH;
  const cells = names.map((name, i) => {
    const x = 30 + i * stepW;
    const y = H - 24 - (i + 1) * stepH;
    return `      <g class="dc-steps-cell">
        <rect x="${x.toFixed(1)}" y="${y}" width="${stepW.toFixed(1)}" height="${stepH}" />
${textBlock(wrapTo(name, 18), x + stepW / 2, y + stepH / 2, esc, 12, 'dc-steps-label')}
      </g>`;
  });
  return `<svg class="dc-steps" viewBox="0 0 ${W} ${H}" role="img"
     aria-label="${esc(names.join(' · ') + ' — ' + t('dcStepsNote', 'no reasoning below a landing once reached'))}">
${cells.join('\n')}
      <text class="dc-steps-note" x="30" y="${H - 6}">${esc(t('dcStepsNote', 'no reasoning below a landing once reached'))}</text>
  </svg>`;
}

/** Something standing on the very thing it is trying to pull down.
 *
 * Existential contradiction. A base, a figure on it, and an arrow from the
 * figure curving back into the base — the attack that presupposes its target.
 */
function renderSelfloop(names, esc) {
  const W = 460;
  const top = names[0] || '', base = names[1] || '';
  return `<svg class="dc-selfloop" viewBox="0 0 ${W} 200" role="img" aria-label="${esc(`${top} — ${base}`)}">
    ${ARROW_DEF}
      <rect class="dc-selfloop-base" x="70" y="128" width="320" height="48" rx="8" />
${textBlock(wrapTo(base, 40), 230, 152, esc, 14, 'dc-selfloop-baselabel')}
      <rect class="dc-selfloop-top" x="130" y="24" width="200" height="52" rx="8" />
${textBlock(wrapTo(top, 26), 230, 50, esc, 14, 'dc-selfloop-toplabel')}
      <path class="dc-selfloop-arc" d="M 330 50 C 420 50 424 150 352 150" marker-end="url(#dc-arrow)" />
  </svg>`;
}

/** A grid of coordinate members — a SET, with no order and no connections.
 *
 * The subject-of-history taxonomy is a closed list of kinds of agent: there is
 * no first, no ranking, and crucially no relation asserted between them. A row
 * would read as a sequence even without arrows, and joining them as the triad
 * does would claim an engagement he never describes. A grid with nothing
 * between the cells says only what he says — these are the kinds, and there
 * are no others.
 */
function renderSet(names, esc) {
  const cols = names.length > 3 ? 2 : 1;
  const W = 520, gap = 14, boxW = (W - 40 - gap * (cols - 1)) / cols, boxH = 62;
  const rows = Math.ceil(names.length / cols);
  const cells = names.map((name, i) => {
    const x = 20 + (i % cols) * (boxW + gap);
    const y = 14 + Math.floor(i / cols) * (boxH + gap);
    const words = name.split(' ');
    const lines = [];
    for (const w of words) {
      if (lines.length && (lines[lines.length - 1] + ' ' + w).length <= 30) lines[lines.length - 1] += ' ' + w;
      else lines.push(w);
    }
    const dy = boxH / 2 + 4 - ((lines.length - 1) * 15) / 2;
    return `      <g class="dc-set-cell">
        <rect x="${x.toFixed(1)}" y="${y}" width="${boxW.toFixed(1)}" height="${boxH}" rx="8" />
${lines.map((l, k) => `        <text x="${(x + boxW / 2).toFixed(1)}" y="${(y + dy + k * 15).toFixed(1)}">${esc(l)}</text>`).join('\n')}
      </g>`;
  });
  const H = 14 + rows * (boxH + gap);
  return `<svg class="dc-set" viewBox="0 0 ${W} ${H}" role="img"
     aria-label="${esc(names.join('; '))}">
${cells.join('\n')}
  </svg>`;
}

/** Three nodes on a triangle, mutually joined — no first, no last.
 *
 * Two doctrines need this shape and would be misrepresented by any other. The
 * three projects of global domination are RIVALS of comparable weight that he
 * says sometimes ally and sometimes fight; ordering or stacking them would
 * assert a hierarchy, and a winner, that he explicitly says nobody can call.
 * The triple intuition is the opposite case — not three things at all, but one
 * act with three inseparable aspects — so when a hub label is supplied the
 * centre carries it and the edges read as internal rather than as rivalry.
 *
 * Undirected edges in both readings: mutual, not sequential. Sequence lives in
 * the chain, and giving it to either of these would be the same category error
 * a staircase would be for the twelve layers.
 */
function renderTriad(names, esc, t, hubLabel) {
  const cx = 230, cy = 148, r = 92;
  const pos = names.map((_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / names.length;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  const edges = [];
  for (let i = 0; i < pos.length; i++) {
    for (let j = i + 1; j < pos.length; j++) {
      edges.push(`      <line class="dc-triad-edge" x1="${pos[i].x.toFixed(1)}" y1="${pos[i].y.toFixed(1)}" x2="${pos[j].x.toFixed(1)}" y2="${pos[j].y.toFixed(1)}" />`);
    }
  }
  const R = 50;
  const nodes = names.map((name, i) => {
    const { x, y } = pos[i];
    // Greedy wrap to a character budget rather than splitting the word list in
    // half: "The conditions of the act" halves into "The conditions" / "of the
    // act", and the first line runs straight out of the disc. Three lines are
    // allowed, and the type drops a step when a label needs them.
    const lines = [];
    for (const w of name.split(' ')) {
      if (lines.length && (lines[lines.length - 1] + ' ' + w).length <= 12) lines[lines.length - 1] += ' ' + w;
      else lines.push(w);
    }
    const lead = lines.length > 2 ? 12 : 13;
    const dy = 4 - ((lines.length - 1) * lead) / 2;
    const cls = lines.length > 2 ? ' dc-triad-tight' : '';
    return `      <g class="dc-triad-node${cls}">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${R}" />
${lines.map((l, k) => `        <text x="${x.toFixed(1)}" y="${(y + dy + k * lead).toFixed(1)}">${esc(l)}</text>`).join('\n')}
      </g>`;
  });
  // The hub sits on the centroid, which is also where the three edges cross —
  // so it needs a disc behind it or an edge runs through the words.
  const hub = hubLabel
    ? `      <circle class="dc-triad-hubdot" cx="${cx}" cy="${cy}" r="30" />
      <text class="dc-triad-hub" x="${cx}" y="${cy + 4}">${esc(hubLabel)}</text>`
    : '';
  const alt = hubLabel
    ? `${t('dcTriadOneAlt', 'One act with three inseparable aspects')}: ${names.join('; ')}`
    : `${t('dcTriadAlt', 'Three rivals of comparable weight, mutually engaged, in no order')}: ${names.join('; ')}`;
  return `<svg class="dc-triad" viewBox="0 0 460 296" role="img" aria-label="${esc(alt)}">
${edges.join('\n')}
${hub}
${nodes.join('\n')}
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
      else if (kind === 'set') bits.push(renderSet(it.structure, esc));
      else if (kind === 'strata') bits.push(renderStrata(it.structure, esc));
      else if (kind === 'cycle') bits.push(renderCycle(it.structure, esc));
      else if (kind === 'parallax') bits.push(renderParallax(it.structure, esc, t));
      else if (kind === 'halo') bits.push(renderHalo(it.structure, esc));
      else if (kind === 'contrast') bits.push(renderContrast(it.structure, esc));
      else if (kind === 'inversions') bits.push(renderInversions(it.structure, esc, t));
      else if (kind === 'steps') bits.push(renderSteps(it.structure, esc, t));
      else if (kind === 'selfloop') bits.push(renderSelfloop(it.structure, esc));
      else if (kind === 'triad') bits.push(renderTriad(it.structure, esc, t, null));
      else if (kind === 'triad-one') bits.push(renderTriad(it.structure, esc, t, t('dcTriadOne', 'one act')));
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

module.exports = { getDoctrines, renderDoctrinesSection, renderRing, renderNest, renderChain, renderTriad, renderSet, renderStrata, renderCycle,
  renderParallax, renderHalo, renderContrast, renderInversions, renderSteps, renderSelfloop };
