#!/usr/bin/env python3
"""Mint a Giftless JWT for a Git LFS client (HS256, no third-party deps).

Giftless authorizes LFS requests by reading the ``scopes`` claim. Scope format:

    obj:{org}/{repo}/{oid}:{actions}      # actions: read,write,verify or *

This mints a token granting the chosen actions on every object in one repo.

Usage:
    python3 mint-token.py --org datopian --repo portaljs-catalog
    python3 mint-token.py --org acme --repo data --actions read --ttl 3600
    python3 mint-token.py --org acme --repo data --key-file ./jwt_key --sub ci

The token feeds git-lfs as a Bearer header (the smoke test shows how), or as
HTTP Basic with username ``_jwt`` and the token as the password.
"""

import argparse
import base64
import hashlib
import hmac
import json
import os
import time


def _b64url(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def mint(key: str, org: str, repo: str, actions: str, ttl: int, sub: str) -> str:
    now = int(time.time())
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": sub,
        "iat": now,
        "nbf": now,
        "exp": now + ttl,
        # Full access to every object (oid wildcard) in this one repo.
        "scopes": [f"obj:{org}/{repo}/*:{actions}"],
    }
    signing_input = (
        _b64url(json.dumps(header, separators=(",", ":")).encode())
        + "."
        + _b64url(json.dumps(payload, separators=(",", ":")).encode())
    )
    sig = hmac.new(
        key.encode(), signing_input.encode(), hashlib.sha256
    ).digest()
    return signing_input + "." + _b64url(sig)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--org", required=True, help="LFS namespace (org)")
    ap.add_argument("--repo", required=True, help="LFS repo name")
    ap.add_argument(
        "--actions",
        default="read,write,verify",
        help="comma-separated: read,write,verify or * (default: read,write,verify)",
    )
    ap.add_argument("--ttl", type=int, default=3600, help="lifetime in seconds")
    ap.add_argument("--sub", default="lfs-client", help="subject claim")
    ap.add_argument(
        "--key-file",
        default=os.path.join(os.path.dirname(__file__), "jwt_key"),
        help="path to the shared HS256 key (default: ./jwt_key)",
    )
    args = ap.parse_args()
    with open(args.key_file) as fh:
        key = fh.read().strip()
    print(mint(key, args.org, args.repo, args.actions, args.ttl, args.sub))


if __name__ == "__main__":
    main()
