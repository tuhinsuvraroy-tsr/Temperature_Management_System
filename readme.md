# Temperature Management System

This rewrite uses a plain Node.js HTTP server, MongoDB Atlas, and Google Identity Services. It has no backend framework and stores a new, timestamped reading for each active ESP every minute.

## Folders

- `Frontend/` — static dashboard (HTML, CSS, browser JavaScript)
- `Backend/` — the small Node.js HTTP server and API routes
- `Database/` — MongoDB connection and reading queries
- `Authentication/` — Google ID-token verification and short-lived dashboard sessions

Each folder can be owned by a different student. `Backend/` is the only folder
that installs Node packages and starts the application; it imports the focused
database and authentication modules from their sibling folders.

## Local setup

1. `Backend/.env` is already configured locally with the MongoDB URI, Google client ID, and a generated device key. It is ignored by Git; do not share it.
2. In Google Cloud Console, add `http://localhost:3000` and `https://tmsnst.vercel.app` as authorized JavaScript origins for the supplied **Web application** client.
3. From `Backend/`, run `npm install` and then `npm start`.
4. Open `http://localhost:3000` and sign in.

## Deploying the existing Vercel frontend

The Node API must run on a Node-capable host with a public HTTPS address. Put that address in `Frontend/config.js` as `apiBaseUrl`, replace `YOUR_BACKEND_DOMAIN` in the Central ESP sketch with that address, and add the host address to the Google OAuth client's authorized JavaScript origins. Upload only the contents of `Frontend/` to the static frontend host.

### Getting the public backend URL

A host creates this URL when the Node server is deployed. For a persistent service, create a **Web Service** on Render, set its **Root Directory** to `Temperature_Management_System/Backend`, its build command to `npm install`, and its start command to `npm start`. Enter the values from `Backend/.env` as environment variables in the service settings. Render then displays a URL such as `https://temperature-api.onrender.com` in its dashboard. Do not upload `Backend/.env`; enter its values in the host's private environment-variable form instead.

The included `Backend/requirements.txt` is an explanatory file only; this is a Node.js project and Render uses `Backend/package.json` to install its dependencies.

After Render supplies the URL, use these exact forms:

- `Frontend/config.js` → `apiBaseUrl: 'https://temperature-api.onrender.com'`
- Central ESP → `BACKEND_READINGS_URL = "https://temperature-api.onrender.com/api/readings"`
- Google Cloud OAuth authorized JavaScript origins → `https://tmsnst.vercel.app` (and `https://temperature-api.onrender.com` only if the frontend is also served by the Node server)

For a short local demonstration without deploying, a tunnel such as Cloudflare Tunnel can provide a temporary HTTPS URL. The computer running the Node server must stay on, and the temporary address can change, so it is unsuitable for the permanent ESP setup.

## ESP data flow

`Peripheral ESP → Central ESP on local Wi-Fi → POST /api/readings → MongoDB Atlas → dashboard`

The Central ESP uploads once per minute to create useful history without filling the database with one entry per second. The browser refreshes the latest cards and real graph every 30 seconds.
