# ADR-0005 — Reviewing the transcripts against the doctrines panel

- **Status:** accepted (2026-08-04)
- **Context repo:** `cronologia/olavo`
- **Relates to:** `adrs/0003-self-testimony-layer.md` (what may be drawn from
  his own words at all); `adrs/0004-hand-authored-i18n.md` (every entry lands
  with its translations); olavo#20 (the sweep this codifies)

## Context

The doctrines panel is not finished and cannot be. It is derived from ~1,000
transcript files — 585 course lectures plus 237 video captures — that no one
has read end to end, and its entries were written from targeted searches. Three
things follow, and all three have already happened:

1. **Doctrines are missing.** The panel shipped with eight entries. A single
   self-attribution sweep found nine more, then three more after that. He says
   himself that his list of discoveries runs to about twenty.
2. **Entries are wrong in ways only the corpus can settle.** The Empire entry
   said *O Jardim das Aflições* IS the empire history; he says a great part of
   it is. The cognitive-parallax entry credited a 2010 lecture for the Marx
   case; he had already given it in the 1995 book.
3. **Entries are thin where the doctrine is rich.** The subject-of-history
   entry named two examples and missed both the closed taxonomy of four agents
   and dynasties, the kind that carries the most weight in his politics.

Each of those was found by someone pointing at the page and saying *that isn't
right* — not by a check. There is no test that can find them, because the
question is always "does this match what the corpus says", and the corpus is
7.1 million words.

So the review is a recurring editorial pass, and it needs a written procedure
rather than a habit, or it will be done differently every time and its results
will not be comparable.

## Decision

**A doctrine review is a defined pass over the vaulted transcripts whose output
is dataset changes, not notes.** It may be triggered by a reader's objection, a
new capture landing in the vault, or a scheduled sweep. It runs as follows.

### 1. Search both corpora, and prove the search worked

The COF corpus is `.md`; the video corpora are `.txt`. A pass that globs one
extension silently covers half the material — this exact mistake reported
**zero** hits for a phrase that has twenty-five.

- Normalise whitespace before matching. The transcripts are hard-wrapped, so a
  multiword phrase is routinely split across a line break.
- Accented strings are matched **literally**. A dot wildcard for an accented
  letter returns zero in a Unicode engine, which is the exact inverse of byte
  mode.
- **Pair every zero with a positive control.** A zero is a claim about the
  corpus and has to be earned.

### 2. Find what he claims as his

The productive queries are self-attribution, not topic:

    minha teoria d[eoa] · a minha famosa teoria · minha tese d[eoa]
    fui eu que descobri · minhas descobertas · o que eu chamo · eu cheguei à conclusão

Listeners' letters and students' questions are a second channel and a better
one for uptake: they show which coinages were actually used by other people as
categories. That is what promoted *o imbecil juvenil* from a sub-clause to an
entry of its own.

### 3. Decide what the finding does to the panel

Every finding resolves into exactly one of these, and the choice is recorded in
the commit message:

- **NEW ENTRY** — he names it as his own and there is a statement of it.
- **CORRECTION** — an existing entry says something the corpus contradicts.
  Corrections are made in the entry, and the commit says what was wrong.
- **DEEPENING** — the entry is true but thin. Add the structure, the origin,
  the lineage, the caveat.
- **REVISION LINE** — he changed his position. It goes in `revision` or
  `countNote` as its own line and the earlier version stays. Never smoothed
  into one authoritative statement.
- **NOTHING** — the passage is topical, not doctrinal. Most are.

### 4. Hold the sourcing discipline that already applies

- **Paraphrase only.** The COF transcriptions have not been checked against
  audio (ADR-0003). Nothing on the page is quoted from them, however quotable.
  Where a transcript quotes a *published* work, cite the publication.
- **Exposition, not endorsement.** Every entry states a claim of his. Where the
  corpus contradicts the popular version, the entry says so.
- **Dates are honest.** `date` for machine-readable values, `dateNote` for
  prose about the dating, `dateVerified` set from the corpus index and never by
  hand. Roughly a third of the corpus carries no header date at all; entries
  drawn from it say `undated in the corpus` rather than guessing.
- **The vault is never named** in a public-facing field.

### 5. The diagram is part of the claim

If the doctrine has a structure, the dataset **names the shape** (`diagram`)
and the renderer draws it. The shape is an argument:

- the twelve layers are a RING because he repudiated the developmental reading;
- the landings are a STAIRCASE because there the whole claim is that you may
  not reason below one;
- the three global projects are an unordered TRIAD because he says nobody can
  say which will win;
- the four historical agents are a SET with no connectors because he asserts no
  relation between them.

Inferring the shape from the data's shape — the rule this panel started with —
lets a new entry silently acquire an argument nobody made.

**A doctrine with no located structure gets no diagram**, and the entry says
why. See `contraditoria-ambigua`: no developed statement survives, so any shape
would be invention.

### 6. Land it complete

`node scripts/validate-data.js && node --test && node build.js`, with es/pt
authored in the same commit and stale keys pruned — the completeness test will
fail otherwise, which is the point. **Then look at the rendered page.** Every
diagram defect this panel has had was invisible to the tests: black fills from
a missing `fill`, a wash that contradicted its own axis, a label running off
the viewBox because SVG text defaults to `text-anchor: start`.

## Consequences

- The panel is explicitly a work in progress, and the section note says so. An
  entry's absence is not evidence he had no such doctrine.
- Review findings are cheap to file and expensive to forget, so unresolved ones
  become issues with their anchors (olavo#20 is the model), not TODO comments.
- The corpus's own gaps propagate honestly: a third of it is undated, one COF
  lecture is truncated, and nine True Outspeak episodes are absent. Entries
  resting on those say so.
- This procedure will keep producing corrections to entries written under it.
  That is the expected state, not a failure of the earlier pass.
