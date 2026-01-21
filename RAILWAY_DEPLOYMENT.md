# Railway Deployment Guide - JW Auto Care AI

This guide walks you through deploying the JW Auto Care AI SaaS platform to Railway.

## Prerequisites

1. A [Railway account](https://railway.app) (free tier available)
2. Your code pushed to a GitHub repository
3. API keys ready:
   - Gemini API key (from [Google AI Studio](https://aistudio.google.com/))
   - Stripe keys (from [Stripe Dashboard](https://dashboard.stripe.com/))
   - Google OAuth credentials (from [Google Cloud Console](https://console.cloud.google.com/))

## Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account if not already connected
5. Select the `jw-autocare-saas` repository

## Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically provision the database
4. The `DATABASE_URL` variable is automatically available to your services

## Step 3: Add Redis

1. Click **"+ New"** again
2. Select **"Database"** → **"Add Redis"**
3. The `REDIS_URL` variable is automatically available to your services

## Step 4: Deploy the API Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Click on the new service to configure it
4. Go to **Settings** tab:
   - **Root Directory**: `apps/api`
   - **Build Command**: (leave default, uses Dockerfile)
5. Go to **Variables** tab and add:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=<generate-a-secure-random-string-32-chars-minimum>
GEMINI_API_KEY=<your-gemini-api-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
STORAGE_TYPE=local
```

6. Add reference variables (click "Add Reference"):
   - `DATABASE_URL` → Reference from PostgreSQL service
   - `REDIS_URL` → Reference from Redis service

7. Go to **Networking** tab:
   - Click **"Generate Domain"** to get a public URL
   - Note this URL (e.g., `https://api-production-xxxx.up.railway.app`)

## Step 5: Deploy the Web Frontend

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. Configure the service:
   - **Root Directory**: `apps/web`
4. Go to **Variables** tab and add:

```
VITE_API_URL=https://api-production-xxxx.up.railway.app
```
(Use the API URL from Step 4)

5. Go to **Networking** tab:
   - Click **"Generate Domain"** to get a public URL
   - This is your app URL (e.g., `https://web-production-xxxx.up.railway.app`)

## Step 6: Update API with Frontend URL

1. Go back to your API service
2. Add these environment variables:

```
FRONTEND_URL=https://web-production-xxxx.up.railway.app
CORS_ORIGINS=https://web-production-xxxx.up.railway.app
```

3. Click **"Deploy"** to redeploy with the new variables

## Step 7: Run Database Migrations

The API Dockerfile automatically runs migrations on startup, but if you need to run them manually:

1. In the API service, go to **Settings**
2. Click **"Open Shell"**
3. Run: `npx prisma migrate deploy`

## Step 8: Verify Deployment

1. Visit your web frontend URL
2. You should see the login page
3. Test the health endpoints:
   - API: `https://your-api-url.up.railway.app/health`
   - Web: `https://your-web-url.up.railway.app/health`

## Custom Domains (Optional)

1. Go to your service's **Networking** tab
2. Click **"+ Custom Domain"**
3. Enter your domain (e.g., `app.yourbusiness.com`)
4. Add the CNAME record to your DNS provider
5. Railway will automatically provision SSL

## Environment Variables Reference

### API Service (Required)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Set to `production` |
| `PORT` | Set to `3001` |
| `DATABASE_URL` | Reference from PostgreSQL |
| `REDIS_URL` | Reference from Redis |
| `JWT_SECRET` | Random 32+ character string |
| `GEMINI_API_KEY` | From Google AI Studio |
| `FRONTEND_URL` | Your web app URL |
| `CORS_ORIGINS` | Your web app URL |

### API Service (Optional)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | For payment processing |
| `STRIPE_WEBHOOK_SECRET` | For Stripe webhooks |
| `GOOGLE_CLIENT_ID` | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | For Google OAuth |
| `TWILIO_ACCOUNT_SID` | For SMS features |
| `TWILIO_AUTH_TOKEN` | For SMS features |
| `TWILIO_PHONE_NUMBER` | For SMS features |

### Web Service

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your API service URL |

## Troubleshooting

### Build Fails
- Check the build logs in Railway
- Ensure `apps/api/Dockerfile` and `apps/web/Dockerfile` exist
- Verify the root directory is set correctly

### Database Connection Issues
- Ensure `DATABASE_URL` is referenced from the PostgreSQL service
- Check that Prisma migrations have run

### CORS Errors
- Verify `CORS_ORIGINS` matches your web frontend URL exactly
- Include the protocol (`https://`)

### Images Not Loading
- For production, consider using Google Cloud Storage
- Set `STORAGE_TYPE=gcs` and configure GCS credentials

## Estimated Costs

Railway's pricing (as of 2024):
- **Hobby Plan**: $5/month includes $5 of usage
- **Pro Plan**: $20/month includes $20 of usage

Typical usage for this app:
- PostgreSQL: ~$5-10/month
- Redis: ~$3-5/month
- API Service: ~$5-15/month
- Web Service: ~$3-5/month

**Total estimate**: $15-35/month for moderate usage

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
