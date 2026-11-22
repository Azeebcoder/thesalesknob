# The Sales Knob website

A unified TSK and personal-services website using React + Vite, Node.js/Express, and MongoDB. Service prices are editable estimates in INR; this project does not include product checkout or payment processing.

## Requirements

- Node.js 20.19+ and npm
- MongoDB locally or a MongoDB Atlas connection string

## Local setup

1. Install dependencies from the project root:

   ```sh
   npm install
   ```

2. Copy `server/.env.example` to `server/.env`, then set `MONGO_URI` and a unique `JWT_SECRET` with at least 32 characters.
3. Start MongoDB, then load the service estimates from `MY SERVICES.docx`:

   ```sh
   npm run seed:services
   ```

   Seeding inserts missing entries and preserves any prices already edited by an administrator.

4. Add `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters), and `ADMIN_ROLE=admin` to `server/.env`, then provision the private admin account:

   ```sh
   npm run create:admin
   ```

   There is no public admin registration endpoint. To provision a content editor, set `ADMIN_ROLE=editor` with that person's email and password and run the same command.
   The command creates the account or updates the account matching that email. Keep `server/.env` private and never commit it.

5. Start the Vite client and Express API:

   ```sh
   npm run dev
   ```

   Open the Vite URL (normally `http://localhost:5173`). The frontend proxies `/api` requests to Express.
   Open `http://localhost:5173/admin` and sign in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you configured above.

## Useful commands

- `npm run build` — build the frontend and generate indexable route shells, metadata and (when `VITE_SITE_URL` is set) a sitemap.
- `npm test` — run API tests, including the authenticated admin-to-public price update flow.
- `npm run lint` — lint/check client and server JavaScript.
- `npm start` — serve the built frontend and API together from Express.

The admin console is available at `/admin`. Admins can manage INR service estimates and the private enquiry inbox; admins and editors can manage CMS content. Accounts are provisioned from the server environment; there is no public sign-up. Editors cannot access pricing or enquiry data. Configure a production MongoDB connection, `JWT_SECRET`, `NODE_ENV=production`, HTTPS, and your deployment’s origin before launch.
Copy `client/.env.example` to `client/.env` for frontend deployment settings. Set `VITE_SITE_URL` to the verified canonical production origin during the frontend build to generate absolute canonical URLs, a sitemap and its entry in `robots.txt`. Set `VITE_GTM_ID` only when a real Google Tag Manager container is available; analytics remains disabled until a visitor opts in.

## GitHub and VPS deployment

The Express server serves both the built frontend and `/api` endpoints. PM2 runs this single production process using [`ecosystem.config.cjs`](./ecosystem.config.cjs). The steps below use a private GitHub repository, Ubuntu LTS, MongoDB Atlas, and a temporary direct-IP HTTP deployment. Adapt the Ubuntu package-install steps if your VPS uses another OS.

### Upload this project to GitHub

1. On GitHub, create a **private, empty** repository. Do not initialize it with a README, license, or `.gitignore`.
2. In PowerShell, from the project root, initialize Git and check the files before staging:

   ```powershell
   git init
   git status --short
   git check-ignore -v server/.env client/.env
   ```

   Real environment files, including `.env.*` variants, should be ignored; `.env.example` templates remain eligible to commit. Never use `git add -f` on real environment files. Review the staged file list before committing:

   ```powershell
   git add .
   git status --short
   git diff --cached --name-only
   ```

   Confirm that real `.env` files, passwords, database URLs, and private keys are not staged. The `.env.example` templates are safe to include.
3. Commit and push, replacing the placeholders with your GitHub owner and repository:

   ```powershell
   git commit -m "Initial project upload"
   git branch -M main
   git remote add origin https://github.com/OWNER/REPOSITORY.git
   git push -u origin main
   ```

   GitHub may ask you to authenticate using its browser flow or a credential manager. Do not put an access token in the remote URL.

### Deploy to an Ubuntu VPS

