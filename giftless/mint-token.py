#!/usr/bin/env python3
"""Mint a Giftless JWT for a Git LFS client.

Giftless authorizes LFS requests by reading the ``scopes`` claim. Scope format:

    obj:{org}/{repo}/{oid}:{actions}      # actions: read,write,verify or *

This mints a token granting the chosen actions on every object in one repo.

Algorithms:
  * HS256 (default) — one shared symmetric secret, no third-party deps. Staging /
    local. Key is the shared ``jwt_key``.
  * RS256 — production (po-g9y.11). Sign with the issuer's PRIVATE key
    (``jwt_private_key``); Giftless verifies with the matching public key. Needs
    the ``cryptography`` package (pure stdlib can't do RSA).

Usage:
    python3 mint-token.py --org datopian --repo portaljs-catalog
    python3 mint-token.py --org acme --repo data --actions read --ttl 3600
    python3 mint-token.py --org acme --repo data --key-file ./jwt_key --sub ci
    python3 mint-token.py --org datopian --repo p --algorithm RS256 \
        --key-file ./jwt_private_key            # prod: sign with the private key

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

# Must match giftless.yaml `key_id` and the Arc issuer (cloud/api/src/lfs.ts), so
# tokens minted here pass Giftless's kid enforcement (po-g9y.13). `aud` is NOT set:
# giftless 1.7.1's verifier rejects any aud claim (see lfs.ts note).
KEY_ID = "giftless-rs256-1"
ISSUER = "arc.portaljs.com"


def _b64url(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _sign_rs256(signing_input: str, private_key_pem: str) -> bytes:
    """RSA-SHA256 signature over signing_input using a PEM private key.

    Pure stdlib has no RSA, so the ``cryptography`` package must be installed.
    """
    try:
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import padding
    except ImportError as exc:  # depends on host env
        raise SystemExit(
            "RS256 needs the 'cryptography' package (pip install cryptography). "
            "Pure stdlib cannot sign RSA."
        ) from exc
    key = serialization.load_pem_private_key(private_key_pem.encode(), password=None)
    return key.sign(signing_input.encode(), padding.PKCS1v15(), hashes.SHA256())


def mint(
    key: str, org: str, repo: str, actions: str, ttl: int, sub: str, algorithm: str
) -> str:
    now = int(time.time())
    header = {"alg": algorithm, "typ": "JWT", "kid": KEY_ID}
    payload = {
        "sub": sub,
        "iss": ISSUER,
        "iat": now,
        "nbf": now,
        "exp": now + ttl,
        # Access to every object (oid wildcard) in this one repo.
        "scopes": [f"obj:{org}/{repo}/*:{actions}"],
    }
    signing_input = (
        _b64url(json.dumps(header, separators=(",", ":")).encode())
        + "."
        + _b64url(json.dumps(payload, separators=(",", ":")).encode())
    )
    if algorithm == "HS256":
        sig = hmac.new(key.encode(), signing_input.encode(), hashlib.sha256).digest()
    elif algorithm == "RS256":
        sig = _sign_rs256(signing_input, key)
    else:
        raise SystemExit(f"unsupported algorithm: {algorithm} (use HS256 or RS256)")
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
        "--algorithm",
        default="HS256",
        choices=["HS256", "RS256"],
        help="HS256 (shared secret, default) or RS256 (sign with the PEM private key)",
    )
    ap.add_argument(
        "--key-file",
        default=os.path.join(os.path.dirname(__file__), "jwt_key"),
        help="HS256 shared key, or RS256 PEM private key (default: ./jwt_key)",
    )
    args = ap.parse_args()
    with open(args.key_file) as fh:
        # HS256 secret is a single line (strip); RS256 PEM must keep its newlines.
        raw = fh.read()
    key = raw if args.algorithm == "RS256" else raw.strip()
    print(mint(key, args.org, args.repo, args.actions, args.ttl, args.sub, args.algorithm))


if __name__ == "__main__":
    main()
