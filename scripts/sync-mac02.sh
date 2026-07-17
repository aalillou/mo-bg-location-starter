#!/usr/bin/env bash
#
# Mirror the starter → Mac02 (ssh host `mac-work`) for iOS device builds.
#
# Mac02 is the iOS build rig. Only the JS/TS + Expo config source crosses:
# node_modules, ios/, android/ and .git are Mac02-local (it runs its own
# `npm install` + `expo prebuild`, and prebuild REGENERATES native from source
# — never rsync native dirs, they'd fight the remote toolchain). Matches the
# proven one-liner in study/expo/notes.txt.
#
# Flow: (1) tsc --noEmit gate — never ship broken TS to the rig; (2) rsync;
#       (3) md5 canary on App.tsx both sides to prove the copy landed.
#
# Usage:
#   scripts/sync-mac02.sh            # typecheck, sync, verify
#   scripts/sync-mac02.sh --no-check # skip the tsc gate (sync only)
#   npm run sync:ios                 # same, via package.json
#
# NOT a --delete mirror (faithful to the notes.txt command): a file deleted
# locally is NOT pruned on Mac02. After removing/renaming a source file, add
# --delete to the rsync below for that run, or delete it on the rig by hand.
#
set -euo pipefail

REMOTE_HOST="${MAC02_HOST:-mac-work}"
REMOTE_DIR="${MAC02_DIR:-/Users/mo/projects/helpcare/study/expo/mo-bg-location-starter/}"
CANARY="App.tsx"
# Quiets ssh's "Permanently added … to the list of known hosts" first-connect note.
RSH="ssh -o LogLevel=ERROR"

LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$LOCAL_DIR"

if [[ "${1:-}" != "--no-check" ]]; then
  echo "▸ tsc --noEmit"
  npx tsc --noEmit
fi

echo "▸ rsync → ${REMOTE_HOST}:${REMOTE_DIR}"
rsync -a -e "$RSH" \
  --exclude node_modules --exclude ios --exclude android --exclude .git \
  ./ "${REMOTE_HOST}:${REMOTE_DIR}"

echo "▸ verify ${CANARY}"
local_md5="$(md5 -q "$CANARY")"
remote_md5="$($RSH "$REMOTE_HOST" "md5 -q ${REMOTE_DIR}${CANARY}")"
if [[ "$local_md5" == "$remote_md5" ]]; then
  echo "✓ in sync (${CANARY} ${local_md5})"
else
  echo "✗ MISMATCH  local=${local_md5}  remote=${remote_md5}" >&2
  exit 1
fi
