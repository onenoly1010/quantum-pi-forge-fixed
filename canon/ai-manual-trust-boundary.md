---
id: FOUND-002
title: AI/Manual Trust Boundary
type: foundational
created_at: 2026-09-07T00:00:00Z
updated_at: 2026-09-07T00:00:00Z
author: onenoly1010
trace_id: A22-002
status: draft
tags:
  - trust-boundary
  - ai-governance
  - authorization
  - verification
  - canon-alignment
related:
  - FOUND-001
---

# AI/Manual Trust Boundary

This artifact defines the deliberate boundary between AI-carried execution and human-held authority in Quantum Pi Forge (QPF). It establishes that AI is most powerful when it is explicitly denied authority, and that verification must never silently become permission to act.

## Purpose

Define what must remain true for QPF to deserve trust: a strict separation in which AI accelerates execution, evidence constrains claims, verification constrains truth, and authorization controls action. This boundary keeps "AI-assisted infrastructure" from becoming "AI-governed infrastructure" by accident.

## Context

QPF uses AI agents (Cline/Copilot/GitHub agents) extensively. Without an explicit boundary, execution authority can drift into the agent layer. This foundation fixes the boundary so that:

- AI executes against an already-defined architectural target.
- AI applies adversarial pressure and performs independent reconstruction.
- Humans retain sole authority over architecture, authorization, specification freeze, and final state transitions.

## Specification

### Where AI carries the load

AI is authoritative for execution, not for truth or permission.

1. **Implementation mechanics** — boilerplate and refactors, test/fixture generation, repository inspection, repetitive verification scripts, documentation synchronization, state-reconstruction experiments, adversarial test generation, and running large numbers of deterministic checks.
2. **Adversarial pressure** — the highest-value AI use. The operative prompt is "Assume this is wrong; find the smallest evidence-preserving way to make it appear correct," attacking representation gaps, verifier/parser disagreements, omitted predicates, stale state, provenance breaks, narrative fields that can lie while machine fields remain valid, authorization/verification conflation, and reconstruction failures.
3. **Independent reconstruction** — AI acts as a clean-room reconstructor: given frozen inputs, canonicalization rules, predicates, and evidence, produce the verdict without consulting QPF's implementation. This tests whether the trust boundary actually exists, not merely whether the verifier passes its own tests.

### Where a strict manual grip is kept (never delegated)

- **Architecture** — AI may propose; it does not decide. The human decision is "what must be true for this system to deserve trust," which is upstream of implementation.
- **Authorization** — the most important boundary. AI may establish VERIFIED; it must never silently transform that into AUTHORIZED. Authorization is a separate, explicit act.
- **Specification freeze** — once a requirement, trust boundary, predicate set, canonicalization rule, or acceptance criterion is frozen, agents operate inside the frozen contract and do not reinterpret it, preventing the system from moving the goalposts.
- **Final state transitions** — merge, deployment, minting, staking, liquidity, bridge activation, governance changes, or any material state change requires an explicit authorization boundary. AI may prepare, verify, and report a transition; verification is not permission to transition.

### The converging architecture

```
HUMAN
  │ defines intent
  ▼
SPECIFICATION
  │ freezes invariants
  ▼
AI EXECUTION
  ├── implementation
  ├── tests
  ├── refactoring
  ├── reconstruction
  └── adversarial attacks
  ▼
INDEPENDENT VERIFICATION
  ├── canonicalize
  ├── hash
  ├── evaluate predicates
  ├── reconstruct state
  └── reproduce verdict
  ▼
VERIFICATION RESULT
  │ does NOT imply authorization
  ▼
HUMAN / GOVERNANCE AUTHORIZATION
  ▼
STATE TRANSITION
  ▼
RECEIPT / EVIDENCE
```

## Usage

1. **Delegating work to an agent**: confirm the task is execution, adversarial, or reconstruction. If it touches architecture, authorization, a frozen spec, or a state transition, route to a human.
2. **Reviewing a verification result**: treat VERIFIED as evidence only; require an explicit AUTHORIZED act before any state transition.
3. **Amending a frozen contract**: only via human/governance decision; agents operate within the frozen spec as-is.

## Validation

- Any agent workflow that transitions state must show a distinct, logged authorization step separate from verification.
- Adversarial and independent-reconstruction outputs must be reproducible from frozen inputs without access to QPF's implementation internals.
- No agent may hold approval rights on foundational or governance artifacts (consistent with Canon roles).

## Evolution

- Amendments follow the foundational approval requirement: 2 steward approvals.
- The boundary may be tightened by stewards at any time; loosening requires explicit governance action.
- Deprecated delegations must be recorded as closure artifacts linking back to this foundation.

## References

- Related artifact: [FOUND-001](./examples/foundational-example.md)
- Canon roles and approval requirements: [canon/README.md](./README.md)

## Metadata

- **Approval Requirements**: 2 steward approvals
- **Auto-Merge**: Enabled (gates apply)
- **Conflict Sensitivity**: High
- **Review Period**: Minimum 48 hours
