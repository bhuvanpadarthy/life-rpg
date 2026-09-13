# Life RPG production auth/backend fix

The backend must use a persistent managed PostgreSQL database in production. Do not rely on `/tmp` SQLite on Vercel.

## 1. Install and build locally

```bash
npm ci
npm run build
```

## 2. Configure Vercel environment variables

Run these commands from the repository root after installing and logging into Vercel:

```bash
npm i -g vercel
vercel login
vercel link
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add CLIENT_URL production
```

Use a real managed PostgreSQL connection string for `DATABASE_URL`, a long random secret for `JWT_SECRET`, and the deployed frontend URL for `CLIENT_URL`.

To verify variables exist without printing their values:

```bash
vercel env ls
```

Redeploy after setting variables:

```bash
vercel --prod
```

## 3. Production smoke test

```bash
export APP_URL="https://life-rpg-two-blush.vercel.app"

curl -i "$APP_URL/api/health"

REGISTER=$(curl -fsS -X POST "$APP_URL/api/auth/register" \
  -H 'Content-Type: application/json' \
  --data '{"username":"JudgeRunner","email":"judge@example.com","password":"password123"}')

echo "$REGISTER"
export TOKEN=$(node -e "console.log(JSON.parse(process.argv[1]).token)" "$REGISTER")

curl -fsS "$APP_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN"

curl -fsS -X POST "$APP_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  --data '{"usernameOrEmail":"JUDGERUNNER","password":"password123"}'

# Refresh-proof persistence check: call /auth/me again after a new request.
curl -fsS "$APP_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

Expected health output includes `"ready":true` and `"databaseMode":"POSTGRESQL"`. If it says `ready:false`, fix Vercel environment variables or PostgreSQL connectivity before recording the demo.

## 4. Optional AI coding prompt

> Audit this Life RPG repository end-to-end for production authentication failures. Verify Vercel routes `/api/*` to `api/index.ts`, verify the client uses same-origin `/api`, require `DATABASE_URL` and `JWT_SECRET` in production, never use ephemeral SQLite in Vercel production, run migrations against PostgreSQL, verify Bearer JWT parsing, and test registration, case-insensitive login, `/auth/me`, quest creation, quest completion, refresh persistence, logout, and invalid-token handling. Do not claim success until `npm run build` and the production curl smoke test pass.
