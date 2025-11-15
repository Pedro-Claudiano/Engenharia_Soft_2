import React, { useState, useEffect } from 'react';
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
import EditIcon from '@mui/icons-material/Edit'; // Ícone alterado
import { useNavigate, useParams } from 'react-router-dom'; // Importa useParams
import { apiService } from '../services/apiService';

export default function EditarLivro() {
  const navigate = useNavigate();
  const { id } = useParams(); // Pega o ID da URL (ex: /editar-livro/2)

  // Estados do formulário
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [isbn, setIsbn] = useState('');
  
  // Estados de controle
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true); // Loading da página

  // Efeito para buscar os dados do livro quando a página carrega
  useEffect(() => {
    if (!id) return;
    
    const fetchBookData = async () => {
      setIsPageLoading(true);
      setMessage(null);
      try {
        // Usa a fachada para buscar o livro
        const book = await apiService.getBookById(id);
        setTitulo(book.titulo);
        setAutor(book.autor);
        setIsbn(book.isbn);
      } catch (error) {
        setMessage({ type: 'error', text: error.message || 'Erro ao buscar dados do livro.' });
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchBookData();
  }, [id]); // Executa toda vez que o ID mudar

  const handleLogout = () => {
    console.log("Usuário deslogado.");
    navigate('/');
  };

  // Função de submit atualizada para "update"
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!titulo || !autor || !isbn) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const bookData = { titulo, autor, isbn };
      // Usa a fachada para atualizar o livro
      await apiService.updateBook(id, bookData); 

      setMessage({ type: 'success', text: `Livro "${titulo}" atualizado com sucesso!` });
      
      setTimeout(() => navigate('/acervo'), 1500); // Volta para a busca

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar livro.' });
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
            onClick={() => navigate('/acervo')} // Volta para o acervo
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
              <EditIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
              Editar Livro
            </Typography>

            {/* Mostra um loading enquanto busca os dados do livro */}
            {isPageLoading ? (
              <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Buscando dados do livro...</Typography>
              </Box>
            ) : (
              /* Mostra o formulário após carregar */
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
                  {isLoading ? <CircularProgress size={24} /> : 'Salvar Alterações'}
                </Button>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}