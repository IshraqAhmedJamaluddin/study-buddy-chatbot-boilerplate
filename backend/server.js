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

    // Get Gemini API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.' 
      });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Make API call to Gemini
    const prompt = `You are Study Buddy, a helpful AI assistant for ITI students. 
    Answer questions clearly and concisely. Be friendly and encouraging.
    
    Student question: ${message}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Return the chatbot response
      res.json({ response: text });
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      
      // Handle specific Gemini API errors
      if (geminiError.message?.includes('API_KEY')) {
        return res.status(401).json({ 
          error: 'Invalid Gemini API key. Please check your GEMINI_API_KEY in the .env file.' 
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to get response from Gemini API. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Study Buddy backend server running on http://localhost:${PORT}`);
});

