import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  Container,
  TextField,
  Avatar,
  Alert,
  CircularProgress,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

export default function Acervo() {
  const navigate = useNavigate();

  // Estados da busca
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]); // Para guardar os livros encontrados
  
  // Estados de controle
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    console.log("Usuário deslogado.");
    navigate('/');
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchTerm) {
      setMessage({ type: 'error', text: 'Por favor, digite um termo para buscar.' });
      setResults([]);
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setResults([]);

    try {
      // Chama a função de busca da nossa fachada
      const data = await apiService.searchBooks(searchTerm);
      
      if (data.length === 0) {
        setMessage({ type: 'info', text: 'Nenhum livro encontrado para este termo.' });
      } else {
        setResults(data);
      }

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao buscar livros.' });
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

      {/* Conteúdo principal com fundo cinza */}
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
        <Container maxWidth="lg">
          {/* Card 1: A Busca */}
          <Paper
            elevation={3}
            sx={{
              padding: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              mb: 3 // Margem abaixo do card de busca
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <SearchIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
              Buscar no Acervo
            </Typography>
            <Box component="form" onSubmit={handleSearch} sx={{ width: '100%', mt: 2 }}>
              <TextField
                fullWidth
                id="search"
                label="Buscar por Título ou Autor"
                name="search"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="submit"
                        aria-label="buscar"
                        disabled={isLoading}
                      >
                        {isLoading ? <CircularProgress size={24} /> : <SearchIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Paper>

          {/* Card 2: Os Resultados */}
          {message && !isLoading && (
            <Alert severity={message.type} sx={{ width: '100%', mt: 2, mb: 2 }}>
              {message.text}
            </Alert>
          )}

          {results.length > 0 && (
            <Paper
              elevation={3}
              sx={{ padding: { xs: 2, sm: 3 }, borderRadius: 2, width: '100%' }}
            >
              <Typography variant="h6" gutterBottom>
                Resultados da Busca
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Título</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Autor</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((livro) => (
                      <TableRow key={livro.id}>
                        <TableCell>{livro.titulo}</TableCell>
                        <TableCell>{livro.autor}</TableCell>
                        <TableCell>
                          <Chip
                            label={livro.status}
                            color={livro.status === 'Disponível' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Container>
      </Box>
    </Box>
  );
}

