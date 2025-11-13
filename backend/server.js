import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai'; // step 1: import SDK


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

    // Load Gemini API key securely from environment variables
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ Missing GEMINI_API_KEY in environment variables');
  process.exit(1);
}


   // Step 2: Initialize Gemini client using API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ Missing GEMINI_API_KEY in environment variables');
  process.exit(1);
}

const client = new GoogleGenerativeAI({ apiKey });
console.log('✅ Gemini API client initialized:', !!client);


    // TODO: Return the chatbot response
    // For now, return a placeholder response
    const placeholderResponse = {
      response: 'This is a placeholder response. Implement Gemini API integration here.'
    };

    res.json(placeholderResponse);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Study Buddy backend server running on http://localhost:${PORT}`);
});

