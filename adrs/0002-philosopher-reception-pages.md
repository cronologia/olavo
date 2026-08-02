# ADR-0002 — Per-philosopher reception pages as an in-repo optional renderer

- **Status:** accepted (2026-08-02)
- **Context repo:** `cronologia/olavo`
- **Relates to:** core ADR-0001 (optional data key, byte-identical output when
  absent); this repo's AGENTS.md rule 6 (reception, never philosophy);
  olavo#2 (wave 1); cronologia/archive#44 (the corpus measurement that picked
  the wave-1 list)

## Context

This project's second layer is one page per philosopher Olavo referenced:
the thinker's own life-and-works timeline (standard public references) plus a
"reception in the COF" section (which lectures engage him, on which dates,
computed from the public community transcription corpus and shipped as
`data/cof-reception.json`).

Two ways to build it were considered:

1. **Port `fsp`'s country-dossier machinery** (`adopt-template`-style), which
   generates per-entity detail pages from per-entity data files.
2. **A small in-repo module** (`philosophers.js`) that renders the pages,
   reusing the template build's own primitives (`esc`, `renderCites`,
   `seoHead`, `langSwitcher`) passed in as helpers.

   *(Amended 2026-08-02: the data initially lived in a separate
   `data/philosophers.json`; CI's drift test — which re-renders pages from
   the exported `ROUTES`/`renderPage` — exposed that design, and the data
   moved to an optional top-level `philosophers` key on
   `data/chronology.json`, the exact ADR-0001 idiom. `philosophers.js` now
   reads the key off whatever dataset it is given.)*

## Decision

Option 2. fsp's country pages are grown into fsp's heavily-diverged compiler
and carry country-specific machinery (succession tables, seat charts, atlas
tiers) that has no analogue here; porting it would import divergence, not
reuse. The in-repo module keeps `build.js` within three small, clearly-marked
hooks, all gated on the data file's existence:

- The **template contract holds**: without `data/philosophers.json` the build
  is byte-identical to the plain template (verified in CI by the fixture
  tests, which copy `build.js` into template-only fixture dirs — hence the
  guarded `require`).
- Routes join `ROUTES`, so sitemap and hreflang stay complete — the mechanism
  the template itself designates for detail pages.
- The pages go through `localizeData` like all other data, so es/pt
  translations are a dictionary-authoring task, not a code change.

## Rules the renderer enforces

- **Reception, never philosophy** (AGENTS.md rule 6): the reception section's
  standing note says characterizations are Olavo's, tied to a lecture by
  number and date.
- **No invented dates**: an undated transcription file renders a dash with an
  explanatory tooltip — an undated FILE is not an undated lecture. ~332 of
  589 corpus files carry no verified date; the dating defects are documented
  upstream (the archive's dating programme).
- **Every timeline entry cited**; page references are the subset actually
  used, in shared file order. The shipped-data invariants are tested
  (`test/philosophers.test.js`).
