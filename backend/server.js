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

    // ✅ Get Gemini API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    console.log('Using Gemini API Key:', apiKey ? 'Provided' : 'Not Provided');
    console.log('Received apikey:', apiKey);
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured in environment variables' });
    }

    // ✅ Initialize the Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);

    // ✅ Get the model instance (recommended: 'gemini-2.5-flash')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // ✅ Construct the prompt with the user's message
    const prompt = `You are Study Buddy, a helpful educational assistant. Respond to the following student query:\n\n"${message}"`;

    // ✅ Generate the response
    const result = await model.generateContent(prompt);

    // ✅ Extract the response text
    const responseText = result.response.text();

    // ✅ Return the chatbot response
    res.json({ response: responseText });
    console.log(responseText);
  } catch (error) {
    console.error('Error in chat endpoint:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Study Buddy backend server running on http://localhost:${PORT}`);
});