import { Container, Typography, Box } from '@mui/material';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        py: 4,
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
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
              🐱 Whiskers | Your Study Buddy 🐱
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
            Your AI companion that's the cat's meow! 🐾
          </Typography>
        </Box>
        <ChatInterface />
      </Container>
    </Box>
  );
}

export default App;

