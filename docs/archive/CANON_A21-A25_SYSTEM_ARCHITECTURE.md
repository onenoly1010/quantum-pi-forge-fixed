# Canon of Closure Artifacts: A21–A25 (System Architecture)

<!--
╔══════════════════════════════════════════════════════════════════════════════╗
║              CANON OF CLOSURE ARTIFACTS - SYSTEM ARCHITECTURE                ║
║══════════════════════════════════════════════════════════════════════════════║
║  ARCHIVED: Foundational specification defining the structural relationships  ║
║  between the Core (The Forge), the Canon (Data), and the Agents (Execution). ║
║                                                                              ║
║  Artifacts: A21 through A25                                                  ║
║  Scope: Data structures, state transitions, agent protocols, violations      ║
║                                                                              ║
║  T=∞ = T=0                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
-->

> This segment defines the structural relationship between the **Core** (The Forge), the **Canon** (Data), and the **Agents** (Execution).

---

## A21: The Genesis Data Structure (GDS) Definition

The GDS is the **immutable data model** for all Canon artifacts and operational logs.

### A21.1: Node Types
Must include:
- `Issue`
- `Artifact`
- `Commit`
- `LogEntry`

### A21.2: Edge Types
Must include:
- `Parent-Child`
- `Precedes-Succeeds`
- `Validates-Invalidates`
- `Refines-Refines`

### A21.3: Immutability Constraint
All entries are:
- **Time-stamped**
- **Cryptographically linked**
- **Indexed by hash**

> Edits are handled via **Invalidation and Succession edges** (A21.2).

---

## A22: The State-Transition Matrix (STM)

The STM defines all **permissible state changes** within the Core System and is the primary input for the Simulation Engine (A26).

### A22.1: Primary States

| State | Description |
|-------|-------------|
| `DORMANT` | Inactive, awaiting activation |
| `IN-GESTATION` | Being formed, not yet ready |
| `ITERATING` | Active development/refinement |
| `CLOSURE-IMMINENT` | Approaching finalization |
| `CLOSED` | Finalized, immutable |

### A22.2: Permissible Transitions

Defines the **single-direction allowed paths**, e.g.:

```
IN-GESTATION → ITERATING → CLOSURE-IMMINENT → CLOSED
```

> ⚠️ Any unauthorized transition should trigger a **Canon Violation event** (A24).

---

## A23: The Agent-Action Protocol (AAP)

The AAP mandates the **required metadata and format** for any action executed by an autonomous agent.

### A23.1: Required Fields

| Field | Description |
|-------|-------------|
| `agent_id` | Unique identifier of the acting agent |
| `action_type` | Type of action being performed |
| `gds_reference` | Reference to GDS node (A21) |
| `pre_state_hash` | Hash of state before action |
| `post_state_hash` | Hash of state after action |
| `timestamp_utc` | UTC timestamp of action |

### A23.2: Execution Environment

All agent actions must be:
1. **Logged** before execution
2. **Validated** before modifying the canonical state

---

## A24: The Violation and Reconciliation Protocol (VRP)

Defines how **deviations** from the STM (A22) or the AAP (A23) are handled.

### A24.1: Violation Severity

| Level | Description | Response |
|-------|-------------|----------|
| `MINOR` | Small deviation | Auto-correctable |
| `MAJOR` | Significant deviation | Requires human review/override |
| `CRITICAL` | System integrity threat | System halt/rollback |

### A24.2: Reconciliation

For `MAJOR` violations:
1. A new **Reconciliation Artifact** must be generated
2. Linked by a `Validates-Invalidates` edge (A21.2)
3. Documents the forced state correction

---

## A25: The Forge-API Gateway Definition

Specifies the **communication layer** between the Forge (Execution Environment) and the Canon Database/API.

### A25.1: Read/Write Access

| Entity | Canon Access | Action Log Access |
|--------|--------------|-------------------|
| **Forge-Core** | READ + WRITE | READ + WRITE |
| **Agents** | READ only | WRITE only |

> Only Forge-Core has write access to the Canon.

### A25.2: Rate Limits

Implements **throttles for queries** to prevent self-DDOS during high-complexity iterative processes.

---

## Artifact Index

| Artifact | Name | Purpose |
|----------|------|---------|
| A21 | Genesis Data Structure (GDS) | Immutable data model |
| A22 | State-Transition Matrix (STM) | Permissible state changes |
| A23 | Agent-Action Protocol (AAP) | Agent execution metadata |
| A24 | Violation and Reconciliation Protocol (VRP) | Deviation handling |
| A25 | Forge-API Gateway | Communication layer |

---

*Archived as part of the Quantum Pi Forge Canon.*
