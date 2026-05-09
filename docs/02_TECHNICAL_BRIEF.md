# CLEAR-X Technical Brief

## Problem

Legal and contract AI workflows often rely on text similarity, retrieval, extraction, or summarization. Those are useful, but they do not always answer a stricter question:

> Are two clauses legally equivalent under a declared policy, and if not, what material field changed?

CLEAR-X is a research prototype exploring that narrower problem.

## Core pipeline

```text
clause A + clause B
→ canonicalize each supported clause into a typed legal frame
→ validate frame schema and proof/coverage metadata
→ compare material fields
→ return EQUAL, DIFFERENT, or REJECT
```

## Outputs

- `EQUAL`: both clauses are supported and canonical frames match.
- `DIFFERENT`: both clauses are supported and one or more material fields differ.
- `REJECT`: at least one clause is unsupported, ambiguous, or outside the declared grammar.

## Diff examples

CLEAR-X can represent differences such as:

- target changed from `representative` to `affiliate`;
- survival period changed from `P3Y` to `P5Y`;
- liability cap changed from fixed amount to uncapped;
- governing law changed from New York to California;
- condition added or removed;
- assignment permission changed.

## Design principle

The central rule is rejection-first verification:

```text
supported + same frame -> EQUAL
supported + different frame -> DIFFERENT with structured diffs
unsupported or ambiguous -> REJECT
```

This is intended to reduce false semantic equality. It is not intended to maximize broad recall in the current prototype.

## Current limitations

- Current benchmark material is synthetic.
- Real attorney-labelled clause pairs are needed for strong external claims.
- Some components are prototype-level and should be reviewed before commercial use.
- This is not legal advice and not a replacement for legal review.
