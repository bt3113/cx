# CLEAR-X: Verified Semantic Diff for Contract Clauses

**Originator:** Bhavesh Tekwani / Oractron  
**Status:** Research prototype  

## Summary

CLEAR-X is a prototype for verified semantic comparison of contract clauses. It compares two supported clauses and returns:

- `EQUAL` — the supported clauses reduce to the same canonical legal frame.
- `DIFFERENT` — both clauses are supported, but one or more material legal fields differ.
- `REJECT` — at least one clause is unsupported, ambiguous, or outside the declared grammar.

The system is designed to avoid fuzzy “looks similar” judgments. It uses typed legal frames, deterministic comparison, schema validation, and explicit rejection of unsupported legal residue.

## Why it may matter

Contract review tools often extract clauses, retrieve similar language, or summarize agreements. CLEAR-X focuses on a narrower question:

> Did the legal meaning of this clause change, and exactly which material field changed?

Example difference types include target changes, condition changes, survival-period changes, limitation-of-liability cap changes, governing-law changes, assignment-scope changes, and termination-trigger changes.

## Intended integration point

CLEAR-X is best positioned as a possible **semantic redline / audit layer** for legal AI or CLM systems, not as a standalone CLM product.

Potential uses:

- semantic redline review;
- clause equivalence checking;
- playbook deviation analysis;
- obligation-change tracking;
- audit layer for LLM-assisted contract review.

## Current status

The package includes code, schemas, ontology, generated benchmark files, verification reports, baselines, and a draft paper outline. The current benchmark is synthetic and should be expanded with attorney-reviewed real clause pairs before making production claims.

## Honest limitation

CLEAR-X demonstrates a verified comparison architecture. It does not yet prove broad real-world contract coverage. Unsupported or ambiguous clauses are rejected by design.
