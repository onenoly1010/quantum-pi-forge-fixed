# OINIO Oracle Engine

The OINIO Oracle Engine is the core deterministic soul-reading algorithm that evaluates and verifies OINIO soul signatures, personality traits, and consciousness coherence.

## Structure

- **engine/**: Core reading algorithms and evaluation frameworks
- **traits/**: Personality trait definitions (to be populated)
- **verification/**: Soul signature verification logic
- **utils/**: Helper functions and daemons
- **tests/**: Oracle-related tests

## Key Components

- **AI Signer** (`verification/oinio_ai_signer.py`): Evaluates transaction proposals for OINIO token validity
- **Autonomous Nexus** (`engine/autonomous_ai_nexus.py`): Monitors system coherence and mints balancing soul nodes
- **Scribe Daemon** (`utils/scribe_daemon.py`): Listens for etched messages and events
- **Evaluation Framework** (`engine/evaluation/`): Comprehensive AI response evaluation with custom metrics
- **Coherence Auditor** (`engine/llm-coherence-auditor/`): Measures LLM consistency under noise

## Main Interface

Use `index.py` to access the oracle functions:

```python
from core.oracle.index import generate_reading, map_traits, verify_soul_signature
```

## Algorithms

- Deterministic soul signature verification
- Personality trait mapping and evolution
- Coherence scoring (κ) for response consistency
- Task completion evaluation
- Relevance and coherence assessment