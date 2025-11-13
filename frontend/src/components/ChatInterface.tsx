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
      // 2. Send the user's message in the request body: { message: input }
      // 3. Handle the response from the backend
      // 4. Create a bot message with the response
      // 5. Add the bot message to the messages state

      // ✅ Make API call to /api/chat endpoint
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // ✅ Create a bot message with the real response from Gemini
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'No response received from AI.',
        sender: 'bot',
        timestamp: new Date(),
      };

      // Add bot message to chat
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
        elevation={4}
        sx={{
          flex: 1,
          overflow: 'auto',
          mb: 3,
          p: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          borderRadius: 3,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '10px',
            '&:hover': {
              background: '#555',
            },
          },
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
              Start a conversation with Study Buddy!
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Ask me anything about your studies 📚
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 1 }}>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                  px: 0,
                }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    p: 2.5,
                    maxWidth: '75%',
                    backgroundColor: message.sender === 'user' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : '#ffffff',
                    background: message.sender === 'user' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : '#ffffff',
                    color: message.sender === 'user' ? '#fff' : '#2c3e50',
                    borderRadius: message.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    boxShadow: message.sender === 'user' 
                      ? '0 4px 12px rgba(102, 126, 234, 0.4)' 
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: message.sender === 'user' 
                        ? '0 6px 16px rgba(102, 126, 234, 0.5)' 
                        : '0 4px 12px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <ListItemText
                    primary={message.text}
                    secondary={message.timestamp.toLocaleTimeString()}
                    primaryTypographyProps={{
                      sx: { 
                        fontSize: '0.95rem', 
                        lineHeight: 1.6,
                        fontWeight: message.sender === 'user' ? 400 : 500,
                      }
                    }}
                    secondaryTypographyProps={{
                      sx: { 
                        color: message.sender === 'user' ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                        fontSize: '0.75rem',
                        mt: 0.5,
                      }
                    }}
                  />
                </Paper>
              </ListItem>
            ))}
            {loading && (
              <ListItem sx={{ justifyContent: 'flex-start', px: 0 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  p: 2,
                  backgroundColor: '#fff',
                  borderRadius: '20px 20px 20px 4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  <CircularProgress size={20} thickness={4} />
                  <Typography variant="body2" color="text.secondary">
                    Study Buddy is thinking...
                  </Typography>
                </Box>
              </ListItem>
            )}
          </List>
        )}
      </Paper>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: '#fff',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              },
              '&.Mui-focused': {
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
              },
            },
          }}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSend}
          disabled={loading || !input.trim()}
          sx={{ 
            minWidth: 120,
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              background: '#e0e0e0',
              boxShadow: 'none',
            },
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;