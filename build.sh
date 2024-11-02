#!/bin/bash

# Exit on any error
set -e

echo "🧹 Cleaning dist directory..."
rm -rf dist
mkdir -p dist

echo "📦 Compiling each TypeScript file to JavaScript..."
npx tsc

echo "📝 Copying CSS files..."
# Copy CSS files, preserving directory structure within dist
rsync -av --include='*/' --include='*.css' --exclude='*' src/ dist/

echo "📝 Copying JS files..."
# Copy JS files, preserving directory structure within dist
rsync -av --include='*/' --include='*.js' --exclude='*' src/ dist/

echo "✅ Build complete! Individual .js and .css files are in the dist directory with original structure."
