# CLEAR-X Policy

Policy version: `CLEAR-X-1`.

CLEAR-X is a deterministic semantic diff engine for a declared commercial-contract grammar. It returns `EQUAL`, `DIFFERENT`, or `REJECT`.

Equality is based on canonical frame equality, not hash equality. Optional fingerprints are computed as:

```text
SHA3-256("CLEAR-X-1" || canonical_string)
```

Supported contract types: NDA, MSA, SaaS Agreement, Data Processing Agreement, Service Agreement, License Agreement, Employment Confidentiality Agreement, Vendor Agreement.

Supported clause families are exactly the 20 families enumerated in `legal_ontology.yaml`. Unsupported or ambiguous clauses are rejected, not approximated.

The verifier is authoritative. The candidate parser may propose a frame, but cannot decide equality, difference, or rejection.
