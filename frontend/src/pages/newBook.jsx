import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  Button,
  Container,
  TextField,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService'; // 1. IMPORTA A FACHADA

export default function CadastrarLivro() {
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [isbn, setIsbn] = useState('');
  
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    console.log("Usuário deslogado.");
    navigate('/');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!titulo || !autor || !isbn) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // 2. LÓGICA MOVIDA PARA O APISERVICE
      const bookData = { titulo, autor, isbn };
      await apiService.createBook(bookData);

      // Sucesso
      setMessage({ type: 'success', text: `Livro "${titulo}" cadastrado com sucesso!` });
      setTitulo('');
      setAutor('');
      setIsbn('');

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao cadastrar livro.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="voltar"
            onClick={() => navigate('/dashboard')}
            edge="start"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
            Painel do Bibliotecário
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} aria-label="sair">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'grey.100',
          p: 3,
          mt: 8,
          minHeight: '100vh',
          boxSizing: 'border-box'
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={3}
            sx={{
              padding: { xs: 3, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LibraryAddIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
              Cadastrar Novo Livro
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Preencha os dados para adicionar o item ao acervo.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
              
              {message && (
                <Alert severity={message.type} sx={{ width: '100%', mb: 2 }}>
                  {message.text}
                </Alert>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="titulo"
                label="Título do Livro"
                name="titulo"
                autoFocus
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={isLoading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="autor"
                label="Autor"
                name="autor"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                disabled={isLoading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="isbn"
                label="ISBN (Código)"
                name="isbn"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Cadastrar Livro'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
