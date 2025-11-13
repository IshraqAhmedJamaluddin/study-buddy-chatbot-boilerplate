import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Message } from '../types';

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // TODO: Make API call to /api/chat endpoint
      // You will need to:
      // 1. Use fetch or axios to POST to 'http://localhost:3001/api/chat'
       const response = await fetch("http://localhost:3001/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    
      // 2. Send the user's message in the request body: { message: input }
      body: JSON.stringify({ message: input }), // ✅ 2. Send user's message
  });
      // 3. Handle the response from the backend
      const data = await response.json();
      // 4. Create a bot message with the response
      const botMessage: Message = {
    id: (Date.now() + 1).toString(),
    text: data.reply || "No response from the AI.",
    sender: "bot",
    timestamp: new Date(),
  };
      // 5. Add the bot message to the messages state
      setMessages((prevMessages) => [...prevMessages, botMessage]);
} catch (error) {
  console.error("Error calling /api/chat:", error);

  // Fallback error message
  const errorMessage: Message = {
    id: (Date.now() + 1).toString(),
    text: "⚠️ Sorry, something went wrong while contacting the AI.",
    sender: "bot",
    timestamp: new Date(),
  };

  setMessages((prevMessages) => [...prevMessages, errorMessage]);
}

      // Placeholder: Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'This is a placeholder response. Implement API call here.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Error: Could not get response from server. Check your backend connection.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          overflow: 'auto',
          mb: 2,
          p: 2,
          backgroundColor: '#f5f5f5',
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Start a conversation with Study Buddy!
            </Typography>
          </Box>
        ) : (
          <List>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1,
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: message.sender === 'user' ? '#1976d2' : '#fff',
                    color: message.sender === 'user' ? '#fff' : '#000',
                  }}
                >
                  <ListItemText
                    primary={message.text}
                    secondary={message.timestamp.toLocaleTimeString()}
                    secondaryTypographyProps={{
                      color: message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    }}
                  />
                </Paper>
              </ListItem>
            ))}
            {loading && (
              <ListItem sx={{ justifyContent: 'flex-start' }}>
                <CircularProgress size={24} />
              </ListItem>
            )}
          </List>
        )}
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSend}
          disabled={loading || !input.trim()}
          sx={{ minWidth: 120 }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;

