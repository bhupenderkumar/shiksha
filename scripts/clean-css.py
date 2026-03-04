#!/usr/bin/env python3
"""Clean up empty comments and excessive blank lines from CSS files after dark mode removal."""
import re
import os

ROOT = '/Users/bhupender.kumar/projects/shiksha'

def clean_css(filepath):
    if not os.path.exists(filepath):
        return
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Remove empty comment lines (comments with nothing meaningful left)
    # e.g., "  /* Override gray text colors in dark mode to use theme-aware colors */\n\n"
    # where the actual rules were removed
    content = re.sub(r'\s*/\*[^*]*dark[^*]*\*/\s*\n', '\n', content, flags=re.IGNORECASE)
    
    # Remove orphaned comments that describe removed sections  
    content = re.sub(r'\s*/\*\s*Override[^*]*\*/\s*\n', '\n', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*/\*\s*(Fix|Ensure|Remove|Dark|Alert|Badge|Comprehensive|Additional|Text color)[^*]*\*/\s*\n', '\n', content, flags=re.IGNORECASE)
    
    # Remove comment-only lines for color categories (Red badges, Green badges, etc.)
    content = re.sub(r'\s*/\*\s*(Red|Green|Blue|Yellow|Purple|Orange|Pink|Indigo|Cyan|Teal|Slate|Gray|Amber)\s*(badges|text|border|overrides|colors)?[^*]*\*/\s*\n', '\n', content, flags=re.IGNORECASE)
    
    # Collapse 3+ consecutive blank lines into 2
    content = re.sub(r'\n{4,}', '\n\n\n', content)
    
    # Remove trailing whitespace on lines
    content = re.sub(r'[ \t]+\n', '\n', content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        removed = len(original) - len(content)
        print(f"  {filepath}: cleaned up ({removed} chars removed)")
    else:
        print(f"  {filepath}: no changes needed")

css_files = [
    os.path.join(ROOT, 'src/index.css'),
    os.path.join(ROOT, 'src/styles/globals.css'),
]

for f in css_files:
    clean_css(f)
