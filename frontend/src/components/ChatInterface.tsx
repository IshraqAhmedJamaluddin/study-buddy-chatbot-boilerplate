import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  Avatar,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { motion, AnimatePresence } from 'framer-motion';
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
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '⚠️ Error: Could not get response from server. Check your backend connection.',
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 150px)',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
        borderRadius: 4,
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          flex: 1,
          overflowY: 'auto',
          mb: 2,
          p: 3,
          borderRadius: 3,
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography variant="h6" color="text.secondary">
              💬 Start a conversation with <b>Study Buddy!</b>
            </Typography>
          </Box>
        ) : (
          <List>
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ListItem
                    sx={{
                      justifyContent:
                        message.sender === 'user' ? 'flex-end' : 'flex-start',
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: 1,
                    }}
                  >
                    {message.sender === 'bot' && (
                      <Avatar sx={{ bgcolor: '#1976d2' }}>
                        <SmartToyIcon />
                      </Avatar>
                    )}
                    <Paper
                      elevation={2}
                      sx={{
                        p: 1.5,
                        px: 2,
                        borderRadius:
                          message.sender === 'user'
                            ? '16px 16px 4px 16px'
                            : '16px 16px 16px 4px',
                        backgroundColor:
                          message.sender === 'user' ? '#1976d2' : '#ffffff',
                        color:
                          message.sender === 'user' ? '#fff' : '#1a1a1a',
                        maxWidth: '70%',
                        wordWrap: 'break-word',
                        boxShadow:
                          message.sender === 'user'
                            ? '0px 2px 8px rgba(25, 118, 210, 0.3)'
                            : '0px 2px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <Typography variant="body1">{message.text}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          textAlign:
                            message.sender === 'user' ? 'right' : 'left',
                          opacity: 0.7,
                          fontSize: '0.75rem',
                        }}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Paper>
                    {message.sender === 'user' && (
                      <Avatar sx={{ bgcolor: '#64b5f6' }}>
                        <PersonIcon />
                      </Avatar>
                    )}
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <ListItem sx={{ justifyContent: 'flex-start', mt: 1 }}>
                <CircularProgress size={24} />
              </ListItem>
            )}
          </List>
        )}
      </Paper>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: '#fff',
          borderRadius: 3,
          boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
          p: 1,
        }}
      >
        <TextField
          fullWidth
          variant="standard"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          InputProps={{
            disableUnderline: true,
            sx: { px: 2, py: 1.2, fontSize: '1rem' },
          }}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSend}
          disabled={loading || !input.trim()}
          sx={{
            borderRadius: '50px',
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#115293',
              transform: 'scale(1.05)',
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
