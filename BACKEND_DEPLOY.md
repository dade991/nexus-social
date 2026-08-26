# Deploy Backend to Railway (Free Tier)

## Quick Deploy

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select the `nexus-social` repo
4. Railway will auto-detect Node.js and deploy

## Or Manual Setup

1. Clone the repo locally
2. Run: `npm install`
3. Run: `npm run server`
4. The backend runs on port 3001

## Environment Variables (for production)

Create a `.env` file:
```
PORT=3001
JWT_SECRET=your-super-secret-key-here
```

Then deploy to:
- **Railway** (railway.app) - Free tier available
- **Render** (render.com) - Free tier available  
- **Heroku** (heroku.com) - Free tier available
- **DigitalOcean App Platform** - $5/month

## After deploying backend

Update the frontend API URL in:
- `src/context/SocialContext.jsx` - Change API_URL to your backend URL
- Rebuild and redeploy to Vercel
