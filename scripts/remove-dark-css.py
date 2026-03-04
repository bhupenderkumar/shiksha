#!/usr/bin/env python3
"""Remove .dark CSS rules from index.css and globals.css"""
import re
import os

ROOT = '/Users/bhupender.kumar/projects/shiksha'

def remove_dark_css_blocks(filepath):
    """Remove CSS rules that target .dark selector."""
    if not os.path.exists(filepath):
        print(f"  Skipped (not found): {filepath}")
        return 0
    
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    result = []
    i = 0
    removed_blocks = 0
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Check if this line starts a .dark rule block or is a dark-specific comment
        is_dark_rule = False
        
        # Match .dark selector lines (e.g., ".dark {", ".dark .text-gray-900 {", ".dark select {", etc.)
        if re.match(r'\s*\.dark[\s{,]', line) or re.match(r'\s*\.dark$', line.rstrip()):
            is_dark_rule = True
        
        # Match body.dark-landing rules
        if re.match(r'\s*body\.dark-landing', line):
            is_dark_rule = True
            
        # Match html:has(body.dark-landing) rules
        if re.match(r'\s*html:has\(body\.dark-landing\)', line):
            is_dark_rule = True
        
        # Also check for multi-selector rules where .dark is in a subsequent selector
        # e.g. ".dark .border-gray-200,\n.dark .border-gray-300 {"
        
        if is_dark_rule:
            # Find the opening { and then skip to matching }
            brace_count = 0
            block_started = False
            
            # First, look ahead from current line for the opening brace
            j = i
            while j < len(lines):
                for ch in lines[j]:
                    if ch == '{':
                        brace_count += 1
                        block_started = True
                    elif ch == '}':
                        brace_count -= 1
                
                j += 1
                
                if block_started and brace_count <= 0:
                    break
            
            # Remove the comment line above if it's a dark mode comment
            if result and re.search(r'dark mode|dark-mode|for dark|in dark', result[-1], re.IGNORECASE):
                result.pop()
                # Also remove blank line before comment if any
                if result and result[-1].strip() == '':
                    result.pop()
            
            removed_blocks += 1
            i = j
            continue
        
        # Check for standalone dark mode comments (without a following .dark rule)
        if re.search(r'/\*.*dark mode.*\*/', stripped, re.IGNORECASE) and not stripped.startswith('/*'):
            # Inline comment referencing dark mode in a regular rule - keep it
            result.append(line)
            i += 1
            continue
        
        # Comments that only describe dark mode sections
        if stripped.startswith('/*') and re.search(r'dark mode|for dark|in dark', stripped, re.IGNORECASE):
            # Check if next non-empty line is a .dark rule
            peek = i + 1
            while peek < len(lines) and lines[peek].strip() == '':
                peek += 1
            if peek < len(lines) and (re.match(r'\s*\.dark', lines[peek]) or re.match(r'\s*body\.dark', lines[peek])):
                # Skip this comment, the dark block handler will skip the rest
                i += 1
                continue
        
        result.append(line)
        i += 1
    
    with open(filepath, 'w') as f:
        f.writelines(result)
    
    return removed_blocks


# Also remove dark mode specific styles section in globals.css
def remove_dark_section_globals(filepath):
    """Remove dark mode sections from globals.css"""
    if not os.path.exists(filepath):
        return 0
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Remove /* Add these dark mode specific styles */ and its content
    # This is a broader section removal
    content = re.sub(
        r'/\*\s*Add these dark mode specific styles\s*\*/.*?(?=\n/\*[^*]|\Z)',
        '',
        content,
        flags=re.DOTALL
    )
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return 1
    return 0


css_files = [
    os.path.join(ROOT, 'src/index.css'),
    os.path.join(ROOT, 'src/styles/globals.css'),
]

for f in css_files:
    removed = remove_dark_css_blocks(f)
    print(f"  {f}: removed {removed} .dark CSS blocks")
