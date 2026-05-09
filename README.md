# CLEAR-X

CLEAR-X is a research prototype for verified semantic diff and equivalence checking of commercial contract clauses.

It compares two supported clauses and returns one of:

- `EQUAL`
- `DIFFERENT`
- `REJECT`

For accepted clauses, CLEAR-X maps each clause into a typed canonical legal frame and compares material fields. If a clause is unsupported, ambiguous, or outside the declared grammar, the system rejects rather than guessing.

## Repository status

This repository is intended to contain the actual CLEAR-X project files only: code, schemas, ontology, verification scripts, reports, and benchmark data.

## Core rule

```text
supported + same canonical frame -> EQUAL
supported + different canonical frames -> DIFFERENT with structured diffs
unsupported or ambiguous -> REJECT
```

## Important limitation

CLEAR-X is a research prototype. It is not legal advice, not a full CLM platform, and not a replacement for lawyer review.

## Expected project files

```text
policy.md
legal_ontology.yaml
canonical_schema.json
diff_schema.json
proof_trace_schema.json
canonicalizer.py
llm_candidate_parser.py
verifier.py
comparator.py
span_coverage.py
baselines.py
run_verification.py
run_baselines.py
equal_pairs.jsonl
different_pairs.jsonl
reject_pairs.jsonl
adversarial_pairs.jsonl
regression_pairs.jsonl
verification_report.txt
baseline_report.txt
failure_taxonomy.md
design_notes.md
legal_residue_firewall.md
model_card.md
paper_draft.md
```

Large JSONL benchmark files should be pushed with normal Git or Git LFS from a local clone if they exceed connector limits.
