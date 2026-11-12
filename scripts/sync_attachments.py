#!/usr/bin/env python3
"""Validate and update the local community-reported attachment snapshot."""
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
URL = "https://codloadout.gitlab.io/data/mw4-community-attachments.json"
TARGET = ROOT / "data" / "attachments-community.json"
TYPES = {"optic", "muzzle", "barrel", "underbarrel", "magazine", "reargrip", "stock", "laser", "ammunition", "comb", "bolt", "triggeraction", "guard", "cylinder", "firemods"}

def main():
    request = Request(URL, headers={"User-Agent": "Mw4Camo.io-ArsenalSync/1.0", "Accept": "application/json"})
    with urlopen(request, timeout=25) as response:
        data = json.load(response)
    rows = data.get("attachments")
    if data.get("meta", {}).get("status") != "community-reported" or not isinstance(rows, list) or len(rows) < 500:
        raise ValueError("Catalog missing, incomplete, or not tagged community-reported")
    specs = json.loads((ROOT / "data" / "attachments.json").read_text(encoding="utf-8"))["specs"]
    keys, pair_count = set(), 0
    for item in rows:
        if not isinstance(item, dict) or not isinstance(item.get("name"), str) or not 0 < len(item["name"].strip()) <= 120:
            raise ValueError("Invalid attachment name")
        type_key = "".join(c for c in str(item.get("type", "")).lower() if c.isalnum())
        if type_key not in TYPES:
            raise ValueError("Unknown attachment type")
        key = (type_key, item["name"].strip().casefold())
        if key in keys:
            raise ValueError("Duplicate attachment name/type")
        keys.add(key)
        weapons = item.get("weapons")
        if not isinstance(weapons, list) or not weapons or any(w not in specs for w in weapons):
            raise ValueError("Invalid attachment weapon mapping")
        pair_count += len(weapons)
    if pair_count < 1000:
        raise ValueError("Community mapping appears incomplete")
    content = json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n"
    if not TARGET.exists() or TARGET.read_text(encoding="utf-8") != content:
        TARGET.write_text(content, encoding="utf-8")
        print(f"Updated local catalog: {len(rows)} names; {pair_count} weapon links")
    else:
        print(f"Community catalog unchanged: {len(rows)} names")

if __name__ == "__main__":
    main()
