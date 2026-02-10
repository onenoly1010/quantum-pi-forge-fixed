Write-Host "🔬 Running Quantum Pi Forge evaluation (Windows PowerShell)"
python -m pip install --upgrade pip
python -m pip install -r evaluation/requirements.txt
python evaluation/run_evaluation.py --data evaluation/evaluation_dataset.jsonl --output evaluation/evaluation_results
Write-Host "✅ Evaluation complete. Results in evaluation/evaluation_results"