"""
restore_and_fix.py  —  Run this ONE TIME from the docs folder.

What it does:
1. Restores Deployment_Operations_Manual.md from the backup folder
   (this file was accidentally cleared and needs to be copied back)
2. Fixes mojibake encoding in ALL *.md files in this folder
   (box-drawing chars, arrows, emoji, smart quotes were garbled by
   a double-encoding issue: files were saved as Latin-1/cp1252 then
   re-saved as UTF-8, corrupting every character above U+007F)

Run:
    cd F:\\social-media-app\\docs
    python restore_and_fix.py
"""

import os
import shutil

# ── Step 1: Restore the emptied Deployment_Operations_Manual.md ────────────

docs_dir   = os.path.dirname(os.path.abspath(__file__))
backup_dir = os.path.join(os.path.dirname(docs_dir), 'docs.bak.20260221142640')
backup_src = os.path.join(backup_dir, 'Deployment_Operations_Manual.md')
docs_dst   = os.path.join(docs_dir,   'Deployment_Operations_Manual.md')

if not os.path.exists(backup_dir):
    print(f'ERROR: Backup folder not found: {backup_dir}')
    print('Please manually copy Deployment_Operations_Manual.md from the backup.')
elif os.path.getsize(docs_dst) == 0:
    shutil.copy2(backup_src, docs_dst)
    print(f'RESTORED: Deployment_Operations_Manual.md from backup')
else:
    print(f'SKIP RESTORE: Deployment_Operations_Manual.md already has content')

# ── Step 2: Fix mojibake encoding in all *.md files ────────────────────────

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

print('\nFixing encoding in all .md files...\n')
for fname in sorted(os.listdir(docs_dir)):
    if not fname.endswith('.md'):
        continue
    fpath = os.path.join(docs_dir, fname)
    with open(fpath, 'r', encoding='utf-8-sig') as f:   # utf-8-sig strips BOM
        original = f.read()

    if not needs_fixing(original):
        print(f'  CLEAN  {fname}')
        continue

    fixed = fix_mojibake(original)
    junk_before = sum(1 for c in original if c in MOJIBAKE_CHARS)
    junk_after  = sum(1 for c in fixed    if c in MOJIBAKE_CHARS)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(fixed)

    print(f'  FIXED  {fname}  ({junk_before} junk chars removed, {junk_after} remaining)')

print('\nDone! Re-open files in your editor to see clean characters.')
