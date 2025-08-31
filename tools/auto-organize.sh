#!/bin/bash
# Live file organization watcher

PROJECT_ROOT="/Users/mandymarigjervikrygg/Desktop/dev-memory-os-starter"

organize_files() {
    cd "$PROJECT_ROOT"
    
    echo "🧹 Checking for misplaced files..."
    
    # Config files
    for file in *.json *.lock *.toml .env* .dockerignore bunfig.*; do
        if [ -f "$file" ]; then
            mkdir -p config/
            mv "$file" config/
            echo "📁 Moved $file to config/"
        fi
    done
    
    # Documentation  
    for file in *.md; do
        if [ -f "$file" ] && [[ "$file" =~ ^[A-Z] ]]; then
            mkdir -p shared/docs/
            mv "$file" shared/docs/
            echo "📚 Moved $file to shared/docs/"
        fi
    done
    
    # Scripts
    for file in *.sh *.py; do
        if [ -f "$file" ]; then
            mkdir -p tools/
            mv "$file" tools/
            echo "🔧 Moved $file to tools/"
        fi
    done
}

if command -v fswatch >/dev/null 2>&1; then
    echo "🔍 Starting file organization watcher..."
    fswatch -o "$PROJECT_ROOT" | while read; do
        organize_files
    done
else
    echo "📋 One-time organization (install fswatch for live watching):"
    organize_files
fi