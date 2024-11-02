#!/bin/bash

# Ensure a package name and --out parameter are provided
if [ -z "$1" ]; then
  echo "Usage: bundler.sh <npm_package_name> --out <output_directory> [--esm] [--ts]"
  exit 1
fi

# Set variables
PACKAGE_NAME=$1
ESM=false
TS=false
OUT_DIR=""

# Parse options
shift
while [[ $# -gt 0 ]]; do
  case $1 in
    --out)
      OUT_DIR=$2
      shift
      ;;
    --esm)
      ESM=true
      ;;
    --ts)
      TS=true
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
  shift
done

# Ensure the --out parameter was provided
if [ -z "$OUT_DIR" ]; then
  echo "Error: --out <output_directory> is required."
  exit 1
fi

# Set the output directory as <out_dir>/<package_name>
OUTPUT_DIR="${OUT_DIR}/${PACKAGE_NAME}"
mkdir -p "$OUTPUT_DIR"

# Prepare output filenames
OUTPUT_FILE="${OUTPUT_DIR}/index.js"
OUTPUT_D_TS="${OUTPUT_DIR}/index.d.ts"

# Create a temporary directory for the package installation and build
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Install the package in the temporary directory
npm install $PACKAGE_NAME --prefix $TEMP_DIR

# Locate the package.json file and read the "types" or "typings" field if it exists
PACKAGE_JSON_PATH="$TEMP_DIR/node_modules/$PACKAGE_NAME/package.json"
if [ -f "$PACKAGE_JSON_PATH" ]; then
  TYPES_ENTRY=$(node -pe "require('$PACKAGE_JSON_PATH').types || require('$PACKAGE_JSON_PATH').typings || ''")
else
  TYPES_ENTRY=""
fi

# Bundle with esbuild and disable file path comments
if $ESM; then
  esbuild "$TEMP_DIR/node_modules/$PACKAGE_NAME" --bundle --format=esm --outfile=$OUTPUT_FILE --legal-comments=none
else
  esbuild "$TEMP_DIR/node_modules/$PACKAGE_NAME" --bundle --format=iife --global-name="${PACKAGE_NAME}" --outfile=$OUTPUT_FILE --legal-comments=none
fi

# If --ts is set, handle TypeScript declarations
if $TS; then
  # If a types entry exists, rename it to index.d.ts in the output directory
  if [ -n "$TYPES_ENTRY" ]; then
    TYPES_PATH="$TEMP_DIR/node_modules/$PACKAGE_NAME/$TYPES_ENTRY"
    if [ -f "$TYPES_PATH" ]; then
      cp "$TYPES_PATH" "$OUTPUT_D_TS"
      echo "TypeScript declaration entry file renamed to $OUTPUT_D_TS"
    else
      echo "Warning: TypeScript declaration file specified in package.json not found: $TYPES_PATH"
    fi
  else
    echo "No TypeScript declaration entry point found in package.json"
  fi

  # Copy additional .d.ts files to the output directory without renaming or preserving structure
  find "$TEMP_DIR/node_modules/$PACKAGE_NAME" -name '*.d.ts' -not -path "$TYPES_PATH" -exec cp {} "$OUTPUT_DIR" \;
fi

# Clean up the temporary directory
rm -rf $TEMP_DIR
echo "Temporary directory cleaned up: $TEMP_DIR"

echo "Bundling completed. Files generated in $OUTPUT_DIR:"
echo "  - JavaScript: index.js"
if $TS && [ -f "$OUTPUT_D_TS" ]; then
  echo "  - TypeScript Declarations: index.d.ts"
fi
