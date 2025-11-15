# Deployment Guide

This project uses a hybrid deployment strategy:
- **Backend**: Hosted on Railway
- **Frontend**: Hosted on GitHub Pages

## Backend Deployment (Railway)

### Prerequisites
- Railway account (sign up at https://railway.app)
- Gemini API key from Google AI Studio

### Steps

1. **Create a new Railway project:**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo" and choose this repository

2. **Configure the backend service:**
   - Railway will auto-detect it's a Node.js project
   - Set the **Root Directory** to `backend` in the service settings
   - The `railway.json` file will configure the build and start commands

3. **Set environment variables:**
   - Go to your backend service → Variables tab
   - Add the following:
     - `GEMINI_API_KEY` = your Gemini API key
     - `FRONTEND_URL` = your GitHub Pages URL (e.g., `https://yourusername.github.io/repo-name`)
     - `PORT` = Railway sets this automatically

4. **Deploy:**
   - Railway will automatically build and deploy
   - Once deployed, find your backend URL in one of these locations:
     - **Option 1**: Click on your service → Look at the top of the service dashboard for the "Public Domain" or "Generate Domain" button
     - **Option 2**: Go to your service → Settings tab → Domains section → You'll see your public URL (e.g., `https://your-project-name-production.up.railway.app`)
     - **Option 3**: Check the service overview page - Railway displays the public URL after successful deployment
   - Copy this URL - you'll need it for your frontend configuration

## Frontend Deployment (GitHub Pages)

### Prerequisites
- GitHub repository with Actions enabled
- GitHub Pages enabled in repository settings

### Steps

1. **Enable GitHub Pages:**
   - Go to your repository → Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Set GitHub Secret for API URL:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `VITE_API_URL`
   - Value: Your Railway backend URL (e.g., `https://your-backend.railway.app`)
   - Click "Add secret"

3. **Deploy:**
   - The GitHub Actions workflow (`.github/workflows/deploy-frontend.yml`) will automatically:
     - Build the frontend when you push to `main` or `master` branch
     - Deploy to GitHub Pages
   - Or manually trigger it: Actions → "Deploy Frontend to GitHub Pages" → Run workflow

4. **Access your site:**
   - Your site will be available at: `https://yourusername.github.io/repo-name`
   - Or if you have a custom domain configured

### Manual Deployment

If you want to deploy manually:

```bash
cd frontend
npm install
VITE_API_URL=https://your-backend.railway.app npm run build
# Then upload the dist folder to GitHub Pages
```

## Environment Variables

### Backend (Railway)
- `GEMINI_API_KEY` - Your Gemini API key (required)
- `FRONTEND_URL` - Your GitHub Pages frontend URL (required for CORS)
- `PORT` - Automatically set by Railway

### Frontend (GitHub Pages)
- `VITE_API_URL` - Your Railway backend URL (set as GitHub Secret)

## Troubleshooting

### Backend Issues
- **CORS errors**: Make sure `FRONTEND_URL` is set correctly in Railway
- **API key errors**: Verify `GEMINI_API_KEY` is set in Railway environment variables
- **Port issues**: Railway sets PORT automatically, don't hardcode it

### Frontend Issues
- **API calls failing**: Check that `VITE_API_URL` secret is set correctly in GitHub
- **Build errors**: Check GitHub Actions logs for detailed error messages
- **404 errors**: Verify GitHub Pages is enabled and source is set to "GitHub Actions"

### Workflow Issues
- **Workflow not running**: Make sure GitHub Actions is enabled in repository settings
- **Deployment failing**: Check that the `VITE_API_URL` secret is set
- **Build failing**: Ensure all dependencies are in `package.json`

## Notes

- Railway provides a free tier with generous limits
- GitHub Pages is free for public repositories
- Environment variables are encrypted and secure
- The workflow automatically deploys on push to main/master branch
- You can manually trigger deployments from the Actions tab

