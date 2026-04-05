#!/usr/bin/env python3
"""
Extract champion face portraits from a RAID roster screenshot.

Usage:
  python3 scripts/extract_raid_faces.py \
    --input "/absolute/path/to/screenshot.png" \
    --out "/Users/you/project/public/champions/raid-roster-apr03"
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, List, Tuple

from PIL import Image


# (name, x, y, w, h) for visible champion cards in provided screenshot.
CARD_SLOTS: List[Tuple[str, int, int, int, int]] = [
    ("joan", 406, 121, 83, 109),
    ("androc", 531, 121, 83, 109),
    ("lord-champfort", 33, 332, 83, 109),
    ("sethallia", 159, 332, 83, 109),
    ("cillian", 285, 332, 83, 109),
    ("sigmund", 411, 332, 83, 109),
    ("ronda", 537, 332, 83, 109),
    ("black-knight", 659, 332, 83, 109),
    ("staltus", 783, 332, 83, 109),
    ("minaya", 908, 332, 83, 109),
    ("slot-11", 33, 516, 83, 109),
    ("slot-12", 159, 516, 83, 109),
    ("slot-13", 285, 516, 83, 109),
    ("slot-14", 411, 516, 83, 109),
    ("slot-15", 537, 516, 83, 109),
    ("slot-16", 659, 516, 83, 109),
    ("slot-17", 783, 516, 83, 109),
    ("slot-18", 908, 516, 83, 109),
]


def extract_faces(image_path: Path, out_dir: Path) -> List[Dict[str, str]]:
    out_dir.mkdir(parents=True, exist_ok=True)
    img = Image.open(image_path).convert("RGB")
    w, h = img.size
    manifest: List[Dict[str, str]] = []

    for idx, (name, x, y, cw, ch) in enumerate(CARD_SLOTS, start=1):
        # Crop portrait part inside card: top square-ish area.
        face_x0 = x + 4
        face_y0 = y + 4
        face_x1 = x + cw - 4
        face_y1 = y + 78
        # Clamp to image
        face_x0 = max(0, min(face_x0, w - 1))
        face_y0 = max(0, min(face_y0, h - 1))
        face_x1 = max(face_x0 + 1, min(face_x1, w))
        face_y1 = max(face_y0 + 1, min(face_y1, h))

        face = img.crop((face_x0, face_y0, face_x1, face_y1)).resize((96, 96))
        filename = f"{idx:02d}-{name}.png"
        full_path = out_dir / filename
        face.save(full_path, format="PNG", optimize=True)
        manifest.append(
            {
                "id": name,
                "file": filename,
                "portraitUrl": f"/champions/raid-roster-apr03/{filename}",
            }
        )

    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Input screenshot path")
    parser.add_argument("--out", required=True, help="Output directory")
    args = parser.parse_args()

    image_path = Path(args.input)
    out_dir = Path(args.out)
    rows = extract_faces(image_path, out_dir)
    print(f"Extracted {len(rows)} portraits -> {out_dir}")


if __name__ == "__main__":
    main()
