#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

rm -f "$SCRIPT_DIR"/pb_data/*.db
rm -f "$SCRIPT_DIR"/pb_data/*.db-*
rm -rf "$SCRIPT_DIR"/pb_data/.notify

mkdir -p "$SCRIPT_DIR"/pb_data

echo "PocketBase local data cleared."
echo "The next fresh boot will ask you to create a PocketBase superuser."