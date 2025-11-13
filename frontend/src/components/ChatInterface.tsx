import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
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
  Grow,
  useTheme,
  createTheme, // Imported createTheme for conceptual use
  ThemeProvider, // Imported ThemeProvider for conceptual use
  CssBaseline, // Imported CssBaseline for global styling reset
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'; // Added for hero section icon
import { Message } from '../types';


// --- Theme Definition (Conceptual, typically done in a separate file) ---
// Define a soft, professional theme
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#007bff', // A soft, vibrant blue
      light: '#42a5f5',
    },
    secondary: {
      main: '#f0f2f5', // A light, soft background for the bot messages
      contrastText: '#333',
    },
    background: {
      default: '#ffffff',
      paper: '#f0f2f5', // Used for the general chat window background
    },
    text: {
      primary: '#1c1e21',
      secondary: '#606770',
    },
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
  },
  shape: {
    borderRadius: 8,
  },
});
// ------------------------------------------------------------------------


// Helper component for message content
const MessageBubble = ({ message }: { message: Message }) => {
  const theme = useTheme();
  const isUser = message.sender === 'user';
  
  // Use theme colors for consistency
  const backgroundColor = isUser ? theme.palette.primary.main : theme.palette.secondary.main;
  const textColor = isUser ? theme.palette.common.white : theme.palette.text.primary;
  
  // Softer shadow
  const shadow = isUser ? theme.shadows[3] : theme.shadows[1];

  return (
    <Grow in={true} timeout={300}>
      <Paper
        elevation={0} // We use BoxShadow instead of elevation for custom look
        sx={{
          p: 1.5,
          maxWidth: '75%',
          backgroundColor: backgroundColor,
          color: textColor,
          borderRadius: isUser ? '15px 15px 4px 15px' : '15px 15px 15px 4px', // Refined border radius
          boxShadow: shadow,
          transition: 'transform 0.1s ease-out', // Subtle press effect
          '&:active': {
            transform: 'scale(0.99)',
          },
        }}
      >
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {message.text}
        </Typography>
        <Typography 
          variant="caption" 
          component="div" 
          align={isUser ? 'right' : 'left'}
          sx={{
            mt: 0.5,
            color: isUser ? 'rgba(255,255,255,0.7)' : theme.palette.text.secondary,
            fontSize: '0.7rem',
          }}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Paper>
    </Grow>
  );
};


const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const theme = useTheme(); 

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    // ... (rest of handleSend logic remains the same)
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
      const res = await axios.post('http://localhost:3001/api/chat', {
        message: input,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: res.data.reply || 'No response received.',
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
    // Note: ThemeProvider and CssBaseline should ideally wrap your App component, 
    // but are included here conceptually.
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 200px)', 
        maxWidth: 700, // Constrain width for better desktop look
        mx: 'auto', // Center the chat interface
        p: 3, 
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.default, 
      }}
    >
        {/* --- Hero / Header Section --- */}
        <Box 
            sx={{ 
                textAlign: 'center', 
                mb: 2, 
                pb: 1,
                borderBottom: `2px solid ${theme.palette.divider}`,
            }}
        >
            <Typography variant="h4" component="div" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                Study Buddy 🧠
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Your AI-Powered Learning Assistant
            </Typography>
        </Box>

        {/* --- Chat Messages Window --- */}
        <Paper
            elevation={3} // Re-introducing elevation but keeping it soft
            sx={{
                flex: 1,
                overflowY: 'auto',
                mb: 2,
                p: 2,
                backgroundColor: theme.palette.background.paper, // Light grey background
                borderRadius: '16px',
                // Custom Scrollbar Styling (Webkit only)
                '&::-webkit-scrollbar': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.grey[400],
                    borderRadius: '10px',
                },
            }}
        >
            {messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                    <Avatar sx={{ width: 64, height: 64, m: '0 auto 10px', bgcolor: theme.palette.primary.light }}>
                        <ChatBubbleOutlineIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" color="text.primary" sx={{ fontWeight: 500 }}>
                        Start a Conversation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        I'm here to help you learn about Git, GitHub, and more!
                    </Typography>
                </Box>
            ) : (
                <List sx={{ p: 0 }}>
                    {messages.map((message) => (
                        <ListItem
                            key={message.id}
                            sx={{
                                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                p: 1.5,
                                display: 'flex',
                                alignItems: 'flex-end', // Align items to the bottom (text baseline)
                                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                            }}
                        >
                            {/* Avatar */}
                            <Avatar sx={{ 
                                bgcolor: message.sender === 'user' ? theme.palette.primary.light : theme.palette.secondary.contrastText, 
                                color: message.sender === 'user' ? theme.palette.common.white : theme.palette.common.white,
                                ml: message.sender === 'user' ? 1 : 0,
                                mr: message.sender === 'user' ? 0 : 1,
                                width: 32, 
                                height: 32,
                                fontSize: '1rem',
                                boxShadow: theme.shadows[2],
                            }}>
                                {message.sender === 'user' ? 'U' : 'AI'}
                            </Avatar>

                            {/* Message Bubble Component */}
                            <MessageBubble message={message} />
                        </ListItem>
                    ))}
                    
                    {/* Loading Indicator */}
                    {loading && (
                        <ListItem sx={{ justifyContent: 'flex-start', p: 1.5 }}>
                            <Avatar sx={{ bgcolor: theme.palette.secondary.contrastText, mr: 1, width: 32, height: 32, fontSize: '1rem', color: theme.palette.common.white }}>AI</Avatar>
                            <CircularProgress 
                                size={24} 
                                sx={{ color: theme.palette.text.secondary, ml: 1, animationDuration: '800ms' }} 
                            />
                        </ListItem>
                    )}
                    
                    {/* Scroll Anchor */}
                    <div ref={messagesEndRef} />
                </List>
            )}
        </Paper>

        {/* --- Input and Send Button --- */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask a question about Git/GitHub..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                size="medium"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '30px', // More rounded
                        paddingRight: '0 !important',
                        transition: 'box-shadow 0.2s',
                        '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.light,
                            boxShadow: `0 0 0 3px ${theme.palette.primary.light}30`, // Subtle glow on focus
                        },
                    },
                }}
            />
            <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSend}
                disabled={loading || !input.trim()}
                color="primary"
                sx={{ 
                    minWidth: 100, // Slightly reduced width
                    borderRadius: '30px', 
                    height: 50, 
                    textTransform: 'none', 
                    fontWeight: 600,
                    transition: 'transform 0.1s',
                    '&:active': {
                        transform: 'scale(0.98)',
                    }
                }}
            >
                Send
            </Button>
        </Box>
    </Box>
  );
};

export default ChatInterface;