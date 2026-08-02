# KEYWORDS.md — finding aid for searching sources about this subject

Naming variants and known search traps. **Listing a term is not asserting
it** (sourcing-rules): this file exists so the next search doesn't rediscover
these the hard way.

## The subject

- "Olavo de Carvalho", full name "Olavo Luiz Pimentel de Carvalho".
- Early bylines: "Olavo de Carvalho" in Brazilian press from the 1980s;
  astrology-era work also under the same name (no pseudonym found so far).
- English-language sources sometimes render "Olavo de Carvalho" with the
  particle dropped ("Olavo Carvalho"); Spanish press occasionally "Olavo
  del Carvalho" (misspelling).

## Corpus-measurement traps (demonstrated on the COF transcriptions, 2026-08-02)

1. **UTF-8 accent width.** Accented characters are two bytes; a single-char
   wildcard (`S.o`, `Plat.o`, `Arist.teles`) silently matches nothing.
   A naive pass reported "Foro de São Paulo: 0 files" against a true 89.
2. **Substring inflation.** Case-insensitive `Dante` matches
   coman**dante**/man**dante**/abun**dante** — 407 files vs the true
   word-boundary 83. `Marx` without a boundary absorbs marxismo/marxista
   (414 vs 322). Always match word-boundary AND accent-insensitively.

## ASR manglings observed in the COF transcriptions (single-token — full-text
search traps; multiword variants live in `core/tools/cof-entity-aliases.json`)

| Philosopher | Variants seen (occurrences) |
|---|---|
| Frithjof Schuon | Chuon (53), Xuon (5) |
| René Guénon | Genon (26), Ganon (4) |
| Louis Lavelle | Lavel (16), Lavell |
| Eric Voegelin | Voeglin (11), Vogelin, Vegelin, Voguelin |
| Edmund Husserl | Russerl (6) |
| Ortega y Gasset | Gassett (5); multiword "Ortega C"/"Ortega Cela" are in the core alias table |
| Nietzsche | Nietsche (4), Nietzche (2), Nitzsche, Nitsche |
| Roxane (his wife) | Oshane |
| Frithjof Schuon (again) | Chuom |
| Ananda/Rama Coomaraswamy | Comarassame, Comarassoume |

## Terms known to return nothing (checked 2026-08-02)

- "Nitche" for Nietzsche — does not occur in the corpus.
- "Fórum Social Mundial" — 1 file in the whole COF corpus; the World Social
  Forum is essentially absent from the lectures despite the FSP's presence
  (89 files).
