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

    // TODO: Get Gemini API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY in backend environment' });
    }
    // TODO: Make API call to Gemini
    // You will need to:
    // 1. Import the necessary Gemini SDK (e.g., @google/generative-ai)
          //done at the import section

    // 2. Initialize the GoogleGenerativeAI client with your API key
    const genAI = new GoogleGenerativeAI(apiKey);


    // 3. Get a model instance (recommended: 'gemini-2.5-flash')
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash'
    });


    // 4. Construct a prompt with the user's message
    const prompt = `You are Study Buddy, a helpful AI assistant.\nUser: ${message}\nAssistant:`;

    // 5. Call generateContent() with the prompt
    const result = await model.generateContent(prompt);


    // 6. Extract the response text from the result
    let botReply = null;

    if (result?.response?.text) {
      botReply = await result.response.text();
    } else if (typeof result?.response === 'string') {
      botReply = result.response;
    } else if (result?.text) {
      botReply = result.text;
    } else {
      botReply = 'Sorry, I could not understand the model response.';
    }

    // 7. Handle any errors that may occur
    return res.json({ response: botReply });

    // TODO: Return the chatbot response
    // For now, return a placeholder response
   /* const placeholderResponse = {
      response: 'This is a placeholder response. Implement Gemini API integration here.'
    };*/

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

