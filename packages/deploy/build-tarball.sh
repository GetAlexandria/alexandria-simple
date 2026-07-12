#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ROOT="$SCRIPT_DIR"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MANIFEST_PATH="$DEPLOY_ROOT/dist-include.txt"
VERSION_PATH="$REPO_ROOT/VERSION"
NORMALIZED_TIMESTAMP="202401010000"

usage() {
	echo "Usage: packages/deploy/build-tarball.sh [output-dir]" >&2
}

require_command() {
	local command_name="$1"
	if ! command -v "$command_name" >/dev/null 2>&1; then
		echo "Error: required command not found: $command_name" >&2
		exit 1
	fi
}

cleanup() {
	if [ -n "${STAGING_DIR:-}" ] && [ -d "${STAGING_DIR:-}" ]; then
		rm -rf "$STAGING_DIR"
	fi
}

if [ "$#" -gt 1 ]; then
	usage
	exit 1
fi

require_command rsync
require_command tar
require_command gzip
require_command find
require_command sort
require_command touch
require_command mktemp
require_command sed

if [ ! -f "$MANIFEST_PATH" ]; then
	echo "Error: manifest not found: $MANIFEST_PATH" >&2
	exit 1
fi

if [ ! -f "$VERSION_PATH" ]; then
	echo "Error: VERSION file not found: $VERSION_PATH" >&2
	exit 1
fi

VERSION="$(tr -d '[:space:]' <"$VERSION_PATH")"
if [ -z "$VERSION" ]; then
	echo "Error: VERSION file is empty" >&2
	exit 1
fi

OUTPUT_DIR="${1:-${ALEXANDRIA_TARBALL_OUTPUT_DIR:-$REPO_ROOT}}"
mkdir -p "$OUTPUT_DIR"
OUTPUT_DIR="$(cd "$OUTPUT_DIR" && pwd)"

PACKAGE_DIR_NAME="alexandria-v${VERSION}"
ARCHIVE_NAME="${PACKAGE_DIR_NAME}.tar.gz"
ARCHIVE_PATH="$OUTPUT_DIR/$ARCHIVE_NAME"
ARCHIVE_LIST_PATH=""
STAGING_DIR="$(mktemp -d "${TMPDIR:-/tmp}/alexandria-tarball.XXXXXX")"
PAYLOAD_DIR="$STAGING_DIR/$PACKAGE_DIR_NAME"

trap cleanup EXIT

mkdir -p "$PAYLOAD_DIR"

rsync \
	-a \
	-r \
	--files-from="$MANIFEST_PATH" \
	--exclude=".git/" \
	--exclude=".github/" \
	--exclude="node_modules/" \
	--exclude="contributor-skills/" \
	--exclude="*.test.ts" \
	"$REPO_ROOT/" \
	"$PAYLOAD_DIR/"

# Strip the workspaces field from package.json — the tarball does not ship
# workspace packages, and a stale workspaces entry causes bun install to
# detect lockfile drift and fail.
sed -i.bak '/"workspaces"/,/]/d' "$PAYLOAD_DIR/package.json"
rm -f "$PAYLOAD_DIR/package.json.bak"

find "$PAYLOAD_DIR" -exec touch -t "$NORMALIZED_TIMESTAMP" {} +

ARCHIVE_LIST_PATH="$STAGING_DIR/archive.lst"
(
	cd "$STAGING_DIR"
	LC_ALL=C find "$PACKAGE_DIR_NAME" \( -type f -o -type l \) -print | LC_ALL=C sort >"$ARCHIVE_LIST_PATH"
	COPYFILE_DISABLE=1 tar --format=ustar -cf - -T "$ARCHIVE_LIST_PATH" | gzip -n >"$ARCHIVE_PATH"
)

echo "Built tarball: $ARCHIVE_PATH"
