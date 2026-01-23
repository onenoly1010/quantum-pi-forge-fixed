#!/bin/bash
echo "=== Repair Cycle ==="
echo "Installing dependencies..."
pip install -r requirements.txt
npm install
echo "Repair complete."