1. Create a MongoDB Atlas database. In Atlas Network Access, allow only the VPS's public IP address. Do not allow access from `0.0.0.0/0`. Copy the database connection string for the server environment.
2. Install Git and a supported Node.js LTS version (20.19 or newer) from the [official Node.js download page](https://nodejs.org/en/download), then confirm the versions:

   ```bash
   sudo apt update
   sudo apt install -y git
   node --version
   npm --version
   ```

3. Give the VPS read-only access to the private repository. One option is to create an SSH deploy key on the VPS, then add only its public key under the GitHub repository's **Settings → Deploy keys**:

   ```bash
   ssh-keygen -t ed25519 -C "vps-deploy-key"
   cat ~/.ssh/id_ed25519.pub
   ```

   Keep the private key (`~/.ssh/id_ed25519`) on the VPS; never copy it into the repository or share it. Then clone the repository:

   ```bash
   git clone git@github.com:OWNER/REPOSITORY.git
   cd REPOSITORY
   npm ci
   npm install --global pm2
   ```

4. Configure the production site URL and MongoDB connection. Copy the templates and edit them on the VPS:

   ```bash
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   nano client/.env
   nano server/.env
   chmod 600 server/.env
   ```

   Set `VITE_SITE_URL` in `client/.env` to `http://VPS_PUBLIC_IP:5000` for the temporary IP launch. In `server/.env`, set `NODE_ENV=production`, `PORT=5000`, `CLIENT_ORIGIN=http://VPS_PUBLIC_IP:5000`, `MONGO_URI` to the Atlas connection string, and `JWT_SECRET` to a unique random value of at least 32 characters. On Ubuntu, generate a suitable secret with `openssl rand -base64 48`; put the result in the file, not in Git or a shared terminal transcript.

5. Provision the private admin account. Temporarily add `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters), and `ADMIN_ROLE=admin` to `server/.env`, then run:

   ```bash
   npm run create:admin
   ```

   After the account is ready, remove `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_ROLE` from `server/.env`; the running site does not need these values. Back up the credentials securely.
6. Build and start the site with PM2:

   ```bash
   npm run build
   pm2 start ecosystem.config.cjs --env production
   pm2 startup
   ```

   Run the additional `sudo` command printed by `pm2 startup`, then save the process list so PM2 restores the app after a reboot:

   ```bash
   pm2 save
   ```

   If Ubuntu's firewall is enabled and you are serving directly by IP, allow the app port:

   ```bash
   sudo ufw allow 5000/tcp
   ```

7. Check the process and health endpoint, then open `http://VPS_PUBLIC_IP:5000`:

   ```bash
   pm2 status
   pm2 logs tsk-growth-website
   curl http://127.0.0.1:5000/api/health
   ```

   A healthy API responds with `{"status":"ok"}`. This temporary HTTP setup is suitable for checking the public site, but admin sign-in uses a Secure cookie and therefore requires HTTPS. Configure a domain and HTTPS before using `/admin` or collecting real enquiries; then update `CLIENT_ORIGIN` and `VITE_SITE_URL` to the HTTPS origin, rebuild, and restart PM2.

### Updating the deployment

From the project directory on the VPS, pull the latest commit, install any updated dependencies, rebuild, and restart:

```bash
git pull
npm ci
npm run build
pm2 restart tsk-growth-website --update-env
```

Use `pm2 logs tsk-growth-website` to inspect runtime errors and `pm2 status` to check process health.

## Content and design

The 10 service categories, 28 indicative INR estimates and skills profile follow the supplied `MY SERVICES.docx`; the homepage preview and full service directory read prices from the same admin-managed catalog. The homepage and public solution, industry, work, insight and legal routes follow the supplied masterplan. Work cards and the work hub are explicitly illustrative; add client results, logos, testimonials, credentials, legal details and approved imagery only after they are verified and authorized. Privacy, terms and cookie pages remain drafts until the business identity, jurisdiction, retention and request process are confirmed.

The `/admin` content workspace provides structured services, case studies, industries, insights, testimonials and FAQs collections, with draft/published states, image alt text, canonical URLs and SEO titles/descriptions. Published services, industries, insights, FAQs, case studies and testimonials feed the public routes; the existing page records in `client/src/data/growthPages.js` remain the fallback when the database has no published override. Case studies and testimonials cannot be published without recording client permission. Content is rendered as text rather than trusted HTML.
