# CLEAR-X / Oractron submission repository

Prepared: 2026-05-09  
Originator: Bhavesh Tekwani / Oractron

CLEAR-X is a research prototype for verified legal semantic diff. It compares supported contract clauses by mapping them into typed canonical legal frames, then returning `EQUAL`, `DIFFERENT`, or `REJECT` with structured material diffs or rejection reasons.

## What this repository contains

This repository is an outreach/provenance repository for the CLEAR-X professional submission materials. It contains:

- executive one-pager;
- technical brief;
- claims and limitations note;
- outreach target list;
- email templates;
- timestamp/provenance plan;
- SHA-256 manifest for the prepared packages.

The full technical diligence package is not committed here through this connector because it contains large generated JSONL benchmark files. Its SHA-256 hash is recorded in `PACKAGE_HASHES.sha256` for provenance.

## What to send first

For first outreach, send only:

1. `docs/01_EXECUTIVE_ONE_PAGER.md`
2. `docs/02_TECHNICAL_BRIEF.md`
3. `docs/03_CLAIMS_AND_LIMITATIONS.md`
4. optionally `docs/07_DEMO_SCRIPT.md`

Do not attach the full code/data package in a cold first email unless the recipient specifically asks for it. Offer a short call and a private repository under suitable terms.

## What this is

- A research prototype / technical artifact.
- A semantic redline / semantic diff concept for contract clauses.
- A verified comparison layer that rejects unsupported clauses instead of guessing.

## What this is not

- Not a full CLM platform.
- Not legal advice.
- Not a replacement for lawyer review.
- Not a universal legal AI system.
- Not a claim that every commercial contract clause can be parsed.

## Recommended positioning

Position this as an auditable semantic-diff layer that may complement contract intelligence, CLM review, or AI contract-assistant workflows.