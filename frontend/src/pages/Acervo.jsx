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
  Chip,
  Tooltip, // 1. IMPORTADO
  Button, // 2. IMPORTADO
  Dialog, // 3. IMPORTADO
  DialogActions, // 4. IMPORTADO
  DialogContent, // 5. IMPORTADO
  DialogContentText, // 6. IMPORTADO
  DialogTitle // 7. IMPORTADO
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; // 8. IMPORTADO
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { apiService } from '../services/apiService';

export default function Acervo() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 9. ESTADOS PARA O DIALOG DE CONFIRMAÇÃO
  const [openConfirm, setOpenConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null); // Guarda o livro a ser deletado

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

  // 10. FUNÇÕES PARA CONTROLAR O DIALOG
  const handleClickOpenDelete = (livro) => {
    setBookToDelete(livro); // Guarda o livro
    setOpenConfirm(true); // Abre o dialog
  };

  const handleCloseDelete = () => {
    setOpenConfirm(false);
    setBookToDelete(null); // Limpa o livro
  };

  // 11. FUNÇÃO PARA CONFIRMAR A EXCLUSÃO
  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    setMessage(null);
    
    try {
      await apiService.deleteBook(bookToDelete.id);
      
      // Remove o livro da lista de resultados NA TELA
      setResults(results.filter(b => b.id !== bookToDelete.id));
      
      setMessage({ type: 'success', text: `Livro "${bookToDelete.titulo}" deletado com sucesso.` });
      
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao deletar livro.' });
    } finally {
      handleCloseDelete(); // Fecha o dialog
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
        <Container maxWidth="lg">
          <Paper
            elevation={3}
            sx={{
              padding: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              mb: 3
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
                      <TableCell sx={{ fontWeight: 600 }} align="center">Ações</TableCell>
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
                        <TableCell align="center">
                          <Tooltip title="Editar Livro">
                            <IconButton
                              component={RouterLink}
                              to={`/editar-livro/${livro.id}`}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {/* 12. BOTÃO DE DELETAR */}
                          <Tooltip title="Deletar Livro">
                            <IconButton
                              onClick={() => handleClickOpenDelete(livro)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
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

      {/* 13. DIALOG DE CONFIRMAÇÃO */}
      <Dialog
        open={openConfirm}
        onClose={handleCloseDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Você tem certeza que deseja deletar o livro
            <Typography component="span" sx={{ fontWeight: 600, display: 'block', mt: 1 }}>
              {bookToDelete?.titulo}
            </Typography>
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}