# Copy Standard

## Language

**U.S. English**, in code comments, UI copy, and documentation authored for this
project.

| Use | Not |
|---|---|
| synchronize, synchronization | synchronise, synchronisation |
| organization | organisation |
| behavior | behaviour |
| color | colour |
| canceled, canceling | cancelled, cancelling |
| labeled, labeling | labelled, labelling |
| honored | honoured |
| prioritize, prioritized | prioritise, prioritised |
| summarize, summarized | summarise, summarised |
| recognize | recognise |
| license (noun and verb) | licence |
| center | centre |
| catalog | catalogue |

`canceled` uses a single `l`, per U.S. convention. This is the one item most
likely to be applied inconsistently, so it is called out explicitly.

## Exceptions

These are **not** rewritten:

- **Quoted source material.** Text quoted from a source keeps the source's
  spelling. Changing a quotation is a fabrication, which this product exists to
  prevent.
- **Proper nouns and identifiers.** `Reykjavík`, product names, API field names,
  and third-party terms keep their real spelling.
- **The canonical governance files** listed in `.prettierignore` (`AGENTS.md`,
  the accepted ADRs, and so on). Those are owned by the product owner; a copy
  sweep does not touch them beyond a genuine typo.

## Tone

From `docs/standards/UI_STANDARD.md`:

- Plain language before specialist terminology; explain legal and scientific
  states rather than assuming them.
- Say what a thing is and what to do next. Avoid marketing register.
- Never imply that a feature works when it does not. Preview surfaces say so.
- Never imply that unsaved work was lost when it was only not yet synchronized.

## Status

Adopted in Phase 00 for consistency. Recorded in `docs/build/OPEN_QUESTIONS.md`
as a decision open to owner ratification — a project may prefer a different
house style, and changing it later is cheap while the corpus is small.
