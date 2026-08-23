#!/usr/bin/env python3
"""S3/SigV4 streaming for oversized mirror assets (GitHub 100MB cap).

Convention (see README): assets larger than S3_MAX_BYTES are stored in a
GCS S3-compatible bucket (`scrape-startup-web-assets`) instead of git.
The mirror keeps a tiny pointer file in place of the bytes, and the replica
server streams the object at request time via a freshly-signed presigned URL.

The signer is dependency-free (stdlib hmac/hashlib): GLM_S3_* env provides
HMAC interop creds (service account granted objectAdmin on the bucket).
"""
import datetime
import hmac
import hashlib
import os
import urllib.parse

S3_MAX_BYTES = 100 * 1024 * 1024  # GitHub hard cap 100 MB
S3_PTR_MAGIC = b"S3PTR "

# bucket lives in the same GCP project; HMAC creds from env (GLM_S3_*)
S3_BUCKET = os.environ.get("S3_ASSET_BUCKET", "scrape-startup-web-assets")
S3_HOST = os.environ.get("S3_HOST", "storage.googleapis.com")
S3_REGION = os.environ.get("GLM_S3_REGION", "us-east-1")


def _credential_scope(date, region=S3_REGION):
    return f"{date}/{region}/s3/aws4_request"


def _hmac_key(date, secret, region=S3_REGION):
    k = hmac.new(("AWS4" + secret).encode(), date.encode(), hashlib.sha256).digest()
    k = hmac.new(k, region.encode(), hashlib.sha256).digest()
    k = hmac.new(k, b"s3", hashlib.sha256).digest()
    return hmac.new(k, b"aws4_request", hashlib.sha256).digest()


def s3_presigned_url(object_key, method="GET", expires=3600,
                     access_id=None, secret=None):
    """Presigned SigV4 URL for one object; valid `expires` seconds."""
    access_id = access_id or os.environ["GLM_S3_ACCESS_ID"]
    secret = secret or os.environ["GLM_S3_SECRET"]
    now = datetime.datetime.now(datetime.timezone.utc)
    amz_date = now.strftime("%Y%m%dT%H%M%SZ")
    date = now.strftime("%Y%m%d")
    scope = _credential_scope(date)
    query = {
        "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
        "X-Amz-Credential": f"{access_id}/{scope}",
        "X-Amz-Date": amz_date,
        "X-Amz-Expires": str(expires),
        "X-Amz-SignedHeaders": "host",
    }
    canonical_query = "&".join(
        f"{urllib.parse.quote(k, safe='')}={urllib.parse.quote(query[k], safe='')}"
        for k in sorted(query)
    )
    canonical_uri = "/" + S3_BUCKET + "/" + object_key
    canonical_headers = f"host:{S3_HOST}\n"
    canonical_request = "\n".join([
        method, canonical_uri, canonical_query, canonical_headers,
        "host", "UNSIGNED-PAYLOAD",
    ])
    string_to_sign = "\n".join([
        "AWS4-HMAC-SHA256", amz_date, scope,
        hashlib.sha256(canonical_request.encode()).hexdigest(),
    ])
    sig = hmac.new(_hmac_key(date, secret), string_to_sign.encode(),
                   hashlib.sha256).hexdigest()
    return f"https://{S3_HOST}{canonical_uri}?{canonical_query}&X-Amz-Signature={sig}"


def s3_upload(key, body, content_type=None, access_id=None, secret=None):
    """Upload `body` bytes to one object via presigned PUT (SigV4)."""
    import urllib.request
    expires = 3600
    url = s3_presigned_url(key, method="PUT", expires=expires,
                           access_id=access_id, secret=secret)
    headers = {"Content-Length": str(len(body))}
    if content_type:
        headers["Content-Type"] = content_type
    req = urllib.request.Request(url, method="PUT", data=body, headers=headers)
    with urllib.request.urlopen(req, timeout=600) as r:
        return r.status
