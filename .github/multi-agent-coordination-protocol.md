# Multi-Agent Coordination Protocol

## Overview
This protocol governs coordination between multiple automated agents in the Quantum Pi Forge project. Agents include: Frontend Agent, Backend Agent, Contract Agent, Guardian Agent, Oracle Agent.

## Boundaries
- **Frontend Agent**: Handles Next.js/TypeScript code, UI components, client-side logic. No backend or contract modifications.
- **Backend Agent**: Manages FastAPI/Python, API routes, sponsor wallet logic. No frontend or contract changes.
- **Contract Agent**: Operates on Solidity/Hardhat, deployments. No application code.
- **Guardian Agent**: Monitors and alerts via Python scripts. Read-only except for logs.
- **Oracle Agent**: Data ingestion and processing. No core logic changes.

## Handoff Rules
- Agents signal completion via commit messages with tags: [FRONTEND], [BACKEND], [CONTRACT], [GUARDIAN], [ORACLE].
- Dependent agents check for tagged commits before proceeding.
- Use GitHub issues for complex handoffs, assigning to next agent.

## Conflict Resolution
- Last commit wins; agents must rebase/merge before changes.
- If conflicts detected, agent pauses and notifies via issue.
- Human review required for cross-boundary conflicts.

## Shared State Expectations
- All agents read from main branch.
- Environment variables shared via .env files (never committed).
- Contract addresses and RPC URLs consistent across agents.
- Snapshots in /diagnostics for state tracking.
- Artifacts in /artifacts for generated outputs.

## Communication
- Agents log actions in diagnostics/snapshots.
- Use Copilot Chat for inter-agent queries.
- Human intervention for escalations.

## Safety
- No agent modifies another's boundary without explicit instruction.
- All changes validated against audit.sh before commit.
- Rollback via scripts/rollback.sh if issues detected.