#!/bin/bash
OUTPUT="diagnostics/system-snapshot-$(date +%Y%m%d-%H%M%S).md"

echo "Creating system snapshot: $OUTPUT"

{
  echo "# System Snapshot"
  echo "Timestamp: $(date)"
  echo ""
  echo "## Git Status"
  git status
  echo ""
  echo "## Recent Commits"
  git log -n 5
} > "$OUTPUT"

echo "Snapshot saved."