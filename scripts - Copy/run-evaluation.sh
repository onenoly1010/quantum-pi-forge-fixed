#!/usr/bin/env bash
set -euo pipefail

echo "🔬 Running Quantum Pi Forge evaluation (Linux/macOS)"
python -m pip install --upgrade pip
python -m pip install -r evaluation/requirements.txt
python evaluation/run_evaluation.py --data evaluation/evaluation_dataset.jsonl --output evaluation/evaluation_results

echo "✅ Evaluation complete. Results in evaluation/evaluation_results"