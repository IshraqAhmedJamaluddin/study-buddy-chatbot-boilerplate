import { useState, useEffect } from 'react';
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
  Drawer,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactMarkdown from 'react-markdown';
import { Message, Thread } from '../types';

const THREADS_STORAGE_KEY = 'whiskers-threads';
const CURRENT_THREAD_KEY = 'whiskers-current-thread';

const generateThreadId = () => `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const generateThreadTitle = (firstMessage: string): string => {
  // Generate title from first message (first 50 chars)
  const title = firstMessage.trim().slice(0, 50);
  return title || 'New Chat';
};

const ChatInterface = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentThread = threads.find((t) => t.id === currentThreadId);

  // Load threads from localStorage on mount
  useEffect(() => {
    const savedThreads = localStorage.getItem(THREADS_STORAGE_KEY);
    const savedCurrentThread = localStorage.getItem(CURRENT_THREAD_KEY);

    if (savedThreads) {
      try {
        const parsed = JSON.parse(savedThreads);
        const threadsWithDates = parsed.map((thread: Thread) => ({
          ...thread,
          createdAt: new Date(thread.createdAt),
          updatedAt: new Date(thread.updatedAt),
          messages: thread.messages.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setThreads(threadsWithDates);

        // Restore current thread if it exists
        if (savedCurrentThread && threadsWithDates.find((t: Thread) => t.id === savedCurrentThread)) {
          setCurrentThreadId(savedCurrentThread);
          const thread = threadsWithDates.find((t: Thread) => t.id === savedCurrentThread);
          if (thread) {
            setMessages(thread.messages);
          }
        } else if (threadsWithDates.length > 0) {
          // Load the most recent thread
          const mostRecent = threadsWithDates.sort(
            (a: Thread, b: Thread) => b.updatedAt.getTime() - a.updatedAt.getTime()
          )[0];
          setCurrentThreadId(mostRecent.id);
          setMessages(mostRecent.messages);
        }
      } catch (error) {
        console.error('Error loading threads:', error);
      }
    }
  }, []);

  // Save threads to localStorage whenever threads change
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
    }
  }, [threads]);

  // Save current thread ID
  useEffect(() => {
    if (currentThreadId) {
      localStorage.setItem(CURRENT_THREAD_KEY, currentThreadId);
    }
  }, [currentThreadId]);

  // Update messages when thread changes
  useEffect(() => {
    if (currentThreadId) {
      const thread = threads.find((t) => t.id === currentThreadId);
      if (thread) {
        setMessages(thread.messages);
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [currentThreadId, threads]);

  const createNewThread = () => {
    const newThread: Thread = {
      id: generateThreadId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setThreads((prev) => [newThread, ...prev]);
    setCurrentThreadId(newThread.id);
    setMessages([]);
    setSidebarOpen(false);
  };

  const switchThread = (threadId: string) => {
    setCurrentThreadId(threadId);
    setSidebarOpen(false);
  };

  const deleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedThreads = threads.filter((t) => t.id !== threadId);
    setThreads(updatedThreads);

    if (currentThreadId === threadId) {
      if (updatedThreads.length > 0) {
        const mostRecent = updatedThreads.sort(
          (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
        )[0];
        setCurrentThreadId(mostRecent.id);
        setMessages(mostRecent.messages);
      } else {
        setCurrentThreadId(null);
        setMessages([]);
      }
    }
  };

  const updateThread = (threadId: string, newMessages: Message[], title?: string) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          const updatedTitle = title || (newMessages.length > 0 && newMessages[0].sender === 'user'
            ? generateThreadTitle(newMessages[0].text)
            : thread.title);
          return {
            ...thread,
            messages: newMessages,
            title: updatedTitle,
            updatedAt: new Date(),
          };
        }
        return thread;
      })
    );
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    // Create new thread if none exists
    let threadId = currentThreadId;
    if (!threadId) {
      const newThread: Thread = {
        id: generateThreadId(),
        title: generateThreadTitle(input),
        messages: [userMessage],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setThreads((prev) => [newThread, ...prev]);
      threadId = newThread.id;
      setCurrentThreadId(threadId);
    }

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (threadId) {
      updateThread(threadId, updatedMessages);
    }
    setInput('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      // Prepare conversation history for context (last 10 messages to avoid token limits)
      const conversationHistory = updatedMessages
        .slice(-10)
        .map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        }));

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          history: conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'No response received from the server.',
        sender: 'bot',
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      if (threadId) {
        updateThread(threadId, finalMessages);
      }
    } catch (error) {
      console.error('Error sending message:', error);

      const errorText = error instanceof Error
        ? `Error: ${error.message}`
        : 'Error: Could not get response from server. Check your backend connection.';

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'bot',
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      if (threadId) {
        updateThread(threadId, finalMessages);
      }
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

  const drawerWidth = 280;

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 200px)' }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant="persistent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
              Chats
            </Typography>
            <Tooltip title="New Chat">
              <IconButton
                onClick={createNewThread}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  },
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={createNewThread}
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            New Chat
          </Button>
          <Divider sx={{ mb: 2 }} />
          <List sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
            {threads.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                No chats yet. Start a new conversation!
              </Typography>
            ) : (
              threads
                .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                .map((thread) => (
                  <ListItem
                    key={thread.id}
                    onClick={() => switchThread(thread.id)}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      cursor: 'pointer',
                      background: currentThreadId === thread.id
                        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                        : 'transparent',
                      border: currentThreadId === thread.id ? '2px solid #667eea' : '2px solid transparent',
                      '&:hover': {
                        background: 'rgba(102, 126, 234, 0.05)',
                      },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: currentThreadId === thread.id ? 600 : 400,
                            color: currentThreadId === thread.id ? '#667eea' : 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                          }}
                        >
                          {thread.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => deleteThread(thread.id, e)}
                          sx={{
                            ml: 1,
                            color: 'error.main',
                            '&:hover': {
                              background: 'rgba(211, 47, 47, 0.1)',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          mt: 0.5,
                        }}
                      >
                        {thread.messages.length} messages
                      </Typography>
                    </Box>
                  </ListItem>
                ))
            )}
          </List>
        </Box>
      </Drawer>

      {/* Main Chat Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: sidebarOpen ? 0 : 0,
          transition: 'margin 0.3s ease',
        }}
      >
        {/* Header with menu button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{
              color: 'white',
              background: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          {currentThread && (
            <Typography
              variant="h6"
              sx={{
                ml: 2,
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: 600,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              {currentThread.title}
            </Typography>
          )}
        </Box>

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
                Start a purrfect conversation with Whiskers!
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
    </Box>
  );
};

export default ChatInterface;
