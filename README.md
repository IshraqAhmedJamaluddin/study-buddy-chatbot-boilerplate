# Study Buddy Chatbot

Welcome to the Study Buddy project! This is a learning exercise designed to help you master Git and GitHub workflows while building a simple chatbot interface.

## Important Note

The main goal of this project is to learn Git and GitHub best practices. While you will implement some chatbot functionality, the primary focus is on version control, branching, committing, and collaborating through pull requests.

## Project Overview

This project consists of:
- **Backend**: Node.js + Express server with a chat API endpoint
- **Frontend**: React + TypeScript + Vite + Material-UI chat interface

You will implement the integration with Google's Gemini API to make the chatbot functional.

## Implemented Features

- **Backend: Gemini 2.5 Pro integration**
  - Uses `@google/generative-ai` with model `gemini-2.5-pro`.
  - Reads API key from `backend/.env` as `GEMINI_API_KEY`.
  - Ensures responses are plain text.
  - Public endpoint: `POST http://localhost:3001/api/chat`.

- **Frontend UI customization**
  - Chat interface renders server responses as plain text.
  - Minor layout and readability refinements.
  - Changes primarily in `frontend/src/components/ChatInterface.tsx`.

- **Testing**
  - Example request body: `{ "message": "Explain recursion simply." }`
  - Example response shape: `{ "response": "..." }`

## Prerequisites

Before you begin, make sure you have:
- Node.js (v18 or higher) installed
- npm or yarn package manager
- A Google Gemini API key (get one for free from [Google AI Studio](https://aistudio.google.com))
- Git installed and configured
- A GitHub account

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```bash
   cp ../.env.example .env
   ```

4. Edit the `.env` file and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3001
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

   The backend should now be running on `http://localhost:3001`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend should now be running on `http://localhost:3000`

4. Open your browser and navigate to `http://localhost:3000`

## Your Tasks

### 1. Implement Backend API Integration

First, install the Gemini API package in the backend directory:
```bash
cd backend
npm install @google/generative-ai
```

Then, in `backend/server.js`, find the TODO comments in the `/api/chat` endpoint. You need to:
- Import the GoogleGenerativeAI SDK
- Extract the Gemini API key from environment variables
- Initialize the Gemini client and get a model instance (recommended: 'gemini-2.5-flash')
- Make an API call to Google's Gemini API
- Return the chatbot's response to the frontend

### 2. Implement Frontend API Call

In `frontend/src/components/ChatInterface.tsx`, find the TODO comment in the `handleSend` function. You need to:
- Make a POST request to `http://localhost:3001/api/chat`
- Send the user's message in the request body
- Handle the response and display it in the chat interface

### 3. Customize the UI (Optional)

Feel free to make the chat interface look as pretty as you want! You can:
- Customize colors, fonts, and styling
- Add animations or transitions
- Improve the layout and user experience
- Add new features like message timestamps, user avatars, or emoji support
- Experiment with Material-UI components or add your own custom styles

Remember, while making it look good is fun, the main focus of this project is learning Git and GitHub workflows.

## Git and GitHub Workflow

This project emphasizes proper Git and GitHub practices. Follow these steps:

### Initial Setup

1. Fork this repository to your GitHub account
2. Clone your fork to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/study-buddy.git
   cd study-buddy
   ```

### Daily Workflow

1. **Pull latest changes** (if working in a team):
   ```bash
   git pull origin main
   ```

2. **Create a feature branch** for your work:
   ```bash
   git checkout -b feat/implement-gemini-integration
   ```
   
   Use descriptive branch names following this pattern:
   - `feat/` for new features
   - `fix/` for bug fixes
   - `docs/` for documentation updates

3. **Make small, focused commits**:
   ```bash
   git add backend/server.js
   git commit -m "feat: add Gemini API key extraction"
   ```
   
   Use Conventional Commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `chore:` for configuration or dependencies
   - `refactor:` for code restructuring

4. **Push your branch**:
   ```bash
   git push origin feat/implement-gemini-integration
   ```

5. **Create a Pull Request** on GitHub:
   - Go to your repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Write a clear description of your changes
   - Submit the PR for review

### Commit Best Practices

- Make small, logical commits (one concept per commit)
- Write clear, descriptive commit messages
- Commit frequently as you complete small tasks
- Never commit sensitive information (API keys, passwords)
- Always test your code before committing

### Branch Strategy

- `main`: Stable, working code (do not push directly to main)
- Feature branches: One branch per feature or task
- Keep branches short-lived (merge or delete after PR)

### Tagging (Optional)

After completing major milestones, you can create tags:
```bash
git tag -a v1.0.0 -m "Initial chatbot implementation"
git push origin v1.0.0
```

## Submission

You will submit your work via Pull Request:

1. Complete all TODO items in the codebase
2. Ensure your code runs without errors
3. Create a Pull Request from your feature branch to the main repository
4. I will review and grade your PR
5. Note: PRs will be reviewed but not merged to preserve the original boilerplate

## Resources

- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com
- Conventional Commits: https://www.conventionalcommits.org
- Slides: https://docs.google.com/presentation/d/1nNtTcZTMtyGF-aSYZqF2QFyF093w_c4cXsmtnYJAaZc/edit?usp=sharing

## Remember

- Git is your friend, not your enemy. Commit often, commit early.
- Small commits are easier to understand and review.
- Good commit messages help future you (and your teammates) understand what changed.
- Branches let you experiment without breaking main.
- Pull Requests are for discussion and review, not just submission.

Good luck, and happy coding!
