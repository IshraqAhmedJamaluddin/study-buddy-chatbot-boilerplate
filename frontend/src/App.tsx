import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  Typography as MuiTypography,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatInterface from './components/ChatInterface';
import { Thread } from './types';

const THREADS_STORAGE_KEY = 'whiskers-threads';
const CURRENT_THREAD_KEY = 'whiskers-current-thread';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const drawerWidth = 280;

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
          messages: thread.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setThreads(threadsWithDates);

        if (savedCurrentThread && threadsWithDates.find((t: Thread) => t.id === savedCurrentThread)) {
          setCurrentThreadId(savedCurrentThread);
        } else if (threadsWithDates.length > 0) {
          const mostRecent = threadsWithDates.sort(
            (a: Thread, b: Thread) => b.updatedAt.getTime() - a.updatedAt.getTime()
          )[0];
          setCurrentThreadId(mostRecent.id);
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

  const generateThreadId = () => `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
      } else {
        setCurrentThreadId(null);
      }
    }
  };

  const currentThread = threads.find((t) => t.id === currentThreadId);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      {/* Hamburger Menu Button - Top Left */}
      <IconButton
        onClick={() => setSidebarOpen(!sidebarOpen)}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1301,
          color: 'white',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.6)',
          },
        }}
      >
        <MenuIcon />
      </IconButton>

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
            top: 0,
          },
        }}
      >
        <Box sx={{ p: 2, pt: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <MuiTypography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
              Chats
            </MuiTypography>
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
          <List sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
            {threads.length === 0 ? (
              <MuiTypography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                No chats yet. Start a new conversation!
              </MuiTypography>
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
                        <MuiTypography
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
                        </MuiTypography>
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
                      <MuiTypography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          mt: 0.5,
                        }}
                      >
                        {thread.messages.length} messages
                      </MuiTypography>
                    </Box>
                  </ListItem>
                ))
            )}
          </List>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        sx={{
          ml: sidebarOpen ? `${drawerWidth}px` : 0,
          transition: 'margin-left 0.3s ease',
          py: 4,
        }}
      >
        <Container maxWidth="lg" sx={{ height: '100vh', py: 4 }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Box
              sx={{
                mb: 1,
                display: 'inline-block',
                px: 3,
                py: 1.5,
                borderRadius: 4,
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #FF6B6B, #FFD93D, #6BCF7F, #4D96FF)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradientShift 3s ease infinite',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
                }}
              >
                🐱 Whiskers - Your Study Buddy 🐱
        </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: 500,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              Your AI study companion
        </Typography>
          </Box>
          <ChatInterface currentThreadId={currentThreadId} threads={threads} setThreads={setThreads} setCurrentThreadId={setCurrentThreadId} />
        </Container>
      </Box>
    </Box>
  );
}

export default App;
