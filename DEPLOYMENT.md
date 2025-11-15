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
     - `FRONTEND_URL` = your GitHub Pages base domain (without the repository path)
       - **Important**: Must include the `https://` protocol
       - **Important**: Must NOT include a trailing slash `/`
       - **Important**: Do NOT include the repository name/path - only use the base domain
       - **Examples**:
         - If your GitHub Pages URL is `https://ishraqahmedjamaluddin.github.io/study-buddy-chatbot-boilerplate`, set `FRONTEND_URL=https://ishraqahmedjamaluddin.github.io` (without the repo path)
         - If your GitHub Pages URL is `https://ishraqahmedjamaluddin.github.io`, set `FRONTEND_URL=https://ishraqahmedjamaluddin.github.io`
       - **Note**: The origin for CORS is just the domain (e.g., `https://username.github.io`), not the full path
     - `PORT` = Railway sets this automatically (do not set this manually)

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
     - Build the frontend when you push to `main`, `master`, or `teacher-solution` branch
     - Deploy to GitHub Pages
   - Or manually trigger it: Actions → "Deploy Frontend to GitHub Pages" → Run workflow
   - **Note**: To deploy from a different branch, edit `.github/workflows/deploy-frontend.yml` and add your branch name to the `branches` list under the `push` event

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
- `FRONTEND_URL` - Your GitHub Pages base domain (required for CORS)
  - **Format**: Must be `https://yourusername.github.io` (only the base domain, no repository path)
  - **Critical**: Include `https://` protocol, do NOT include trailing slash `/`, do NOT include repository name/path
  - **Example**: If your site is at `https://ishraqahmedjamaluddin.github.io/study-buddy-chatbot-boilerplate`, set `FRONTEND_URL=https://ishraqahmedjamaluddin.github.io` (without the repo path)
  - **Note**: CORS uses the origin (domain only), not the full URL path
- `PORT` - Automatically set by Railway (do not set manually)

### Frontend (GitHub Pages)

- `VITE_API_URL` - Your Railway backend URL (set as GitHub Secret)

## Troubleshooting

### Backend Issues

- **CORS errors** (e.g., "Access to fetch blocked by CORS policy"):
  1. **Check that `FRONTEND_URL` is set correctly in Railway:**
     - Go to Railway → Your backend service → Variables tab
     - Verify `FRONTEND_URL` is set to your GitHub Pages **base domain only** (without the repository path)
     - The origin for CORS is just the domain, not the full URL path
     - Example: If your GitHub Pages site is at `https://ishraqahmedjamaluddin.github.io/study-buddy-chatbot-boilerplate`, then `FRONTEND_URL` should be set to `https://ishraqahmedjamaluddin.github.io` (without the repo path)
  2. **Common mistakes:**
     - ❌ Missing `https://` protocol: `ishraqahmedjamaluddin.github.io`
     - ❌ Trailing slash: `https://ishraqahmedjamaluddin.github.io/`
     - ❌ Including repository path: `https://ishraqahmedjamaluddin.github.io/study-buddy-chatbot-boilerplate`
     - ❌ Wrong URL: Using backend URL instead of frontend URL
     - ✅ Correct: `https://ishraqahmedjamaluddin.github.io` (base domain only, no repo path)
  3. **After updating `FRONTEND_URL`:**
     - Railway will automatically redeploy your service
     - Wait for the deployment to complete (check the Deployments tab)
     - Test again from your frontend
  4. **Finding your base domain:**
     - Go to your repository → Settings → Pages
     - Check the URL shown under "Your site is live at"
     - Use only the base domain part (e.g., `https://yourusername.github.io`) without any repository path
- **API key errors**: Verify `GEMINI_API_KEY` is set in Railway environment variables
- **Port issues**: Railway sets PORT automatically, don't hardcode it

### Frontend Issues

- **API calls failing**: Check that `VITE_API_URL` secret is set correctly in GitHub
- **Build errors**: Check GitHub Actions logs for detailed error messages
- **404 errors**: Verify GitHub Pages is enabled and source is set to "GitHub Actions"
- **Branch not allowed to deploy error**: If you see "Branch 'X' is not allowed to deploy to github-pages due to environment protection rules":
  1. Go to your repository on GitHub
  2. Navigate to **Settings** → **Environments** → **github-pages**
  3. Under **Deployment branches**, you'll see branch protection rules
  4. Choose one of these options:
     - **Option A (Recommended)**: Add your branch to allowed branches:
       - Click "Selected branches" or "Add branch" button
       - Enter your branch name (e.g., `teacher-solution`)
       - Click "Save protection rules"
     - **Option B**: Allow all branches by selecting "All branches" (less secure but simpler)
  5. Retry your deployment

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
