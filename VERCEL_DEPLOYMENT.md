# Vercel Deployment Guide

## Step 1: Add Environment Variables in Vercel Dashboard

Go to your Vercel project settings and add these environment variables:

### For Production Environment:

1. **MONGODB_URI**
   - Value: `mongodb+srv://namdevaniket446_db_user:kP6X9WslQ0MMimgy@moviehub.bbs2edk.mongodb.net/moviehub?retryWrites=true&w=majority`

2. **JWT_SECRET**
   - Value: `your-secret-key-change-this-in-production-use-random-string`
   - ⚠️ **Important**: Change this to a strong random string for production!

3. **PORT**
   - Value: `3000`

4. **NODE_ENV**
   - Value: `production`

### For Frontend (if needed):

5. **VITE_API_URL**
   - Value: `https://your-vercel-app.vercel.app/api`
   - Replace `your-vercel-app` with your actual Vercel app URL

## Step 2: Deploy

After adding the environment variables:

1. Push your code to GitHub
2. Vercel will automatically deploy
3. Or manually deploy using: `vercel --prod`

## Step 3: Update Frontend API URL

After deployment, update your frontend `.env.production`:

```env
VITE_API_URL=https://your-actual-vercel-url.vercel.app/api
```

## Troubleshooting

### If you get "Secret does not exist" error:
- Make sure you removed the `env` section from `vercel.json`
- Add environment variables directly in Vercel Dashboard instead

### If backend doesn't work:
- Check that all environment variables are set
- Check Vercel function logs for errors
- Ensure MongoDB allows connections from anywhere (0.0.0.0/0)

## How to Add Environment Variables in Vercel:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Name: `MONGODB_URI`
   - Value: Your MongoDB connection string
   - Environment: Production (and Preview if needed)
5. Click **Save**
6. Redeploy your project

## Security Notes:

⚠️ **Never commit these values to Git!**
- Keep `.env` in `.gitignore`
- Use strong, unique values for production
- Rotate JWT_SECRET regularly
- Use MongoDB IP whitelist if possible
