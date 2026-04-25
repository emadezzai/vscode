#!/bin/bash

# IDE Packaging Script for Intel (x64) DMG
# This script bundles the application and creates a DMG installer.

echo "Starting packaging process for Intel (x64)..."

# Ensure we are in the root directory
cd "$(dirname "$0")/.."

# Set required environment variables for VS Code build process
export VSCODE_ARCH=x64
export VSCODE_QUALITY=stable

# 1. Build the application for Darwin x64
echo "Step 1: Bundling application for Darwin x64..."
npm run gulp vscode-darwin-x64-min

# 2. Create the DMG
echo "Step 2: Creating DMG..."
mkdir -p out-dmg

# Note: The build output from gulp is placed in the parent directory by default in VS Code's setup
BUILD_DIR=".."
OUT_DIR="./out-dmg"

node --experimental-strip-types build/darwin/create-dmg.ts "$BUILD_DIR" "$OUT_DIR"

echo "Packaging complete. DMG can be found in $OUT_DIR"
