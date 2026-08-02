# ADR-0003 — Attributed self-testimony from the COF corpus

- **Status:** accepted (2026-08-02)
- **Context repo:** `cronologia/olavo`
- **Relates to:** AGENTS.md rule 7; olavo#3 (the testimony sweep's findings);
  olavo#1 (verification epic — testimony informs it, never resolves it);
  olavo#2 (the quotation blocker); `sourcing-rules` #5 (testimony is a
  perspective, not a fact source)

## Context

Olavo talked about his own life constantly across the 585 lectures: his
childhood illness, his start in journalism, the astrology school, the
communist youth, the tariqa period, his confessor, his health. A systematic
sweep (trigger patterns → 737 candidate windows → parallel readers → 397
first-person recollections kept, snippets verified against the files)
produced an index of this testimony, held with the source corpus material.

That testimony is biographically rich and often the ONLY dated first-person
account of an episode — and it is doubly filtered: retrospective memory
decades after the events (self-mythology included), rendered by community
transcriptions never checked against audio, whose ASR garbles even the names
of his wife and his sheikh.

## Decision

Self-testimony enters `data/chronology.json` under four rules:

1. **Paraphrase, never verbatim.** The corpus's own rule (quotes must be
   verified against audio) blocks quotation; the dataset paraphrases and
   cites the lecture by date ("his own telling in the course: …", "lecture
   of 13 November 2010"). The `cof-transcriptions` reference carries the
   sourcing.
2. **Testimony never verifies.** It never flips a `dateVerified` flag and
   never overrides an external source. Where it converges with external
   sources (journalism at 17; the tariqa window around Calil's 1984), the
   convergence is stated; where it is the only account (the childhood
   illness), the event says so explicitly ("recorded here as testimony, not
   as a medical record").
3. **Framing is mandatory.** Every self-testimony passage names its nature:
   "his own telling", "per the community transcriptions". A reader must
   never mistake the layer for documentary record.
4. **Sensitive single-source recollections about third parties stay out**
   until corroborated — held in the testimony index only, with the decision
   recorded there.

## Consequences

- The chronology gained a testimony dimension no external source provides
  (the childhood-illness origin story; the confessor statement of
  2010-10-30) while the verification ledger (32/37 dates verified) remains
  exclusively external.
- Any future audio-verification pass (olavo#2) can promote indexed passages
  to quotations; nothing in the dataset needs restructuring for that.
