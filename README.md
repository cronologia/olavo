# Cronologia — Olavo de Carvalho

An open, source-referenced chronology of **Olavo de Carvalho (1947–2022)**:
journalist, astrologer, self-taught philosopher, teacher of the Curso Online
de Filosofia (COF, 2009–2022), and the central intellectual reference of the
Brazilian New Right — plus a reception layer mapping the philosophers he
referenced to the dated lectures that engage them.

**Site:** <https://cronologia.github.io/olavo/> · part of the
[Cronologia](https://cronologia.github.io/) project family.

## Method

- `data/chronology.json` is the single source of truth; every fact and event
  carries `sources[]`; contested characterizations are attributed to their
  authors, never asserted in the site's own voice. See `AGENTS.md` for the
  subject-specific rules (influence claims, the COF citation discipline, the
  contested phases) and `context.md` for orientation.
- The build is a zero-dependency Node compiler from
  [cronologia/core](https://github.com/cronologia/core)'s template:
  `node scripts/validate-data.js && node --test && node build.js`.
- English is authoritative; `es`/`pt` are pre-authored machine-translation
  caches with a visible disclaimer.

## Status

Bootstrapped and built out 2026-08-02 (hub ticket: cronologia.github.io#30).
Live: the chronology (39 events, 32 external-source-verified dates), all
**twenty philosopher reception pages** in three locales (en authoritative;
es/pt hand-translated, ADR-0004), Wayback fallbacks on the references, and
the **self-testimony layer** — Olavo's own in-lecture accounts of his life,
surfaced as attributed paraphrase (ADR-0003; findings in olavo#3). Open:
verbatim quotations (blocked on audio verification, olavo#2) and the
remaining flagged dates (olavo#1).
