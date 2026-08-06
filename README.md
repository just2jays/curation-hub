# Curator Hub

Curator Hub is a Dockerized PocketBase + static frontend app. A fresh clone can be started locally or on a new server without carrying over any local SQLite state.

## What is tracked

- Application code and container config
- PocketBase migrations and hooks
- Frontend assets

## What is not tracked

- Local PocketBase SQLite files in `pb_data/*.db`
- Local environment overrides in `.env`
- Generated PocketBase notifier state in `pb_data/.notify/`
- Runtime-uploaded public files in `pb_public/`

## Fresh setup

1. Clone the repository.
2. Copy `.env.example` to `.env`.
3. Start the app:

```sh
docker compose up -d --build
```

If your machine uses the standalone Compose binary instead of the Docker CLI plugin, use:

```sh
docker-compose up -d --build
```

4. Visit `http://localhost:3001`.

## First-run behavior

On the first boot, PocketBase starts with an empty local database. This repository no longer seeds app-specific collections on its own.

The frontend will show a first-time setup screen until you create:

- an auth collection named `users`
- at least one base collection for content

The setup screen points you to the PocketBase dashboard and explains how to:

- create the first PocketBase superuser
- create the `users` auth collection for frontend access
- add the first frontend user accounts
- create the first content collection

## Initial admin and users

After the containers are running:

1. Open the PocketBase dashboard at `http://localhost:3001/_/`.
2. Create your PocketBase superuser if this is a brand new database.
3. Create an auth collection named `users`.
4. Add records to the `users` auth collection for anyone who should be allowed into the frontend.
5. Create at least one base collection for content.
6. Sign into the main app with one of those users.

## Deploying to a new server

The minimum flow is:

1. Install Docker and Compose on the server.
2. Clone the repository.
3. Create `.env` from `.env.example`.
4. Run `docker compose up -d --build`.
5. Visit `/_/` through your server URL and create the first PocketBase superuser.
6. Create an auth collection named `users` and add at least one user.
7. Create at least one base collection for content.

## Collection expectations

The frontend no longer depends on collection names like `restaurants` or `people`.

It will discover any PocketBase base collections automatically, but the current UI still works best when your records use a title field named `title` or `Title`.

Optional fields the current UI knows how to display are:

- `description`
- `location`
- `tags`

You are responsible for setting the collection API rules to match your access model. For a simple authenticated setup, allow logged-in users to list, view, create, update, and delete records.