import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS configuration - allow requests from frontend URL or localhost for development
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:3000']
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Whiskers backend is running... meow!' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Validate history if provided
    if (history && !Array.isArray(history)) {
      return res.status(400).json({ error: 'History must be an array' });
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build conversation context from history
    let conversationContext = '';
    if (history && history.length > 0) {
      conversationContext = '\n\nPrevious conversation:\n';
      history.forEach((entry) => {
        const role = entry.role === 'user' ? 'Student' : 'Whiskers';
        conversationContext += `${role}: ${entry.content}\n`;
      });
      conversationContext += '\n';
    }

    // Make API call to Gemini
    const prompt = `You are Whiskers, a helpful AI assistant for students who likes cats and occasionally uses cat puns. 
    Your personality is friendly, encouraging, and playful. You can occasionally use a cat pun when it feels natural and fits the context, but don't overdo it - focus on being helpful and clear first.
    Examples of cat puns you might use occasionally: "That's purrfect!", "Let me paws and think about that", "I'm feline good about this answer", etc. Use them sparingly and only when they feel natural.
    Answer questions clearly and concisely. Be friendly and encouraging. Cat puns are optional and should be used lightly, not forced into every response.
    IMPORTANT: Do NOT use em dashes in your responses. Use regular hyphens (-) or commas instead.
    ${conversationContext}
    Current student question: ${message}`;

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
// Listen on 0.0.0.0 to accept connections from Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Study Buddy backend server running on port ${PORT}`);
});

