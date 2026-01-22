# Quantum Pi Forge - AI Evaluation Framework

This directory contains the evaluation framework for the Quantum Pi Forge AI system,
using Azure AI Evaluation SDK with custom evaluators tailored for the Sacred Trinity architecture.

## Overview

The evaluation framework measures:

| Metric | Type | Description |
|--------|------|-------------|
| **Response Relevance** | Built-in (Prompt-based) | How well responses address user queries |
| **Response Coherence** | Built-in (Prompt-based) | Logical flow and consistency of responses |
| **Task Completion** | Custom (Code-based) | Whether AI helps users achieve their goals |
| **Response Time** | Custom (Code-based) | Latency performance against thresholds |
| **Quantum Phase Alignment** | Custom (Code-based) | Alignment with consciousness phases |

## Quick Start

### 1. Install Dependencies

```bash
cd evaluation
pip install -r requirements.txt
```

### 2. Set Environment Variables

```bash
# For prompt-based evaluators (optional)
export OPENAI_API_KEY="your-openai-api-key"
export OPENAI_MODEL="gpt-4o-mini"
```

### 3. Run Evaluation

```bash
# Run with default dataset
python run_evaluation.py

# Run with custom dataset
python run_evaluation.py --data my_dataset.jsonl --output my_results
```

## Files

| File | Description |
|------|-------------|
| `run_evaluation.py` | Main evaluation script with evaluators |
| `collect_responses.ts` | Agent runner for collecting AI responses |
| `evaluation_dataset.jsonl` | Sample evaluation dataset |
| `requirements.txt` | Python dependencies |

## Dataset Format

The evaluation dataset should be a JSONL file with the following structure:

```jsonl
{"query": "User question", "response": "AI response", "expected_response": "Expected outcome", "context": "Context info", "quantum_phase": "foundation", "response_time_ms": 1200, "success": true}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `query` | string | The user's input/question |
| `response` | string | The AI's actual response |
| `expected_response` | string | Expected/ideal response |
| `quantum_phase` | string | foundation/growth/harmony/transcendence |
| `response_time_ms` | integer | Response time in milliseconds |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `context` | string | Additional context for the query |
| `component` | string | Which Sacred Trinity component |
| `evaluation_focus` | string | Specific evaluation area |
| `success` | boolean | Whether the response was successful |

## Evaluators

### Built-in Evaluators (Azure AI Evaluation SDK)

**CoherenceEvaluator**
- Measures logical flow and consistency
- Requires OpenAI API key
- Score: 1-5

**RelevanceEvaluator**  
- Measures how well response addresses the query
- Requires OpenAI API key
- Score: 1-5

### Custom Evaluators

**TaskCompletionEvaluator**
- Compares response against expected outcomes
- Uses keyword overlap analysis
- Score: 1-5

**ResponseTimeEvaluator**
- Evaluates latency against threshold (default 3000ms)
- No API key required
- Score: 1-5

**QuantumPhaseAlignmentEvaluator**
- Measures alignment with Sacred Trinity phases
- Uses phase-specific keyword matching
- Score: 1-5

## Collecting Responses

To collect fresh responses from your AI application:

```bash
# Start the dev server
npm run dev

# In another terminal, compile and run the collector
npx tsx evaluation/collect_responses.ts
```

The collector will:
1. Read queries from `pi-forge-quantum-genesis/quantum_test_data.jsonl`
2. Call your `/api/chat` endpoint for each query
3. Save responses to `evaluation/evaluation_dataset.jsonl`

## Output

Evaluation results are saved to the output directory:

```
evaluation_results/
├── eval_results.jsonl      # Row-level evaluation data
├── summary.json            # Aggregate metrics
└── evaluation_log.txt      # Execution log
```

### Metrics Summary Example

```json
{
  "coherence.score": 4.2,
  "relevance.score": 4.0,
  "task_completion": 3.8,
  "response_time_score": 4.5,
  "phase_alignment": 3.6
}
```

## Integration with CI/CD

Add to your workflow:

```yaml
- name: Run AI Evaluation
  run: |
    cd evaluation
    pip install -r requirements.txt
    python run_evaluation.py --data evaluation_dataset.jsonl
```

## Extending the Framework

### Adding Custom Evaluators

1. Create a class with `__init__` and `__call__` methods
2. Add to the `evaluators` dictionary in `run_evaluation.py`
3. Configure column mapping in `evaluator_config`

```python
class MyCustomEvaluator:
    def __init__(self):
        pass
    
    def __call__(self, *, response: str, **kwargs):
        # Your evaluation logic
        return {"my_score": 5, "my_reason": "Excellent!"}
```

## Troubleshooting

### "No OpenAI API key" Warning
- Prompt-based evaluators (coherence, relevance) require an API key
- Code-based evaluators will still run without it

### "Module not found" Error
```bash
pip install azure-ai-evaluation
```

### Dataset Format Errors
- Ensure JSONL format (one JSON object per line)
- Check all required fields are present
- Remove timestamp fields if present
