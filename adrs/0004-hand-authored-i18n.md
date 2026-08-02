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

## Consequences

- es covers the full dataset; pt covers the philosopher layer fully and
  falls back to English on the chronology prose (an accepted, visible gap —
  extending pt is data work, not code work).
- Translation review is part of data review: a PR that edits an English
  prose string and leaves its translations untouched is incomplete.
