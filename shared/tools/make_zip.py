#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🧠 Krins Multi-Agent Orchestrator - Archive Creator
Creates complete deployment-ready ZIP bundle with all essential files.
"""

import os
import zipfile
import hashlib
import time
from pathlib import Path
from datetime import datetime

# 📦 Files and directories to EXCLUDE from ZIP
EXCLUDES = [
    # Version control
    '.git',
    '.gitignore',
    
    # Node.js
    'node_modules',
    '.npm',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    
    # Python
    '__pycache__',
    '*.pyc',
    '*.pyo',
    '.pytest_cache',
    'venv',
    '.env',
    
    # IDE and editors
    '.vscode',
    '.idea',
    '*.swp',
    '*.swo',
    '.DS_Store',
    'Thumbs.db',
    
    # Build outputs (keep source, exclude compiled)
    'dist',
    'build',
    '.next',
    
    # Logs
    '*.log',
    'logs',
    
    # Temporary files
    '.tmp',
    'temp',
    '*.tmp',
    
    # Database files (keep schema, exclude data)
    '*.db',
    '*.sqlite',
    '*.sqlite3',
    
    # Archives (don't include other archives)
    '*.zip',
    '*.tar.gz',
    '*.tar',
    '*.rar',
]

# 📋 File suffixes to EXCLUDE
EXCLUDE_SUFFIXES = [
    '.log',
    '.tmp',
    '.cache',
    '.pid',
    '.lock',
    '.bak',
    '.backup',
    '.old',
]

# 💎 CRITICAL files that MUST be included regardless of other rules
FORCE_INCLUDE = [
    'CLAUDE.md',
    'README.md',
    'package.json',
    'requirements.txt',
    'MANIFEST.yaml',
    'docs/DEV_MEMORY_OS_ROADMAP.md',
    'KRINS_EXPORT_BUNDLE.md',
    'API_DOCUMENTATION.md',
]

def should_exclude(file_path, base_path):
    """
    Determine if a file should be excluded from the ZIP.
    Returns True if file should be excluded, False if it should be included.
    """
    rel_path = os.path.relpath(file_path, base_path)
    
    # Force include critical files
    for critical_file in FORCE_INCLUDE:
        if rel_path.endswith(critical_file) or rel_path == critical_file:
            print(f"  ✅ FORCE INCLUDE: {rel_path}")
            return False
    
    # Check if path contains any excluded directories
    path_parts = Path(rel_path).parts
    for exclude in EXCLUDES:
        if exclude in path_parts:
            return True
        if rel_path.startswith(exclude):
            return True
    
    # Check file suffixes
    for suffix in EXCLUDE_SUFFIXES:
        if rel_path.endswith(suffix):
            return True
    
    return False

def calculate_sha256(file_path):
    """Calculate SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def create_manifest(base_path, included_files, archive_path):
    """Create a signed manifest file."""
    manifest_content = f"""# 🧠 Krins Multi-Agent Orchestrator - Archive Manifest
name: "krins-multi-agent-orchestrator"
version: "1.0.0"
created: "{datetime.now().isoformat()}"
archive: "{os.path.basename(archive_path)}"
archive_sha256: "{calculate_sha256(archive_path)}"
total_files: {len(included_files)}

# 📦 Included Components:
components:
  - krin-personal-companion      # Desktop AI companion app
  - ai-team-coordination-backend # FastAPI backend system  
  - react-frontend-interface     # Professional React UI
  - database-system             # PostgreSQL + SQLite schemas
  - mcp-ai-team                 # Multi-agent coordination
  - documentation               # Complete breakthrough docs
  - development-tools           # Build, test, deploy scripts

# 🎯 Key Files Included:
critical_files:
"""
    
    for critical_file in FORCE_INCLUDE:
        if any(f.endswith(critical_file) for f in included_files):
            manifest_content += f"  - {critical_file}\n"
    
    manifest_content += f"""
# 📋 File List ({len(included_files)} files):
files:
"""
    
    for file_path in sorted(included_files):
        rel_path = os.path.relpath(file_path, base_path)
        file_size = os.path.getsize(file_path)
        manifest_content += f"  - path: {rel_path}\n    size: {file_size}\n"
    
    manifest_path = os.path.join(base_path, 'MANIFEST.yaml')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        f.write(manifest_content)
    
    return manifest_path

def create_krins_archive():
    """Create the complete Krins archive."""
    print("🧠 Krins Multi-Agent Orchestrator Archive Creator")
    print("=" * 60)
    
    # Get base directory (project root)
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    archive_name = 'krins-agent-archive.zip'
    archive_path = os.path.join(base_path, archive_name)
    
    print(f"📂 Base directory: {base_path}")
    print(f"📦 Creating archive: {archive_name}")
    print()
    
    # Collect all files to include
    included_files = []
    excluded_count = 0
    
    print("🔍 Scanning files...")
    
    for root, dirs, files in os.walk(base_path):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if not should_exclude(os.path.join(root, d), base_path)]
        
        for file in files:
            file_path = os.path.join(root, file)
            
            if should_exclude(file_path, base_path):
                excluded_count += 1
                continue
            
            included_files.append(file_path)
    
    print(f"✅ Found {len(included_files)} files to include")
    print(f"⏭️  Excluded {excluded_count} files")
    print()
    
    # Create the ZIP archive
    print("📦 Creating ZIP archive...")
    
    with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path in included_files:
            rel_path = os.path.relpath(file_path, base_path)
            zipf.write(file_path, rel_path)
            
            # Show progress for important files
            if any(critical in rel_path for critical in FORCE_INCLUDE[:5]):
                print(f"  ✅ Added: {rel_path}")
    
    # Create manifest
    print()
    print("📋 Creating manifest...")
    manifest_path = create_manifest(base_path, included_files, archive_path)
    
    # Add manifest to archive
    with zipfile.ZipFile(archive_path, 'a', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(manifest_path, 'MANIFEST.yaml')
    
    # Clean up temporary manifest
    os.remove(manifest_path)
    
    # Final statistics
    archive_size = os.path.getsize(archive_path)
    archive_size_mb = archive_size / (1024 * 1024)
    
    print()
    print("🎉 Archive Creation Complete!")
    print("=" * 60)
    print(f"📦 Archive: {archive_name}")
    print(f"📊 Size: {archive_size_mb:.2f} MB ({archive_size:,} bytes)")
    print(f"📁 Files: {len(included_files)}")
    print(f"🔐 SHA-256: {calculate_sha256(archive_path)}")
    print()
    print("🚀 Ready for deployment!")
    print("💝 Fra Krin med kjærlighet - alt du trenger er inkludert! 🧠⚡")

if __name__ == '__main__':
    create_krins_archive()