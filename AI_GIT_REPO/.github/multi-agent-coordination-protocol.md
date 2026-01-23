# Multi-Agent Coordination Protocol

## Overview
This protocol governs coordination between multiple automated agents in the AI_GIT_REPO project. Agents include: Model Agent, Data Agent, API Agent, Frontend Agent.

## Boundaries
- **Model Agent**: Handles AI/ML models, training scripts. No application code.
- **Data Agent**: Manages data processing, ingestion. No model training.
- **API Agent**: Operates on FastAPI/Flask backends. No frontend code.
- **Frontend Agent**: Handles React/Next.js interfaces. No backend logic.

## Handoff Rules
- Agents signal completion via commit messages with tags: [MODEL], [DATA], [API], [FRONTEND].
- Dependent agents check for tagged commits before proceeding.
- Use GitHub issues for complex handoffs, assigning to next agent.

## Conflict Resolution
- Last commit wins; agents must rebase/merge before changes.
- If conflicts detected, agent pauses and notifies via issue.
- Human review required for cross-boundary conflicts.

## Shared State Expectations
- All agents read from main branch.
- Environment variables shared via .env files (never committed).
- Model and data paths consistent across agents.
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