#!/usr/bin/env python3
"""
Remove all dark mode infrastructure from the project:
1. Replace isDark ternaries with light-only values
2. Remove dark object properties from config objects
3. Remove useTheme imports and isDark variables where possible
4. Clean up CSS dark mode rules
"""
import re
import os
import glob

ROOT = '/Users/bhupender.kumar/projects/shiksha'
os.chdir(ROOT)

def process_file(filepath):
    """Process a single file to remove dark mode references."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # 1. Replace `isDark ? "dark-value" : "light-value"` with just "light-value"
    # Handles both single and double quotes, template literals, and multi-word values
    # Pattern: isDark ? 'dark' : 'light' => 'light'
    # Also: isDark ? "dark" : "light" => "light"
    # Also: isDark ? `dark` : `light` => `light`
    for quote in ['"', "'", '`']:
        # isDark ? 'dark' : 'light'
        pattern = rf'isDark\s*\?\s*{re.escape(quote)}[^{re.escape(quote)}]*{re.escape(quote)}\s*:\s*({re.escape(quote)}[^{re.escape(quote)}]*{re.escape(quote)})'
        content = re.sub(pattern, r'\1', content)
    
    # Handle: isDark ? config.something.dark : config.something.light => config.something.light
    content = re.sub(
        r'isDark\s*\?\s*([a-zA-Z_.]+)\.dark\s*:\s*([a-zA-Z_.]+)\.light',
        r'\2.light',
        content
    )
    
    # Handle: isDark\n? "value" : "value" (multi-line ternaries)
    for quote in ['"', "'", '`']:
        pattern = rf'isDark\s*\n\s*\?\s*{re.escape(quote)}[^{re.escape(quote)}]*{re.escape(quote)}\s*:\s*({re.escape(quote)}[^{re.escape(quote)}]*{re.escape(quote)})'
        content = re.sub(pattern, r'\1', content)
    
    # Handle: !isDark ? "light-value" : "dark-value" => "light-value"
    for quote in ['"', "'", '`']:
        pattern = rf'!isDark\s*\?\s*({re.escape(quote)}[^{re.escape(quote)}]*{re.escape(quote)})\s*:\s*{re.escape(quote)}[^{re.escape(quote)}]*{re.escape(quote)}'
        content = re.sub(pattern, r'\1', content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

# Process all tsx/ts files
files = []
for ext in ['tsx', 'ts']:
    files.extend(glob.glob(f'src/**/*.{ext}', recursive=True))

changed = []
for f in files:
    if process_file(f):
        changed.append(f)

print(f"Resolved isDark ternaries in {len(changed)} files:")
for f in changed:
    print(f"  {f}")
