# Sprinklers

Web app for managing a sprinkler controller. Server runs the program and tells a
Raspberry Pi which zone to turn on; client provides the UI.

## Layout

This is an npm workspaces monorepo:

- `client/` — React 18 + Vite SPA. Builds to `client/dist/`.
- `server/` — Node ESM + Express 5 + socket.io. Reads/writes the program file.
- `pi/` — Raspberry Pi controller code (lives on the Pi, not in this repo).

The server and client share a reducer (`programReducer.js`) so program updates
"converge" — actions are dispatched on both sides. The same `getDerivedState`
runs on both to compute zone status from the program + current time.

## Communication

- **Client ↔ server:** REST (`/api/program`, `/api/state`, `/api/updateProgram`)
  + socket.io for `state` and `programUpdate` events.
- **Server ↔ Pi:** persistent socket.io connection. Server tells the Pi to run
  zone N for D seconds; Pi turns the zone off after D seconds even if the
  connection drops, so an internet outage can't leave sprinklers running.

## Auth

Single password protects the web UI:

- POST `/api/login` with `{password}` → sets an `httpOnly` JWT cookie (30 days).
- API routes return 401 on missing/invalid cookie; the client redirects to
  `/login.html` on 401.
- IPs in `config.trustIps` bypass auth (this is how the Pi connects).
- POST `/api/logout` clears the cookie.

`config.json` (gitignored) lives at `server/config/config.json` locally and
`/home/eric/sprinklers/config/config.json` in production:

```json
{
  "passwordHash": "$argon2id$...",
  "jwtSecret": "<random>",
  "trustIps": ["<pi-ip>"]
}
```

Generate a hash:

```bash
node --input-type=module -e "import argon2 from 'argon2'; console.log(await argon2.hash(process.argv[1], { type: argon2.argon2id }))" 'your-password'
```

## Local development

```bash
npm install            # installs both workspaces
npm run dev            # vite (3001) + server (3000) in parallel
```

Vite proxies `/api` and `/socket.io` to `localhost:3000`. Override server
locations with env vars: `PORT`, `PROGRAM_PATH`, `CONFIG_PATH`, `CLIENT_DIST`.

Build the production bundle:

```bash
npm run build          # → client/dist/
npm start              # serves client/dist + API
```

## Deployment

Production runs on a Linode under PM2 + systemd. Deploys are driven by GitHub
Actions on push to `master`:

- `.github/workflows/deploy.yml` SSHes to the server and runs `pm2 deploy`.
- `ecosystem.config.cjs` defines the app and the `production` deploy target.
- `post-deploy` runs `npm ci && npm run build && pm2 startOrReload`.

Runtime files live **outside** the git checkout so deploys don't touch them:

| File | Path |
| --- | --- |
| Code checkout | `/home/eric/sprinklers/source/` (symlinked from `current/`) |
| Program state | `/home/eric/sprinklers/state/program.json` |
| Auth config | `/home/eric/sprinklers/config/config.json` |

### First-time bootstrap

1. Push `master` to GitHub (the deploy workflow will fail on the first run — fine).
2. Add the `DEPLOY_SSH_KEY` repo secret (same key reused across apps).
3. SSH to the server and place `state/program.json` and `config/config.json`.
4. From your laptop: `pm2 deploy ecosystem.config.cjs production setup`.
5. Trigger a deploy: `pm2 deploy ecosystem.config.cjs production` or push to `master`.
6. Point nginx (`sprinklers.utahengineer.com`) at port 8084, run `certbot --nginx`.
