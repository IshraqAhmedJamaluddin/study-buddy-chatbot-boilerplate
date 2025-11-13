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
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
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
      // Make API call to /api/chat endpoint
      // Use environment variable for API URL, fallback to localhost for development
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // Create a bot message with the response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'No response received from the server.',
        sender: 'bot',
        timestamp: new Date(),
      };

      // Add the bot message to the messages state
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Create an error message with more specific error information
      const errorText = error instanceof Error 
        ? `Error: ${error.message}` 
        : 'Error: Could not get response from server. Check your backend connection.';
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
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
        elevation={8}
        sx={{
          flex: 1,
          overflow: 'auto',
          mb: 2,
          p: 2,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                fontSize: '4rem',
                animation: 'bounce 2s infinite',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-20px)' },
                },
              }}
            >
              🐱
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#667eea',
                fontWeight: 600,
                mb: 1,
              }}
            >
              Meow there! 👋
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Start a purrfect conversation with your Study Buddy!
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                  alignItems: 'flex-end',
                }}
              >
                {message.sender === 'bot' && (
                  <Avatar
                    sx={{
                      bgcolor: '#FF6B6B',
                      mr: 1,
                      mb: 0.5,
                      width: 40,
                      height: 40,
                      fontSize: '1.5rem',
                    }}
                  >
                    🐱
                  </Avatar>
                )}
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    borderRadius: 3,
                    background: message.sender === 'user'
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                    },
                    '& .markdown-content': {
                      color: '#fff',
                      '& p': {
                        margin: '0 0 8px 0',
                        '&:last-child': {
                          marginBottom: 0,
                        },
                      },
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        margin: '12px 0 8px 0',
                        color: '#fff',
                        fontWeight: 600,
                        '&:first-child': {
                          marginTop: 0,
                        },
                      },
                      '& h1': { fontSize: '1.5rem' },
                      '& h2': { fontSize: '1.3rem' },
                      '& h3': { fontSize: '1.1rem' },
                      '& ul, & ol': {
                        margin: '8px 0',
                        paddingLeft: '20px',
                      },
                      '& li': {
                        margin: '4px 0',
                      },
                      '& code': {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                        fontFamily: 'monospace',
                      },
                      '& pre': {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        padding: '12px',
                        borderRadius: '6px',
                        overflow: 'auto',
                        margin: '8px 0',
                        '& code': {
                          backgroundColor: 'transparent',
                          padding: 0,
                        },
                      },
                      '& blockquote': {
                        borderLeft: '3px solid rgba(255, 255, 255, 0.5)',
                        paddingLeft: '12px',
                        margin: '8px 0',
                        fontStyle: 'italic',
                      },
                      '& a': {
                        color: '#fff',
                        textDecoration: 'underline',
                        '&:hover': {
                          opacity: 0.8,
                        },
                      },
                      '& strong': {
                        fontWeight: 600,
                      },
                      '& em': {
                        fontStyle: 'italic',
                      },
                    },
                  }}
                >
                  {message.sender === 'bot' ? (
                    <Box>
                      <Box className="markdown-content">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.75rem',
                          display: 'block',
                          mt: 1,
                        }}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>
                  ) : (
                    <ListItemText
                      primary={message.text}
                      secondary={message.timestamp.toLocaleTimeString()}
                      primaryTypographyProps={{
                        sx: { wordBreak: 'break-word', lineHeight: 1.6 },
                      }}
                      secondaryTypographyProps={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.75rem',
                      }}
                    />
                  )}
                </Paper>
                {message.sender === 'user' && (
                  <Avatar
                    sx={{
                      bgcolor: '#4D96FF',
                      ml: 1,
                      mb: 0.5,
                      width: 40,
                      height: 40,
                    }}
                  >
                    👤
                  </Avatar>
                )}
              </ListItem>
            ))}
            {loading && (
              <ListItem sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: '#FF6B6B',
                    mr: 1,
                    width: 40,
                    height: 40,
                    fontSize: '1.5rem',
                  }}
                >
                  🐱
                </Avatar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: '#f5576c' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                    Thinking...
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
          placeholder="Type your message... 🐾"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              '& fieldset': {
                borderColor: 'rgba(102, 126, 234, 0.3)',
                borderWidth: 2,
              },
              '&:hover fieldset': {
                borderColor: 'rgba(102, 126, 234, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#667eea',
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              background: 'rgba(102, 126, 234, 0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;

