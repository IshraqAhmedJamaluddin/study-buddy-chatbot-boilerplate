import { useState, useEffect, useRef } from 'react';
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
  IconButton,
  Chip,
  Fade,
  Tooltip,
  Alert,
  Collapse,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HistoryIcon from '@mui/icons-material/History';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    'Explain quantum physics',
    'Help me with calculus',
    'Study tips for exams',
    'What is photosynthesis?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    setShowSuggestions(false);
    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
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
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'No response from server.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Could not connect to Study Buddy. Please check your connection.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Please try again.',
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    setError(null);
  };

  const handleFeedback = (messageId: string, type: 'like' | 'dislike') => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              liked: type === 'like' ? !msg.liked : false,
              disliked: type === 'dislike' ? !msg.disliked : false,
            }
          : msg
      )
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          borderRadius: 0,
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'rgba(255,255,255,0.25)',
              fontSize: '1.5rem',
              fontWeight: 700,
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            }}
          >
            SB
          </Avatar>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              Study Buddy
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                opacity: 0.9,
                fontWeight: 400,
              }}
            >
              Your intelligent study companion
            </Typography>
          </Box>
        </Box>
        
        {messages.length > 0 && (
          <Tooltip title="Clear chat">
            <IconButton
              onClick={handleClearChat}
              sx={{
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </Paper>

      {/* Error Alert */}
      <Collapse in={!!error}>
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ m: 2, mb: 0, borderRadius: 2 }}
        >
          {error}
        </Alert>
      </Collapse>

      {/* Messages Container */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          overflow: 'auto',
          m: 2,
          p: 3,
          background: 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)',
          borderRadius: 3,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
          '&::-webkit-scrollbar': {
            width: 12,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, #667eea, #764ba2)',
            borderRadius: 12,
            border: '3px solid transparent',
            backgroundClip: 'padding-box',
          },
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              mt: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '2.5rem',
              }}
            >
              💬
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: '#667eea',
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                  mb: 1,
                }}
              >
                Start a conversation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ask Study Buddy anything about your studies!
              </Typography>
            </Box>

            {showSuggestions && (
              <Fade in timeout={500}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 2 }}>
                  {suggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      icon={<AutoAwesomeIcon />}
                      onClick={() => handleSend(suggestion)}
                      sx={{
                        py: 2.5,
                        px: 1,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                        border: '1px solid #667eea30',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #667eea25 0%, #764ba225 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Fade>
            )}
          </Box>
        ) : (
          <List>
            {messages.map((message, index) => (
              <Fade in key={message.id} timeout={300}>
                <ListItem
                  sx={{
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                      maxWidth: '80%',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        background:
                          message.sender === 'user'
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: '#fff',
                        boxShadow:
                          message.sender === 'user'
                            ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                            : '0 4px 12px rgba(245, 87, 108, 0.3)',
                      }}
                    >
                      {message.sender === 'user' ? '👤' : '🤖'}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          background:
                            message.sender === 'user'
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : '#fff',
                          color: message.sender === 'user' ? '#fff' : '#1a1a1a',
                          boxShadow:
                            message.sender === 'user'
                              ? '0 8px 24px rgba(102, 126, 234, 0.15)'
                              : '0 4px 12px rgba(0, 0, 0, 0.08)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow:
                              message.sender === 'user'
                                ? '0 12px 32px rgba(102, 126, 234, 0.2)'
                                : '0 6px 16px rgba(0, 0, 0, 0.12)',
                          },
                        }}
                      >
                        <ListItemText
                          primary={message.text}
                          secondary={message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          primaryTypographyProps={{
                            sx: {
                              fontWeight: 500,
                              lineHeight: 1.6,
                              letterSpacing: '0.3px',
                              whiteSpace: 'pre-wrap',
                            },
                          }}
                          secondaryTypographyProps={{
                            color:
                              message.sender === 'user'
                                ? 'rgba(255,255,255,0.7)'
                                : 'text.secondary',
                            sx: { fontSize: '0.75rem', mt: 0.5 },
                          }}
                        />
                      </Paper>

                      {message.sender === 'bot' && (
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                          <Tooltip title="Copy message">
                            <IconButton
                              size="small"
                              onClick={() => handleCopy(message.text, message.id)}
                              sx={{
                                color: copied === message.id ? '#667eea' : '#999',
                                '&:hover': { backgroundColor: '#f0f2ff' },
                              }}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Helpful">
                            <IconButton
                              size="small"
                              onClick={() => handleFeedback(message.id, 'like')}
                              sx={{
                                color: message.liked ? '#667eea' : '#999',
                                '&:hover': { backgroundColor: '#f0f2ff' },
                              }}
                            >
                              <ThumbUpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Not helpful">
                            <IconButton
                              size="small"
                              onClick={() => handleFeedback(message.id, 'dislike')}
                              sx={{
                                color: message.disliked ? '#f5576c' : '#999',
                                '&:hover': { backgroundColor: '#fff0f2' },
                              }}
                            >
                              <ThumbDownIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </ListItem>
              </Fade>
            ))}
            {loading && (
              <Fade in>
                <ListItem sx={{ justifyContent: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      }}
                    >
                      🤖
                    </Avatar>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        background: '#fff',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <CircularProgress size={24} sx={{ color: '#667eea' }} />
                    </Box>
                  </Box>
                </ListItem>
              </Fade>
            )}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Paper>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          gap: 1.5,
          background: '#fff',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          multiline
          maxRows={3}
          inputRef={inputRef}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              transition: 'all 0.3s ease',
              background: '#f8f9ff',
              '&:hover': {
                background: '#f0f2ff',
              },
              '&.Mui-focused': {
                background: '#fff',
                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
              },
            },
            '& .MuiOutlinedInput-input::placeholder': {
              color: '#b0b9d4',
              opacity: 1,
            },
          }}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          sx={{
            minWidth: 120,
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover:not(:disabled)': {
              boxShadow: '0 12px 28px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-2px)',
            },
            '&:active:not(:disabled)': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              background: '#d0d5e8',
              color: '#999',
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