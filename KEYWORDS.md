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

## ASR manglings in the `olavo-video` collection (added 2026-08-03)

The 2002–03 philosophy course produced traps worse than a misspelled name,
because several render as *real words that change the meaning* — and one that
is merely a misspelling still hid the most important passage in the course:

| Actual | Appears in captions as | Why it matters |
|---|---|---|
| **Husserl** | `Russel`, `russer` | Reads as Bertrand Russell. In the Aristotle session the surrounding exchange is about phenomenology, and the same file attaches the name to *The Origin of Geometry* — Husserl's text. Taking the caption at face value would invert his stated 20th-century canon (Lavelle, Husserl, then Zubiri/Voegelin/Lonergan) into its opposite. |
| **Lavelle** | `lavel`, `o lavel` | Cost a real finding. A word-boundary count of the correct spelling returns 1 across the whole 2002 course and reads as a bare name-drop; what is actually there is his twentieth-century canon with Lavelle at its head. Any mention map over this corpus has to be run against the ASR spellings, not the true ones. |
| **estóicos / estóica** (Stoics) | `históricos`, `histórica` | Systematic through the Hellenistic session. Every Stoic claim in that file reads as a claim about "historical philosophy". A search for Stoicism finds nothing; a reader who does not know the substitution mis-attributes the whole passage. |

| **pré-socráticos** | `socráticos` (the prefix is dropped) | Produces sentences that state the exact opposite of what was said. Systematic in the pre-Socratics session, where the distinction between Socratics and pre-Socratics is the whole subject. |

None of the meaning-changing three is detectable by spellcheck: in each case the wrong word is a
valid Portuguese word in context, and in the third the sentence stays
grammatical while reversing its meaning. Verify against audio before quoting
anything from these passages.

### Cited authors in the `forum-da-liberdade` series (added 2026-08-04)

These captions were auto-generated from 2000s conference audio and mangle
*attributions* rather than terms. The failure mode is different and worse: the
claim survives intact and only the person it is credited to is destroyed, so
nothing reads as broken and the entry gets the lineage wrong.

| Actual | Appears in captions as | How it was settled |
|---|---|---|
| **Bertrand de Jouvenel** | `do jogo né`, `Liberal do jogo né` | Zero under his own name in this series. Resolved by searching the phrase attached to him — power integrating upward and destroying the intermediate powers — which returns *Du Pouvoir* in seven COF files under the correct spelling. |
| **Ellsworth Huntington** | `Elsword antigo Tom`, `constante de um tom` | The speaker himself insists it is *not* Samuel Huntington. The COF corpus names *The Mainsprings of Civilization* and makes the same disclaimer, which is what confirms the reading. |
| **Georges Bernanos** | `Jordan Roll joga`, `Jordana nos` | Resolved from the aphorism, not the name: "a democracia não é o contrário da ditadura, é a causa da ditadura" appears twice in COF under `Jorge Bernanlos` / `Jorge Bernanot`. |
| **Reinhold Niebuhr** | `rádio ônibus`, `famoso teólogo rádio ônibus` | *Moral Man and Immoral Society* is discussed under the correct spelling elsewhere in the corpus. |
| **Husserl** | `mundo rosto`, `Edmond Russell`, `o russo` | The same Husserl trap as above, in a third disguise. Found via the aphorism — no embryology of triangles, no trigonometry of lions. |

The method that worked in every case: **search the claim, not the name.** A
mangled name returns nothing and looks like absence; the sentence attached to
it is usually transcribed well enough to find, and once found it carries the
correct spelling somewhere else in the corpus.

## The accent trap runs BOTH ways — corrected 2026-08-03

Earlier guidance here said to write `..` in place of an accented letter, because
a single `.` matches one byte of a two-byte character. **That advice is only
half right, and following it mechanically produces silent zeros of its own.**
Measured on this corpus:

| Engine | `Plat.o` | `Plat..o` |
|---|---|---|
| `LC_ALL=C grep` (byte mode) | 0 | 130 |
| UTF-8 grep, and Python on `str` | 130 | **0** |

The two are exact inverses. Whichever pattern you pick, one of the two common
engines returns zero — and a zero looks like a finding rather than a bug.

**Use literal accented strings** (`Platão`, `Sócrates`, `estóicos`). They work
in both modes. A stem probe is not a safe substitute either: searching `socr`
for Sócrates returns **zero**, because the word carries its accent on the first
syllable — a single-method sweep would have missed the second most-discussed
philosopher in the whole course.

Corollary, learned the same day: **verify every zero before reporting it.** Two
of the false zeros in this project's history were produced by the search, not
by the source. The reliable technique is a **positive control**: pair every
zero with a probe you know should hit. A sweep reporting "PSB: 0" is only
credible alongside "PSDB: 82" from the same corpus and the same method.

## Line-wrapping breaks multiword search — added 2026-08-03

The `olavo-video` transcripts are hard-wrapped mid-phrase, so a two-word name
routinely straddles a newline: `São` ends one line and `Paulo` begins the next.
A naive search for the phrase misses those occurrences silently, and the loss
is invisible because plenty of other occurrences do match.

**Normalise whitespace before matching** anything longer than one word. In the
sweep that caught this, doing so was the difference between a partial tally and
684 confirmed occurrences of the phrase.

The same wrap also defeats spelling enumeration by guesswork. The technique
that worked was inverted: tally every distinct word *preceding* the anchor
token, then read the list. That surfaced **21** transcription spellings of one
organisation's name — more than anyone would have guessed, and the guessed list
had already missed several.

