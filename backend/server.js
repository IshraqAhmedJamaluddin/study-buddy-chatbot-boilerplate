import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Import the necessary Gemini SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const message = req.body.text;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }
    console.log("🧠 User message:", message);

    // TODO: Get Gemini API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY in environment variables.");
    }
    // 2. Initialize the GoogleGenerativeAI client with your API key
    const genAI = new GoogleGenerativeAI(apiKey);
    // 3. Get a model instance (recommended: 'gemini-2.5-flash')
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    // 4. Construct a prompt with the user's message
    const prompt = `User: ${message}\nAI:`;
    // 5. Call generateContent() with the prompt
    const result = await model.generateContent(prompt);
    // 6. Extract the response text from the result
    const responseText = result.response.text();
    // 7. Return the response and Handle any errors that may occur
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

