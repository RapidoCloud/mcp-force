#!/bin/bash
cd "$(dirname "$0")/.."

# Check if dist directory exists
if [ ! -d "./dist" ] || [ ! -f "./dist/index.js" ]; then
  echo "Building project first..."
  npm run build
fi

node dist/index.js