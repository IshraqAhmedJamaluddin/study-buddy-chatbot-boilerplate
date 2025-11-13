import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is missing in .env file');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
      return res
        .status(400)
        .json({ error: 'Message is required and must be a string' });
    }

    // Generate a response using Gemini
    const result = await model.generateContent(message);

    // Extract the response text safely
    const responseText = result?.response?.text?.() || 'No response generated.';

    res.json({ response: responseText });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to generate response from Gemini' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Study Buddy backend running on http://localhost:${PORT}`);
});
