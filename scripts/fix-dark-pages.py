#!/usr/bin/env python3
"""Convert dark-themed pages/components to light theme."""

import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Common dark-to-light class mappings
REPLACEMENTS = [
    ('bg-zinc-900/50', 'bg-white/80 shadow-sm'),
    ('bg-zinc-900/80', 'bg-white/80 shadow-sm'),
    ('border-zinc-800', 'border-gray-200'),
    ('bg-zinc-800/50', 'bg-gray-50'),
    ('border-zinc-700', 'border-gray-200'),
    ('bg-zinc-800', 'bg-gray-100'),
    ('bg-zinc-700', 'bg-gray-200'),
    ('text-zinc-300', 'text-gray-700'),
    ('text-zinc-400', 'text-gray-500'),
    ('text-zinc-500', 'text-gray-400'),
    ('hover:bg-zinc-700', 'hover:bg-gray-100'),
    ('focus:bg-zinc-700', 'focus:bg-gray-100'),
    ('hover:bg-zinc-800', 'hover:bg-gray-100'),
    ('placeholder:text-zinc-500', 'placeholder:text-gray-400'),
]

# Files to process with the common replacements
FILES = [
    'src/components/admission/AdmissionEnquiryForm.tsx',
]

def process_file(filepath, extra_replacements=None):
    full_path = os.path.join(BASE, filepath)
    if not os.path.exists(full_path):
        print(f"  SKIP (not found): {filepath}")
        return

    with open(full_path, 'r') as f:
        content = f.read()

    original = content
    all_replacements = REPLACEMENTS + (extra_replacements or [])

    for old, new in all_replacements:
        content = content.replace(old, new)

    if content != original:
        with open(full_path, 'w') as f:
            f.write(content)
        print(f"  UPDATED: {filepath}")
    else:
        print(f"  NO CHANGES: {filepath}")

if __name__ == '__main__':
    for f in FILES:
        process_file(f, [
            ('text-white', 'text-gray-900'),
            ('text-violet-400', 'text-violet-600'),
            ('text-emerald-400', 'text-emerald-600'),
            ('text-red-400', 'text-red-500'),
        ])
    print("Done!")
