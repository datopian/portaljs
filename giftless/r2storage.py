"""Cloudflare R2 storage backend for Giftless.

Giftless 0.5.0's bundled ``AmazonS3Storage`` calls a bare ``boto3.client("s3")``
with no ``endpoint_url``, and the image's bundled botocore (1.20.54) is too old to
honor the ``AWS_ENDPOINT_URL`` env var (that landed in botocore ~1.31). So we
subclass it and rebuild the boto3 clients pointed at the R2 S3-compatible endpoint
with path-style addressing and SigV4.

Proven end-to-end against R2 in spike po-e24 (119 MB CSV round-trip, byte-exact).

Wired in via ``storage_class: r2storage:R2Storage`` in giftless.yaml. This file is
COPYd into /app (on PYTHONPATH) by the Dockerfile.

Env:
  R2_ENDPOINT   required, e.g. https://<account>.r2.cloudflarestorage.com
  R2_REGION     optional, default "auto"
  AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY  R2 token creds (read by boto3)
"""

import os

import boto3
from botocore.config import Config

from giftless.storage.amazon_s3 import AmazonS3Storage


class R2Storage(AmazonS3Storage):
    """AmazonS3Storage pointed at a Cloudflare R2 bucket via a custom endpoint."""

    def __init__(self, bucket_name, path_prefix=None, **_):
        self.bucket_name = bucket_name
        self.path_prefix = path_prefix
        endpoint = os.environ["R2_ENDPOINT"]
        region = os.environ.get("R2_REGION", "auto")
        cfg = Config(signature_version="s3v4", s3={"addressing_style": "path"})
        self.s3 = boto3.resource(
            "s3", endpoint_url=endpoint, region_name=region, config=cfg
        )
        self.s3_client = boto3.client(
            "s3", endpoint_url=endpoint, region_name=region, config=cfg
        )
