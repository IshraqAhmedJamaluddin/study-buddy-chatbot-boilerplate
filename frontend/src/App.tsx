// export default App;
import { Container, Typography, Box, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChatInterface from './components/ChatInterface';

//  Bright Bluish Luxury Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#eef3f8', // very soft blue-gray
      paper: 'rgba(255, 255, 255, 0.8)', // translucent white
    },
    primary: {
      main: '#4a90e2', // luxury royal blue
    },
    secondary: {
      main: '#a1c4fd', // light sky gradient tone
    },
    text: {
      primary: '#1f2a44', // deep navy-gray for readability
      secondary: '#5c6b80',
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Cormorant Garamond', serif",
    h3: {
      fontWeight: 700,
      letterSpacing: '0.8px',
      color: '#1f2a44',
    },
    subtitle1: {
      fontStyle: 'italic',
      letterSpacing: '0.3px',
      color: '#5c6b80',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Soft blue gradient background */}
      <Box
        sx={{
          height: '100vh',
          background:
            'radial-gradient(circle at 25% 20%, rgba(173,216,255,0.25) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(193,225,255,0.3) 0%, transparent 40%), linear-gradient(135deg, #e8f0ff 0%, #eef3f8 50%, #dae7fa 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          position: 'relative',
          animation: 'glow 14s infinite alternate',
          '@keyframes glow': {
            '0%': { backgroundPosition: '0% 50%' },
            '100%': { backgroundPosition: '100% 50%' },
          },
        }}
      >
        {/* Subtle blue ambient glow */}
        <Box
          sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(100,149,237,0.2) 0%, transparent 70%)',
            top: '10%',
            left: '15%',
            filter: 'blur(120px)',
            zIndex: 0,
          }}
        />

        {/* Elegant Glass Container */}
        <Container
          maxWidth="md"
          sx={{
            position: 'relative',
            zIndex: 1,
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: 5,
            boxShadow:
              '0 0 40px rgba(74,144,226,0.25), inset 0 0 10px rgba(255,255,255,0.1)',
            border: '1px solid rgba(74,144,226,0.3)',
            p: 5,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow:
                '0 0 50px rgba(74,144,226,0.35), inset 0 0 10px rgba(255,255,255,0.15)',
              transform: 'scale(1.01)',
            },
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            {/* Gradient Title */}
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                background:
                  'linear-gradient(90deg, #4a90e2 0%, #89f7fe 50%, #4a90e2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow:
                  '0 0 15px rgba(100,149,237,0.3), 0 0 5px rgba(255,255,255,0.2)',
                animation: 'shine 6s linear infinite',
                backgroundSize: '200% auto',
                '@keyframes shine': {
                  '0%': { backgroundPosition: '0% center' },
                  '100%': { backgroundPosition: '200% center' },
                },
              }}
            >
              Study Buddy
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: '#44536a',
                fontWeight: 400,
                mt: -1,
              }}
            >
              Your AI companion for ITI studies
            </Typography>
          </Box>

          {/* Chat Interface */}
          <ChatInterface />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
