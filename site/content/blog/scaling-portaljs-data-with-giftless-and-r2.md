---
title: "Big data, small repo: scaling PortalJS data with Giftless and Cloudflare R2"
description: "Real datasets outgrow git. Here's how PortalJS keeps authoring git-native while the bytes live in object storage — using Giftless (an open-source Git LFS server) backed by Cloudflare R2, wired so your agent handles it for you."
created: 2026-07-01
authors: ['anuveyatsu']
tags:
  - PortalJS
  - Git LFS
  - Giftless
  - Cloudflare R2
  - data portals
  - AI
image: "/static/img/blog/scaling-portaljs-data-with-giftless-and-r2/hero.png"
filetype: 'blog'
---

A data portal is only as good as the data in it. And real data is **big** — multi-hundred-megabyte CSVs, Parquet files, GeoJSON boundaries. The moment you try to put that in a git repo, things break: GitHub rejects files over 100 MB, clones balloon, and your static build chokes trying to bundle it all.

So most portals punt: they link out to a file on some bucket, by hand, and the data drifts away from the code that describes it.

We wanted something better for PortalJS — **keep authoring git-native, but stop shoving bytes into git.** Here's how that works, and why we built it the way we did.

## The idea: pointers in git, bytes in object storage

[Git LFS](https://git-lfs.com/) (Large File Storage) is the right primitive. A tracked file becomes a tiny ~130-byte *pointer* committed to git; the actual bytes are stored elsewhere and fetched on demand. Your repo stays small and fast, your data stays versioned alongside it, and `git` still works exactly as you expect.

The question is *where the bytes go* and *who brokers them*. That's where **Giftless** comes in.

## Giftless + Cloudflare R2

[Giftless](https://github.com/datopian/giftless) is Datopian's open-source, pluggable Git LFS server. We run it on **Cloudflare Containers**, backed by a **Cloudflare R2** bucket (S3-compatible object storage, no egress fees).

The design choice that makes it cheap and fast:

```
git-lfs ──JWT──▶ Giftless ──▶ signs a presigned R2 URL
   │                                    │
   └──── PUT/GET bytes ───────────▶ Cloudflare R2  (directly)
```

**File bytes never transit Giftless.** It only validates your token, brokers the LFS metadata, and signs a short-lived presigned URL. Your client then uploads or downloads straight to R2. That makes the server a light, low-bandwidth, scale-to-zero workload — it costs almost nothing to run and there's no bandwidth bottleneck in front of your data.

R2 is the same storage layer PortalJS Cloud already uses, S3-compatible so any tool speaks to it, and free of the egress fees that make object storage expensive elsewhere.

## You never have to touch any of this

Here's the part that matters for everyday use: **if you don't know what Git LFS is, you never need to.**

In PortalJS, you work with an AI agent. When you run `/portaljs-add-dataset` and point it at a local file, the skill decides where the bytes belong (big local files → R2 via LFS, bundled samples → inline, remote URLs → passthrough) and does the whole dance for you — tracking the file, getting a scoped upload token, pushing the bytes to R2, and registering the dataset in your catalog. No `git lfs track`, no credentials to copy, no manual config.

<video autoPlay loop muted playsInline controls width="100%" style={{ borderRadius: '8px', margin: '1.5rem 0' }} src="https://pub-e2e69b5e239d44368bb32b91a4533c7f.r2.dev/blog/scaling-portaljs-data-with-giftless-and-r2/add-dataset.mp4"></video>

*(This clip streams from a Cloudflare R2 bucket — the same object storage the datasets themselves live in.)*

Then your deployed portal serves that data **straight from R2**. Pair it with DuckDB-Wasm over Parquet and you can query a large dataset right in the browser — no download, no server, range-requesting only the bytes a query needs.

## Auth: the signing key never leaves the server

Git LFS needs authentication, and we didn't want a long-lived secret sitting on anyone's laptop. So PortalJS Arc acts as the **token issuer**: it authenticates you, confirms you own the repo, and mints a **short-lived, repo-scoped RS256 token**. Giftless verifies it with the public key. The private signing key stays a server-side secret — it's never distributed to clients.

Tokens are least-privilege by default (read-only unless you're pushing), scoped to a single repo, and expire in an hour. A clean, boring security posture, which is exactly what you want.

## Open by default

Like the rest of PortalJS, none of this is a lock-in. Giftless is open source and self-hostable: point it at your own S3-compatible bucket and run the same setup without Arc. The `.lfsconfig` in your portal is just a URL — swap it for your own host any time.

## It's live

This is live in production now, backed by Cloudflare R2 — nothing to set up. Spin up a portal, add a real dataset, and watch a 200 MB file land in object storage while your repo stays tiny:

```bash
npm create portaljs@latest my-portal
```

Then tell your agent to add your data. ⭐ [Star us on GitHub](https://github.com/datopian/portaljs) and come build with us in [Discord](https://discord.gg/krmj5HM6He).
