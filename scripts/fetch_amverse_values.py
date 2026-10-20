#!/usr/bin/env python3
"""
Download Adopt Me guide values from AMVerse's public pets API and save
elvebreddvalues.json (Elvebredd columns, platform MULTIPLIER applied).

Also builds src/data/display-values.snapshot.json for the lobby display catalog.

Important:
- Community estimates, not official game prices.
- Display-only — not for settlement.
- AMVerse requires a short-lived X-AMV-Token from /api/challenge.
"""
from __future__ import annotations

import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
OUT_RAW = ROOT / "src" / "data" / "elvebreddvalues.json"
OUT_SNAPSHOT = ROOT / "src" / "data" / "display-values.snapshot.json"

BASE = "https://amverse.co"
SOURCE_PAGE = f"{BASE}/values"
MULTIPLIER = 2
PAGE_SIZE = 100
UA = "Mozilla/5.0 (compatible; adopt-luck-values-export/1.0)"


def slugify(name: str) -> str:
    s = name.casefold().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-") or "item"


def get_token(session: requests.Session) -> str:
    r = session.get(f"{BASE}/api/challenge", timeout=30)
    r.raise_for_status()
    token = r.json().get("token")
    if not token:
        raise RuntimeError("Challenge endpoint returned no token.")
    return token


def api_get(session: requests.Session, path: str, token: str) -> dict:
    r = session.get(
        f"{BASE}{path}",
        headers={"X-AMV-Token": token, "Accept": "application/json"},
        timeout=60,
    )
    if r.status_code == 403:
        token = get_token(session)
        r = session.get(
            f"{BASE}{path}",
            headers={"X-AMV-Token": token, "Accept": "application/json"},
            timeout=60,
        )
        session.headers["X-AMV-Token"] = token
    r.raise_for_status()
    return r.json()


def scale(v: float | None) -> float | None:
    if v is None:
        return None
    return round(float(v) * MULTIPLIER, 6)


def abs_image(url: str | None) -> str | None:
    if not url:
        return None
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if url.startswith("/"):
        return f"https://data.amverse.co{url}"
    return f"https://data.amverse.co/{url}"


def fetch_all_pets(session: requests.Session) -> list[dict]:
    pets: list[dict] = []
    offset = 0
    total = None
    while True:
        path = (
            f"/api/pets?hasValues=true&source=both&limit={PAGE_SIZE}"
            f"&offset={offset}&sort=name&sortDir=asc"
        )
        data = api_get(session, path, session.headers.get("X-AMV-Token", ""))
        batch = data.get("pets") or []
        if total is None:
            total = data.get("total")
            print(f"Fetching {total} pets…")
        pets.extend(batch)
        print(f"  offset={offset} got={len(batch)} total_so_far={len(pets)}")
        if not data.get("hasMore") or not batch:
            break
        offset += PAGE_SIZE
        time.sleep(0.15)
    return pets


def to_raw_entry(pet: dict) -> dict | None:
    elve = pet.get("elve") or {}
    regular = elve.get("rvalue")
    neon = elve.get("nvalue")
    mega = elve.get("mvalue")
    if all(v is None for v in (regular, neon, mega)):
        return None
    return {
        "petId": pet.get("petId"),
        "name": pet.get("name"),
        "rarity": pet.get("rarity"),
        "category": pet.get("category"),
        "imageUrl": abs_image(pet.get("imageUrl")),
        "regular": scale(regular),
        "neon": scale(neon),
        "mega": scale(mega),
        "source_raw": {
            "elve_regular": regular,
            "elve_neon": neon,
            "elve_mega": mega,
        },
    }


def to_snapshot_items(entries: list[dict]) -> list[dict]:
    items: list[dict] = []
    for entry in entries:
        base = slugify(entry["name"])
        for variant, amount in (
            ("", entry.get("regular")),
            ("-neon", entry.get("neon")),
            ("-mega", entry.get("mega")),
        ):
            if amount is None:
                continue
            label = entry["name"]
            if variant == "-neon":
                label = f"Neon {entry['name']}"
            elif variant == "-mega":
                label = f"Mega {entry['name']}"
            items.append(
                {
                    "id": f"pet-{base}{variant}",
                    "name": label,
                    "amount": amount,
                    "rarity": entry.get("rarity"),
                    "imageUrl": entry.get("imageUrl"),
                }
            )
    items.sort(key=lambda x: (-float(x["amount"]), x["name"].casefold()))
    return items


def main() -> None:
    session = requests.Session()
    session.headers.update({"User-Agent": UA})
    token = get_token(session)
    session.headers["X-AMV-Token"] = token

    raw_pets = fetch_all_pets(session)
    entries: list[dict] = []
    seen: set[str] = set()
    for pet in raw_pets:
        entry = to_raw_entry(pet)
        if not entry or not entry.get("name"):
            continue
        key = entry["name"].casefold()
        if key in seen:
            continue
        seen.add(key)
        entries.append(entry)

    as_of = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    raw = {
        "system": "CommunityValues",
        "source": SOURCE_PAGE,
        "source_values": "Elvebredd",
        "aggregator": "AMVerse",
        "multiplier": MULTIPLIER,
        "fetchedAt": as_of,
        "note": (
            "Community-estimated values from AMVerse's Elvebredd columns, "
            f"scaled by platform MULTIPLIER={MULTIPLIER}. "
            "Not official Adopt Me prices. Display only — not for settlement. "
            "May include non-pet items; review before publishing."
        ),
        "count": len(entries),
        "pets": entries,
    }
    OUT_RAW.parent.mkdir(parents=True, exist_ok=True)
    OUT_RAW.write_text(json.dumps(raw, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {len(entries)} entries to {OUT_RAW}")

    items = to_snapshot_items(entries)
    snapshot = {
        "providerId": "elvebredd-amverse-display",
        "sourceLabel": "AMVerse (Elvebredd columns)",
        "sourceUrl": SOURCE_PAGE,
        "unitLabel": "value",
        "asOf": as_of,
        "purpose": "display_only",
        "multiplier": MULTIPLIER,
        "disclaimer": (
            "Display only. Community guide values via AMVerse (Elvebredd columns), "
            f"scaled ×{MULTIPLIER} for this site. Not used for deposits, withdrawals, "
            "buys, sells, or wagers."
        ),
        "items": [
            {
                "id": i["id"],
                "name": i["name"],
                "amount": i["amount"],
                "rarity": i.get("rarity"),
                "imageUrl": i.get("imageUrl"),
            }
            for i in items
        ],
    }
    OUT_SNAPSHOT.write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Saved {len(snapshot['items'])} display items to {OUT_SNAPSHOT}")


if __name__ == "__main__":
    main()
