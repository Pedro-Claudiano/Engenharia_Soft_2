// src/App.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Box, 
  CssBaseline, 
  Switch, 
  FormControlLabel, 
  ThemeProvider, 
  createTheme,
  useMediaQuery
} from '@mui/material';

export default function App() {
  // Define o tema inicial baseado na preferência do sistema do usuário
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = React.useState(prefersDarkMode ? 'dark' : 'light');

  const theme = React.useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2', // Um azul clássico e profissional
      },
      background: {
        // Cores de fundo mais suaves
        default: mode === 'light' ? '#f4f6f8' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      // Integra a fonte Poppins diretamente no tema
      fontFamily: "'Poppins', sans-serif",
      h5: {
        fontWeight: 500,
      },
    },
    // Bordas levemente arredondadas para um visual moderno
    shape: {
      borderRadius: 8,
    },
  }), [mode]);

  const handleThemeChange = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16, 
          zIndex: 1 
        }}
      >
        <FormControlLabel
          control={<Switch checked={mode === 'dark'} onChange={handleThemeChange} />}
          label={mode === 'dark' ? '🌙' : '☀️'}
        />
      </Box>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // NOVO: Fundo com gradiente sutil que muda com o tema
          background: mode === 'light'
            ? 'linear-gradient(135deg, #e3f2fd 30%, #f4f6f8 90%)'
            : 'linear-gradient(135deg, #0d1b2a 30%, #121212 90%)',
        }}
      >
        <Outlet /> {/* As páginas serão renderizadas aqui */}
      </Box>
    </ThemeProvider>
  );
}