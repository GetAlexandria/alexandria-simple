## Goal

Move Alexandria release tarballs off Cloudflare Pages so tagged releases can
publish successfully even when compiled `ax` archives exceed the Pages 25 MiB
asset limit.

## Problem

`v0.9.1` updated `alexandria-site`, but the site's Cloudflare Pages deploy
failed because `public/downloads/ax-v0.9.1-linux-x64.tar.gz` was 37.5 MiB.
That left live release surfaces pinned to the previous successful deploy even
though the internal release workflow itself completed.

## Approach

1. Keep small release metadata on the site repo:
   - `public/install.sh`
   - `public/downloads/latest-version.txt`
   - `src/data/version.json`
   - `src/content/changelog/*`
2. Publish large release downloads to Cloudflare R2 behind
   `https://downloads.getalexandria.ai`:
   - `alexandria-plugin-v{VERSION}.tar.gz`
   - `ax-v{VERSION}-{platform}.tar.gz`
   - mirrored `latest-version.txt` for installer version resolution
   - use Cloudflare-native `wrangler r2 object put` in CI instead of S3-style
     access keys
3. Update the installer so default public installs fetch archives from the
   downloads host while preserving self-hosted override behavior.
4. Update release automation, docs, and tests to match the split-host model.

## Acceptance

- Release workflow no longer commits Alexandria tarballs into
  `alexandria-site/public/downloads`.
- Release workflow uploads tarballs plus `latest-version.txt` to R2 with clear
  required secrets and endpoint configuration.
- `install.sh` defaults to `downloads.getalexandria.ai` for archive downloads.
- Site update automation removes previously published Alexandria tarballs from
  the site repo so future Pages deploys can succeed.
- Relevant local tests and dry runs cover the new release split.
