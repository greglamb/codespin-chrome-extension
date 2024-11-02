#!/bin/bash

# Exit on any error
set -e

echo "🧹 Cleaning dist directory..."
rm -rf dist
mkdir -p dist

echo "📦 Compiling each TypeScript file to JavaScript..."
tsc --jsx react

echo "📝 Copying CSS files..."
# Copy CSS files directly to the dist directory
find src -name "*.css" -exec cp --parents {} dist \;

echo "📝 Copying JS files..."
# Copy JS files directly to the dist directory
find src -name "*.js" -exec cp --parents {} dist \;

echo "✅ Build complete! Individual .js files are in the dist directory."
