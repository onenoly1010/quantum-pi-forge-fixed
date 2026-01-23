#!/bin/bash
echo "=== Audit Cycle ==="
echo "Timestamp: $(date)"
echo "Running tests..."
python -m pytest
npm test
echo "Checking git status..."
git status
echo "Audit complete."