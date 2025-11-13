import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai'; 

/** Load environment variables from .env file */
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

/** Middleware */
app.use(cors());
app.use(express.json());

/** Health check endpoint */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Study Buddy backend is running' });
});

/** Chat endpoint */
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    /** Validate input */
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    /** Get Gemini API key from environment variable */
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key exists:', !!apiKey); // Debug log
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key is not set in .env' });
    }

    /** Initialize the GoogleGenerativeAI client with your API key */
    const genAI = new GoogleGenerativeAI(apiKey);
    
    /** Get a model instance with configuration */
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',  // Changed from 'gemini-1.5-flash'
        generationConfig: {
        maxOutputTokens: 200,
                          }
      });
    
    /** Construct a prompt with the user's message */
    const prompt = `User: ${message}\nChatbot:`;

    let botMessage = 'No response from Gemini';

    try {
      console.log('Calling Gemini API...'); // Debug log
      /** Call generateContent() with the prompt */
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      console.log('Gemini response received'); // Debug log
      /** Extract the response text from the result */
      botMessage = response.text() || botMessage;
    } catch (apiError) {
      console.error('Error calling Gemini API:');
      console.error('Error message:', apiError.message); // More detailed error
      console.error('Full error:', apiError); // Full error object
    }

    /** Return the chatbot response */
    res.json({ response: botMessage });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** Start server */
app.listen(PORT, () => {
  console.log(`Study Buddy backend server running on http://localhost:${PORT}`);
});