## More zero-producing traps, from the Fórum da Liberdade set (2026-08-03)

- **`gramsci` returns 0 corpus-wide.** He is rendered "Antônio grampo" and
  "Antônio Grande" — and he organises an entire 2002 lecture. A search on the
  correct spelling would have concluded the subject never discusses him.
- **Vilém Flusser** appears under five spellings, none of them correct.
  **Bertrand de Jouvenel** under three.
- **`1964` is transcribed `1904`** — a sixty-year error in a date that matters
  in Brazilian political argument.
- **Two files are entirely lowercase ASR.** Any name extraction that keys on
  capitalisation returns a silent zero across those whole documents while
  appearing to work on the rest of the corpus. Check the casing of a file
  before trusting a capitalisation-based method on it.

## Terms known to return nothing in the `olavo-video` course (2026-08-03)

- **Plotinus / Neoplatonism** — absent from all eight sessions.
- **Scepticism** — announced at the end of Hellenistic part 1 and never
  delivered in part 2.
- **Zeno, Chrysippus, Sextus Empiricus, Pyrrho** — never named, although the
  Stoics are treated at length.
- **Epicurus** — deliberately delegated to his own book *O Jardim das
  Aflições* rather than covered.

These are coverage gaps in the source, not search failures: record them as
such rather than re-running the query.

## Terms known to return nothing (checked 2026-08-02)

- "Nitche" for Nietzsche — does not occur in the corpus.
- "Fórum Social Mundial" — 1 file in the whole COF corpus; the World Social
  Forum is essentially absent from the lectures despite the FSP's presence
  (89 files).

## ASR manglings found by the corpus index (added 2026-08-04)

Found while searching for the story of `O Profeta da Paz`, which returns **zero**
across all 1,006 vaulted transcripts under its own title — the passages call it
only "um livro sobre o Islam" or "um livro sobre a história das origens
islâmicas". The lesson is the one already in this file, in its sharpest form yet:
**search the claim, not the name.**

| Actual | Appears in captions as | Where |
|---|---|---|
| **Al-Azhar** (the Cairo university) | `Universidade de Lázaro` | True Outspeak #49. Reads as a plausible Portuguese institution name, so nothing looks wrong. The correct spelling appears once in the whole COF corpus and nowhere in the video captures. |
| **Bertrand de Jouvenel** | `Juvenel`, `Bertão de Juvenel`, `Bertão da Juvenel`, `do jogo né` | COF (unreviewed files) and the conference captions. The forename becomes a Portuguese augmentative. |
| **Ibn Khaldun** | `Eben Khaldun`, `Ibun Kaldun`, `Weven Caldono` | COF unreviewed files; one file spells it both correctly and as `Weven Caldono`. |
| **Idries Shah** | `Higde Schach` | The lecture where he disowns the Muhammad book for having used Shah as a source. |
| **Maomé** (in the book's title) | `Profeta Malmé` | The same lecture. |
| **Michel Veber** | (correct) | Not a mangling — recorded because he credits "the sense of eternity" to Veber, and a reader who assumes the term is his own will mis-attribute the doctrine. |

`tools/corpus-index.py` in the archive expands queries using this table
automatically. It is lexical, so it closes the *variant* half of the problem and
not the *paraphrase* half: no expansion turns "O Profeta da Paz" into "um livro
sobre o Islam".

## René Girard — a name that is NOT mangled, and the traps around it (checked 2026-08-05)

Recorded in prose deliberately. `corpus-index.py` turns every two-column
markdown-table row in this file into a query expansion, and each of the
candidate manglings below is a **false friend**: putting them in a table would
inject them into every future Girard search and manufacture hits.

Word-boundary, accent-insensitive over the 589 COF transcription files:

- **`Girard` — 12 files, 28 hits.** COF014 (8), COF018 (6), COF036 (4),
  COF094 (2), then COF033, COF035, COF037, COF163, COF242, COF243, COF507,
  COF532 with one each. The ASR spells him correctly; he is not a
  Jouvenel case.
- **Ruled out, in context, one by one:** `Girar` (15 files) is the Portuguese
  verb; `Gerard` (17 files) resolves to Gerardo Mello Mourão, Gerardo de
  Cremona and a "Zé Gerard Vieira", never to René; `Renegado` (3 files) is the
  ordinary word. `Girards`, `Jirar` and `Renê girado` return nothing at all.
- **The claim carries further than the name**, as usual. `desejo mimético`
  6 files / 30 hits — COF036 alone has 17 against 4 occurrences of the name in
  the same file; `mimético` 9 files / 36 hits; `mimética` 5 files;
  `bode expiatório` 15 files / 22 hits. Any count of Girard's presence built on
  the surname alone understates it.
- **Phrases that return zero**, and are therefore not search routes here:
  `violência e o sagrado` (the book title as a phrase), `vítima expiatória`,
  `mecanismo vitimário`. The corpus discusses the ideas without using the
  Portuguese book title, and `bode expiatório` is the term it actually uses.
- One incidental finding worth keeping: COF014 (11 July 2009) has a student
  stating that "a editora Vozes reeditou Coisas Ocultas desde a Fundação do
  Mundo". Brazilian catalogue records point to Paz e Terra for that title, not
  Vozes; the claim is a lead, from a reviewed file, and is not asserted
  anywhere in this dataset.
