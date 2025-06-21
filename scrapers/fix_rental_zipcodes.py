#!/usr/bin/env python3
"""
fix_rental_zipcodes.py
–––––––––––––––
Replace placeholder ZIP codes in rental real-estate CSV.
Keeps every other value exactly as-is.
"""

import sys, csv, pathlib, argparse
import pandas as pd
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
from tenacity import retry, stop_after_attempt, wait_fixed
from tqdm import tqdm

UA = "rental-zip-fixer/1.0 (+https://github.com/your-repo)"

@retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
def _safe_geocode(g, q):
    return g.geocode(q, addressdetails=True, timeout=10)

def main(path):
    src = pathlib.Path(path).expanduser()
    if not src.exists():
        sys.exit(f"File not found: {src}")

    df = pd.read_csv(src, dtype=str, keep_default_na=False)
    if "zipcode" not in df.columns:
        sys.exit("No 'zipcode' column in CSV.")

    geo = Nominatim(user_agent=UA)
    geocode = RateLimiter(lambda q: _safe_geocode(geo, q), min_delay_seconds=1.1, swallow_exceptions=True)

    upd = 0
    tqdm.pandas(desc="Fixing rental ZIPs")

    def patch(row):
        nonlocal upd
        addr = row["address"]
        res  = geocode(addr)
        if res and "postcode" in res.raw["address"]:
            z = res.raw["address"]["postcode"][:5]
            if z and z != row["zipcode"]:
                upd += 1
                return z
        return row["zipcode"]

    df["zipcode"] = df.progress_apply(patch, axis=1)

    out = src.with_name("rental_listings_with_fixed_zips.csv")
    df.to_csv(out, index=False, quoting=csv.QUOTE_MINIMAL)
    print(f"\n✓  Updated {upd} rental ZIP codes.\n→  {out}")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("csv", help="original rental listings CSV")
    main(p.parse_args().csv) 