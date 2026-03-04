#!/usr/bin/env python3
"""Remove all dark: Tailwind classes from .tsx, .ts files and clean CSS dark mode rules."""
import re
import glob
import os

ROOT = '/Users/bhupender.kumar/projects/shiksha'
os.chdir(ROOT)

# Find all .tsx and .ts files in src/
files = []
for ext in ['tsx', 'ts']:
    files.extend(glob.glob(f'src/**/*.{ext}', recursive=True))

total_changes = 0
changed_files = []

for filepath in files:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # Remove dark: prefixed Tailwind classes
    # Handles: dark:bg-gray-800, dark:hover:bg-gray-600, dark:focus:ring-offset-gray-800
    # Also handles dark:from-gray-900, dark:via-gray-900, dark:to-gray-800 etc.
    # The pattern matches dark: followed by any valid tailwind class chars
    content = re.sub(r'\s*dark:[a-zA-Z0-9_/\[\]\.:\-]+', '', content)

    if content != original:
        count = len(re.findall(r'dark:[a-zA-Z0-9_/\[\]\.:\-]+', original))
        total_changes += count
        changed_files.append((filepath, count))
        with open(filepath, 'w') as f:
            f.write(content)

print(f'Modified {len(changed_files)} files, removed ~{total_changes} dark: classes')
for f, c in sorted(changed_files, key=lambda x: -x[1]):
    print(f'  {f}: {c} removals')
