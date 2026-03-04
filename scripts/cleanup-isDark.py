#!/usr/bin/env python3
"""Remove remaining isDark dead variable declarations and unused useTheme imports."""
import re
import os
import glob

ROOT = '/Users/bhupender.kumar/projects/shiksha'
os.chdir(ROOT)

files = []
for ext in ['tsx', 'ts']:
    files.extend(glob.glob(f'src/**/*.{ext}', recursive=True))

changed = []
for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    original = content
    
    # Remove: const isDark = theme === 'dark'; or "dark"
    content = re.sub(r'\n\s*const isDark = theme === [\'"]dark[\'"];\s*\n', '\n', content)
    
    # Remove: const { theme } = useTheme(); if 'theme' is no longer used after removing isDark
    # Check if 'theme' is still referenced after removal
    lines = content.split('\n')
    new_lines = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        # Check for useTheme destructuring with only theme
        if re.match(r'const \{ theme \} = useTheme\(\);', stripped) or \
           re.match(r'const \{ theme, toggleTheme \} = useTheme\(\);', stripped) or \
           re.match(r'const \{ theme \} = useTheme\(\{[^}]*\}\);', stripped):
            # Check if 'theme' is used elsewhere in the file (besides this line and isDark line)
            rest = '\n'.join(lines[:i] + lines[i+1:])
            # Remove isDark declaration from rest for checking
            rest = re.sub(r'const isDark = theme === [\'"]dark[\'"];', '', rest)
            if 'theme' not in rest and 'toggleTheme' not in rest:
                continue  # Skip this line (remove it)
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    # Remove orphaned useTheme import if useTheme is no longer used
    if 'useTheme' not in content.replace("import { useTheme }", "").replace("import useTheme", "").replace("from '@/hooks/useTheme'", "").replace('from "@/hooks/useTheme"', '').replace("from '@/lib/theme-provider'", "").replace('from "@/lib/theme-provider"', ''):
        # Remove the import line
        content = re.sub(r"import \{ useTheme \} from ['\"]@/hooks/useTheme['\"];\s*\n", '', content)
        content = re.sub(r"import \{ useTheme \} from ['\"]@/lib/theme-provider['\"];\s*\n", '', content)
        content = re.sub(r"import useTheme from ['\"]@/hooks/useTheme['\"];\s*\n", '', content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        changed.append(filepath)

print(f'Cleaned up {len(changed)} files:')
for f in changed:
    print(f'  {f}')
