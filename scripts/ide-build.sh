#!/bin/bash

# IDE Build Script
# This script compiles the entire project.

echo "Starting build process..."

# Ensure we are in the root directory
cd "$(dirname "$0")/.."

# Check for node_modules
if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Running npm install..."
    npm install
fi

# Run the compilation
npm run compile

echo "Build complete."
