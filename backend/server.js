import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';


// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Study Buddy backend is running' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Get Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);

    // Choose model (recommended: gemini-2.0-flash or gemini-pro)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Generate response
    const result = await model.generateContent(message);
    const responseText = result.response.text();

    res.json({ response: responseText });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Study Buddy backend server running on http://localhost:${PORT}`);
});

