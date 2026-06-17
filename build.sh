#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci

echo "Building with Vite..."
npm run build

echo "Build complete!"
