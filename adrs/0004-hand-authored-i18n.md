# ADR-0004 — Hand-authored es/pt caches, exact-key discipline

- **Status:** accepted (2026-08-02)
- **Context repo:** `cronologia/olavo`
- **Relates to:** `adrs/0001-multilingual.md` (the template's i18n
  architecture, unchanged); core#9 (family multilingual epic); olavo#1
  (the i18n ops item)

## Context

The template treats `data/i18n/{es,pt}.json` as machine-translation caches
("do NOT hand-edit") with a visible MT disclaimer. This repo's translations
were instead authored by hand: pt paired with the English at authoring time
(the philosopher timelines were researched in Portuguese and the English
authored against them), es written as a dedicated pass over the full
dataset. The MT disclaimer had become factually false.

## Decision

1. **The caches are hand-authored and hand-maintained.** They are edited
   directly and committed together with the data they translate;
   `scripts/translate.js` is not used. The page disclaimer reads
   "hand-reviewed translation; English is the reference version".
2. **Exact-key discipline.** The localization walk matches exact strings, so
   the dictionaries may contain ONLY keys that are exact dataset values.
   Non-exact keys are dead weight that can also poison tests (a leftover
   template seed key, `"Founded"`, substring-matched a new event text and
   broke the translation-cache probe). When an English string changes, its
   translations are updated or pruned in the same commit — otherwise the
   locale silently falls back to English, which is a regression, not a
   default.
3. **What is never translated** (unchanged from the template): reference
   titles/publishers, URLs, ids, dates, proper names, and quoted material —
   a quotation ('na noite de 24 de janeiro') stays verbatim in every locale.
4. **A page reads in ONE language.** Terms of art are no exception. The
   doctrines panel first shipped with its titles and its twelve layer names
   left in Portuguese in all three locales, on the reasoning that they were
   the subject's coinages and so behaved like proper names. They do not: the
   English page read "the camada a person occupies from the etapa weighing on
   them", and the owner reported it from the rendered page. The rule that
   replaced it: translate the term, and gloss the original ONCE beside the
   translated title (`originalTerm`, deliberately outside `TRANSLATABLE_KEYS`)
   — not scattered through the prose. A quoted string being searched for in
   the corpus ('eu substancial') is still a quotation and stays verbatim.
5. **Prose does not hide in a data field.** Four exposition dates were prose
   ("undated in the corpus") sitting in the untranslated `date` field, so
   they rendered in English on both localized pages. Machine-readable values
   stay in `date`; prose about the dating goes in `dateNote`, which is
   translated. `test/i18n-completeness.test.js` pins the shape.

## Consequences

- es and pt both cover the full dataset (510+ strings each). The earlier pt
  chronology gap is closed.
- Translation review is part of data review: a PR that edits an English
  prose string and leaves its translations untouched is incomplete.
- **This is enforced, not merely stated.** `test/i18n-completeness.test.js`
  walks the dataset exactly as `localizeData` does and fails on a missing key
  (the locale would render English) or a stale one (the source prose was
  rewritten and its live counterpart is almost certainly untranslated). The
  fallback-to-English behaviour is correct at runtime and silent in review,
  which is why review needed a gate rather than a convention.
- Known remaining gap, deliberately out of scope here: reference
  ANNOTATIONS — the parenthetical stance notes the project writes for each
  source ("mainstream — carries the physician's full clinical statement") —
  ride inside the `references` array, which the walk skips wholesale. They
  are the project's own prose, not bibliographic data, and they render in
  English on the es/pt pages. Splitting them from the citation is tracked
  separately.
