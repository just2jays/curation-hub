#!/bin/sh
set -eu

installer_file=/pb/pb_data/installer-url
rm -f "$installer_file"

if [ -n "${PB_SUPERUSER_EMAIL:-}" ] || [ -n "${PB_SUPERUSER_PASSWORD:-}" ]; then
    if [ -z "${PB_SUPERUSER_EMAIL:-}" ] || [ -z "${PB_SUPERUSER_PASSWORD:-}" ]; then
        echo "PB_SUPERUSER_EMAIL and PB_SUPERUSER_PASSWORD must be set together" >&2
        exit 1
    fi

    /pb/pocketbase superuser upsert "$PB_SUPERUSER_EMAIL" "$PB_SUPERUSER_PASSWORD"
    exec /pb/pocketbase serve --http=0.0.0.0:8080
fi

/pb/pocketbase serve --http=0.0.0.0:8080 2>&1 | while IFS= read -r line; do
    printf '%s\n' "$line"

    installer_hash=$(printf '%s\n' "$line" | sed -n 's/.*\(#[^ ]*\).*/\1/p')
    if [ -n "$installer_hash" ]; then
        printf '%s' "$installer_hash" > "$installer_file"
    fi
done
