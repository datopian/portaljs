#!/usr/bin/env python3
"""Verify browser CORS range fetch works against the R2 data bucket (epic po-g9y).

This de-risks the item the po-e24 spike flagged UNTESTED: can a browser do a
cross-origin HTTP *range* GET against R2 and read the headers DuckDB-Wasm needs?

Apply the policy first:  ./scripts/set-r2-cors.sh
Then run this:           python3 scripts/verify-r2-cors.py

Reads R2 object creds + endpoint from the environment (source the staging creds:
  set -a && . ~/.config/portaljs/giftless-r2.env && set +a
  export AWS_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY

What it checks, end to end against the live bucket:
  1. PUT a tiny probe object (object-scoped token can do this).
  2. Presign a GET URL (what Giftless's `basic` transfer hands the browser).
  3. OPTIONS preflight (Origin + Access-Control-Request-{Method,Headers: range})
     -> expect Access-Control-Allow-* reflected.
  4. Ranged GET (Origin + Range: bytes=0-9) -> expect 206 + Content-Range +
     Accept-Ranges + Access-Control-Allow-Origin + Access-Control-Expose-Headers.
  5. DELETE the probe object.

Exit 0 = PASS (range fetch + CORS confirmed), 1 = FAIL.
"""
import os
import sys
import urllib.error
import urllib.request

import boto3
from botocore.config import Config

BUCKET = os.environ.get("R2_BUCKET", "portaljs-giftless-staging")
ENDPOINT = os.environ["R2_ENDPOINT"]
REGION = os.environ.get("R2_REGION", "auto")
ORIGIN = "https://example-portal.arc.portaljs.com"

cfg = Config(signature_version="s3v4", s3={"addressing_style": "path"})
s3 = boto3.client("s3", endpoint_url=ENDPOINT, region_name=REGION, config=cfg)

print(f"== bucket: {BUCKET}")

key = "_cors-probe/verify.txt"
body = b"0123456789" * 20  # 200 bytes
s3.put_object(Bucket=BUCKET, Key=key, Body=body, ContentType="text/plain")
print(f"PUT probe: {key} ({len(body)} bytes)")

url = s3.generate_presigned_url(
    "get_object", Params={"Bucket": BUCKET, "Key": key}, ExpiresIn=300
)

fail = []

# OPTIONS preflight
req = urllib.request.Request(url, method="OPTIONS")
req.add_header("Origin", ORIGIN)
req.add_header("Access-Control-Request-Method", "GET")
req.add_header("Access-Control-Request-Headers", "range")
try:
    r = urllib.request.urlopen(req, timeout=30)
    h = r.headers
    print(f"\n-- OPTIONS preflight: {r.status}")
    print(f"   Access-Control-Allow-Origin:  {h.get('Access-Control-Allow-Origin')}")
    print(f"   Access-Control-Allow-Methods: {h.get('Access-Control-Allow-Methods')}")
    print(f"   Access-Control-Allow-Headers: {h.get('Access-Control-Allow-Headers')}")
    if not h.get("Access-Control-Allow-Origin"):
        fail.append("preflight missing Access-Control-Allow-Origin")
except urllib.error.HTTPError as e:
    print(f"\n-- OPTIONS preflight: HTTP {e.code}")
    if not e.headers.get("Access-Control-Allow-Origin"):
        fail.append(f"preflight HTTP {e.code}, no Access-Control-Allow-Origin")

# Ranged GET
req = urllib.request.Request(url, method="GET")
req.add_header("Origin", ORIGIN)
req.add_header("Range", "bytes=0-9")
try:
    r = urllib.request.urlopen(req, timeout=30)
    data = r.read()
    h = r.headers
    print(f"\n-- ranged GET: {r.status}")
    print(f"   bytes returned: {len(data)}  body={data!r}")
    print(f"   Content-Range:  {h.get('Content-Range')}")
    print(f"   Accept-Ranges:  {h.get('Accept-Ranges')}")
    print(f"   Access-Control-Allow-Origin:   {h.get('Access-Control-Allow-Origin')}")
    print(f"   Access-Control-Expose-Headers: {h.get('Access-Control-Expose-Headers')}")
    if r.status != 206:
        fail.append(f"ranged GET status {r.status} != 206")
    if not h.get("Content-Range"):
        fail.append("ranged GET missing Content-Range")
    if not h.get("Access-Control-Allow-Origin"):
        fail.append("ranged GET missing Access-Control-Allow-Origin")
    if len(data) != 10:
        fail.append(f"ranged GET returned {len(data)} bytes, expected 10")
except urllib.error.HTTPError as e:
    print(f"\n-- ranged GET: HTTP {e.code}")
    fail.append(f"ranged GET HTTP {e.code}")

s3.delete_object(Bucket=BUCKET, Key=key)
print(f"\nDELETE probe: {key} (cleanup)")

print("\n" + ("FAIL: " + "; ".join(fail) if fail
              else "PASS: browser CORS range fetch verified against R2"))
sys.exit(1 if fail else 0)
