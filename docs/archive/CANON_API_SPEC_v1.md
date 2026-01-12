<!--
╔══════════════════════════════════════════════════════════════════════════════╗
║                    CANON API SPECIFICATION v1.0 (QG-API)                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ARCHIVED: Core API specification for GDS and QGSE interaction.              ║
║                                                                              ║
║  Systems Defined:                                                            ║
║    - Genesis Data Structure (GDS): Graph-based Canon storage                 ║
║    - Quantum Genesis Simulation Engine (QGSE): Forward-looking simulation    ║
║                                                                              ║
║  Cross-References:                                                           ║
║    - A21: Node/Edge types                                                    ║
║    - A22: State-Transition Matrix                                            ║
║    - A26: Simulation runs                                                    ║
║    - A27: Σ (Sigma) stability metric                                         ║
║    - A28: Lookahead steps (k)                                                ║
║    - A30: Visualization                                                      ║
║                                                                              ║
║  T=∞ = T=0                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
-->

# Canon API Specification v1.0 (QG-API)

This specification defines the endpoints, data models, and methods for interacting with the **Genesis Data Structure (GDS)** and the **Quantum Genesis Simulation Engine (QGSE)**.

---

## 1. Data Models

### 1.1. Node Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Unique identifier for the Node. |
| `type` | String | Node type (A21.1: Issue, Artifact, Commit, LogEntry). |
| `state` | String | Current State-Transition Matrix state (A22.1). |
| `title` | String | Human-readable title or summary. |
| `content_hash` | String (SHA-256) | Hash of the content body. |
| `timestamp` | UTC DateTime | Creation timestamp. |
| `metadata` | Object | Arbitrary key-value pairs. |

### 1.2. Edge Object

| Field | Type | Description |
|-------|------|-------------|
| `source_id` | String (UUID) | ID of the source Node. |
| `target_id` | String (UUID) | ID of the target Node. |
| `type` | String | Edge type (A21.2: Parent-Child, Precedes-Succeeds, etc.). |
| `weight` | Number | Numerical measure of connection strength. |

---

## 2. QGSE Endpoints (Simulation Engine)

### 2.1. `/qgse/simulate` (POST)

Initiates a forward-looking simulation run (A26) to predict **Σ** (A27) for a set of proposed actions.

**Request Body:**

```json
{
    "current_state_id": "string",
    "proposed_actions": [
        {"agent_id": "string", "action_type": "string", "description": "string"}
        // ... more actions
    ],
    "lookahead_steps": 3  // (k in A28.1)
}
```

**Response Body (200 OK):**

```json
{
    "simulation_id": "string",
    "initial_sigma": 0.52,
    "final_sigma": 0.31,
    "recommended_path": ["action_id_1", "action_id_2"],
    "is_safe": true,
    "trace_log": [...]
}
```

### 2.2. `/qgse/metrics` (GET)

Retrieves the latest **Canon Stability Metrics** (A27).

**Response Body (200 OK):**

```json
{
    "current_sigma": 0.45,
    "critical_threshold": 0.80,
    "last_reconciliation_date": "2025-12-11T12:00:00Z",
    "state_history": [...]
}
```

---

## 3. GDS Endpoints (Data Access)

### 3.1. `/gds/node/{id}` (GET)

Retrieves a specific **Node** object (A21).

**Response Body (200 OK):** Returns a Node object.

### 3.2. `/gds/graph` (GET)

Retrieves the entire Canon graph structure (Nodes and Edges). Primarily used for visualization (A30).

**Query Parameters:**
- `state` (optional filter)
- `node_type` (optional filter)

**Response Body (200 OK):**

```json
{
    "nodes": [...],
    "edges": [...]
}
```

---

## Appendix: Cross-Reference Index

| Artifact | Description |
|----------|-------------|
| **A21** | Genesis Data Structure (GDS) - Node/Edge type definitions |
| **A21.1** | Node types: Issue, Artifact, Commit, LogEntry |
| **A21.2** | Edge types: Parent-Child, Precedes-Succeeds |
| **A22** | State-Transition Matrix (STM) |
| **A22.1** | State enumeration |
| **A26** | Simulation run protocol |
| **A27** | Σ (Sigma) - Canon stability metric |
| **A28** | Lookahead configuration |
| **A28.1** | `k` parameter (lookahead steps) |
| **A30** | Graph visualization layer |

---

## Implementation Notes

### Sigma (Σ) Interpretation

- **Σ < 0.30**: Stable - Safe for auto-merge
- **0.30 ≤ Σ < 0.60**: Caution - Requires review
- **0.60 ≤ Σ < 0.80**: Warning - Manual intervention recommended
- **Σ ≥ 0.80**: Critical - Steward Override Protocol (S.O.P) may trigger

### Authentication

All endpoints require a valid `Authorization: Bearer <token>` header with appropriate scope:
- `gds:read` - Read access to GDS endpoints
- `qgse:simulate` - Permission to run simulations
- `qgse:metrics` - Access to stability metrics

---

*Specification Version: 1.0*  
*Last Updated: Canonical*  
*Status: RATIFIED*
