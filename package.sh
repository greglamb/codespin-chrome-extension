#!/bin/bash

# Check if output file argument is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <out_file>"
    echo "Example: $0 abc.zip"
    exit 1
fi

# Check if output file has .zip extension
if [[ ! $1 =~ \.zip$ ]]; then
    echo "Error: Output file must have .zip extension"
    exit 1
fi

# Convert output path to absolute path
out_file=$(realpath "$1")

# Create temporary directory
tmp_dir=$(mktemp -d)

# Copy directories
dirs=("images" "resources" "dist")
for dir in "${dirs[@]}"; do
    if [ -d "./$dir" ]; then
        cp -r "./$dir" "$tmp_dir/"
    else
        echo "Warning: Directory ./$dir not found"
    fi
done

# Copy files
files=("manifest.json" "PRIVACY.md" "README.md")
for file in "${files[@]}"; do
    if [ -f "./$file" ]; then
        cp "./$file" "$tmp_dir/"
    else
        echo "Warning: File ./$file not found"
    fi
done

# Create zip archive
cd "$tmp_dir" && zip -r "$out_file" ./*

# Cleanup
rm -rf "$tmp_dir"

echo "Archive created: $out_file"