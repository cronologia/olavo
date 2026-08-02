# context.md — domain background for contributors

Read `AGENTS.md` first (operating rules); this file is orientation.

## The subject

**Olavo Luiz Pimentel de Carvalho** (1947–2022): Brazilian journalist,
professional astrologer in the 1980s, self-taught philosopher, and from the
mid-1990s the most influential intellectual polemicist of the Brazilian right.
He wrote for major Brazilian papers, moved to the United States in 2005, and
from 2009 to 2022 taught the **Curso Online de Filosofia (COF)** — 585 weekly
online lectures that formed a generation of students and are the corpus this
chronology's reception layer is keyed to. He was widely described in the press
as the intellectual reference of the Bolsonaro government (2019–2022) — a
characterization he alternately embraced and mocked, and which this project
records only in attributed form. He died in the Richmond, Virginia area in
January 2022.

Why this project exists in the family: several Cronologia projects keep
running into Olavo as a *source* (fsp — his Foro de São Paulo claims;
perennialism — the 2011 Carvalho–Dugin debate; tariqa — his Traditionalist
period). This repo gives those cross-references one documented, dated place to
point at, instead of each project re-explaining him in event notes.

## The three layers

1. **The chronology** (`data/chronology.json` events): his life and works —
   journalism, books with publication dates, the move abroad, the COF, the
   political years, death and the disputes around it. 32 of 37 core event
   dates are verified against external sources; every flag and disagreement
   is visible in the entries.
2. **The reception layer** (SHIPPED: twenty per-philosopher pages, three
   locales): for each philosopher Olavo referenced, a page with the thinker's
   own cited timeline plus "Reception in the COF" — which lectures engage
   him, on which dates, from `data/cof-reception.json` (computed from the
   public community transcription corpus). Quotations wait on audio
   verification (olavo#2); design in ADR-0002.
3. **The self-testimony layer** (ADR-0003): what Olavo said about his own
   life during the lectures — 397 first-person recollections indexed with
   the source material, surfaced into the chronology as paraphrase with
   lecture-date attribution: the childhood-illness origin story, the
   journalism start, the Escola Júpiter and tariqa self-chronologies, the
   Padre Paulo Ricardo confessor arc. Testimony is a perspective: it colors
   the chronology, it never verifies it.

## Disambiguations that matter

- **Olavo ≠ the movement.** The "olavistas"/Brazilian New Right ecosystem
  (channels, courses, politicians claiming his mantle) is a distinct,
  largely living-persons subject — deliberately OUT of scope here (see the
  candidate ticket for it on the hub). Events here involve the ecosystem only
  where Olavo himself acts or speaks.
- **The COF ≠ his books.** Lecture statements are oral, often improvised, and
  transcribed by a community project of varying quality; his books are edited
  texts. Cite accordingly (the transcription mirrors label review status).
- **Astrologer and philosopher are phases of one biography**, not rival
  identities to be adjudicated. Both are documented; his own retrospective
  framings of the astrology years are attributed and dated.
- **"Philosopher" is itself contested** — Brazilian academic philosophy
  largely denied him the title; his students insist on it. The site calls him
  what sources call him, attributed, and uses neutral descriptors in its own
  voice.

## Adjacent Cronologia projects

- `fsp` — Foro de São Paulo (his best-known political claim-set; he popularized
  the Forum's significance from 2001 on).
- `perennialism` / `tariqa` — the Traditionalist school and the Maryamiyya:
  his 1980s Islamic period and his later readings of Guénon/Schuon.
- Candidate (hub): Dugin & Eurasianism — the 2011 debate is the genealogical
  hinge.
- Candidate (hub): the Brazilian New Right — the ecosystem around him
  (high sensitivity, separate decision).

## Glossary

Use `[[term-id]]` markers for shared terms; run
`node scripts/sync-glossary-terms.js` if a needed term id is missing from the
pinned list.
