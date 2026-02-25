"""
Fix encoding mojibake in docs/*.md files.

Run this once from the docs folder:
    cd F:\social-media-app\docs
    python fix_encoding.py

Root cause: Files were UTF-8 but opened/saved as Latin-1/cp1252 by an editor,
then re-saved as UTF-8. This garbles box-drawing chars, arrows, emoji and
smart quotes. This script reverses the double-encoding.
"""

import os
import re

CP1252_EXTRA = {
    '\u20ac': bytes([0x80]), '\u201a': bytes([0x82]), '\u0192': bytes([0x83]),
    '\u201e': bytes([0x84]), '\u2026': bytes([0x85]), '\u2020': bytes([0x86]),
    '\u2021': bytes([0x87]), '\u02c6': bytes([0x88]), '\u2030': bytes([0x89]),
    '\u0160': bytes([0x8a]), '\u2039': bytes([0x8b]), '\u0152': bytes([0x8c]),
    '\u017d': bytes([0x8e]), '\u2018': bytes([0x91]), '\u2019': bytes([0x92]),
    '\u201c': bytes([0x93]), '\u201d': bytes([0x94]), '\u2022': bytes([0x95]),
    '\u2013': bytes([0x96]), '\u2014': bytes([0x97]), '\u02dc': bytes([0x98]),
    '\u2122': bytes([0x99]), '\u0161': bytes([0x9a]), '\u203a': bytes([0x9b]),
    '\u0153': bytes([0x9c]), '\u017e': bytes([0x9e]), '\u0178': bytes([0x9f]),
}

MOJIBAKE_CHARS = set(
    '\u00e2\u00c3\u00c2\u00e3\u0080\u0090\u0099\u0093'
    '\u0094\u0091\u0092\u0096\u0097\u0085\u0095\u0086'
)

def fix_mojibake(text):
    buf = bytearray()
    for ch in text:
        if ord(ch) < 128:
            buf.append(ord(ch))
        elif ch in CP1252_EXTRA:
            buf += CP1252_EXTRA[ch]
        else:
            cp = ord(ch)
            if 0x80 <= cp <= 0xFF:
                buf.append(cp)
            else:
                buf += ch.encode('utf-8')
    try:
        return buf.decode('utf-8')
    except UnicodeDecodeError:
        return buf.decode('utf-8', errors='replace')

def needs_fixing(text):
    return sum(1 for c in text if c in MOJIBAKE_CHARS) > 5

def process_file(path):
    with open(path, 'r', encoding='utf-8-sig') as f:   # utf-8-sig strips BOM
        original = f.read()

    if not needs_fixing(original):
        print(f'  SKIP  {os.path.basename(path)} (already clean)')
        return

    fixed = fix_mojibake(original)
    junk_before = sum(1 for c in original if c in MOJIBAKE_CHARS)
    junk_after  = sum(1 for c in fixed    if c in MOJIBAKE_CHARS)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(fixed)

    print(f'  FIXED {os.path.basename(path)} — {junk_before} junk chars removed '
          f'({junk_after} remaining)')

if __name__ == '__main__':
    docs_dir = os.path.dirname(os.path.abspath(__file__))
    print(f'Fixing encoding in: {docs_dir}\n')

    fixed_count = 0
    for fname in sorted(os.listdir(docs_dir)):
        if fname.endswith('.md'):
            process_file(os.path.join(docs_dir, fname))
            fixed_count += 1

    print(f'\nDone. Processed {fixed_count} markdown files.')
    print('Re-open the files in VS Code / any editor to see clean characters.')
