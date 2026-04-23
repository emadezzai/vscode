#!/bin/bash

# IDE Development Watcher Script
# This script starts the watcher to enable live recompilation during development.

echo "Starting development watcher..."

# Ensure we are in the root directory
cd "$(dirname "$0")/.."

# Check for node_modules
if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Running npm install..."
    npm install
fi

echo "Watcher is starting. You can run the application in another terminal using ./scripts/code.sh"

# Run the watch script
npm run watch
