---
name: PocketBase Schema Integration
description: "Use when changing PocketBase collections, hooks, migrations, Docker startup, or frontend forms and views that read or write PocketBase records. Covers dynamic schemas, auth bootstrap, API rules, and runtime validation."
---
# PocketBase Schema Integration

- Treat content collections as user-defined. Do not add or commit migrations for a specific example collection such as `Places` unless the user explicitly requests that collection as part of the shared application schema.
- Keep collection discovery dynamic. Do not hardcode a collection name, field list, or field type into the frontend when PocketBase metadata can provide it.
- Preserve compatibility with existing field aliases where practical: `Name`/`Title`/`title`, `Notes`/`description`, `Location`/`location`, and `Tags`/`tags`.
- Match request payloads to the actual PocketBase field type. JSON fields should receive JSON-compatible values; select fields must use configured options; multi-select fields receive arrays; optional blank fields should be omitted when an empty value is invalid.
- Expose only JSON-serializable metadata from PocketBase hooks. Avoid returning PocketBase runtime accessors or methods directly.
- Keep first-run behavior intact: optional `PB_SUPERUSER_EMAIL` and `PB_SUPERUSER_PASSWORD` may bootstrap the superuser, while unset credentials must preserve the installer flow through the public frontend origin.
- Treat `8080` as an internal container address only. User-facing installer and dashboard links must use the public frontend origin, normally `http://localhost:3001` locally.
- Distinguish authentication failures from permission failures. A `401` may clear the session; a `403` should remain a visible authorization error and must not log the user out.
- After schema or hook changes, validate the live `/api/app/collections` endpoint through the public Compose address and verify that existing auth and content collections are still reported.
- Before finishing frontend schema work, validate the touched files with editor diagnostics and `git diff --check`.
