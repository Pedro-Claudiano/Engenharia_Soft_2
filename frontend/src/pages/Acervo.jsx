import React, { useState, useEffect } from 'react'; // <--- 1. IMPORTADO USEEFFECT
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
  Tooltip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { apiService } from '../services/apiService';

export default function Acervo() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [openConfirm, setOpenConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  // --- 2. FUNÇÃO UNIFICADA DE BUSCA ---
  // Se passar termo, busca filtrado. Se não passar, busca tudo.
  const fetchBooks = async (term = '') => {
    setIsLoading(true);
    setMessage(null);
    try {
      const data = await apiService.searchBooks(term);
      setResults(data);
      
      if (data.length === 0) {
        setMessage({ type: 'info', text: 'Nenhum livro encontrado.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao buscar livros.' });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. CARREGA TUDO AO INICIAR A TELA ---
  useEffect(() => {
    fetchBooks(); // Chama sem parâmetros para trazer todos
  }, []);

  const handleLogout = () => {
    console.log("Usuário deslogado.");
    navigate('/');
  };

  // --- 4. BUSCA MANUAL (Ao clicar na lupa ou Enter) ---
  const handleSearch = (event) => {
    event.preventDefault();
    fetchBooks(searchTerm); // Chama com o termo digitado
  };

  // Funções do Dialog de Exclusão
  const handleClickOpenDelete = (livro) => {
    setBookToDelete(livro);
    setOpenConfirm(true);
  };

  const handleCloseDelete = () => {
    setOpenConfirm(false);
    setBookToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    setMessage(null);
    
    try {
      await apiService.deleteBook(bookToDelete.id);
      
      // Remove da lista visualmente
      setResults(results.filter(b => b.id !== bookToDelete.id));
      
      setMessage({ type: 'success', text: `Livro "${bookToDelete.titulo}" deletado com sucesso.` });
      
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao deletar livro.' });
    } finally {
      handleCloseDelete();
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
              Acervo Completo
            </Typography>
            <Box component="form" onSubmit={handleSearch} sx={{ width: '100%', mt: 2 }}>
              <TextField
                fullWidth
                id="search"
                label="Filtrar por Título ou Autor" // Mudei o label para ficar mais claro
                name="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
                placeholder="Deixe vazio para ver todos"
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

          {/* Agora a tabela aparece se tiver resultados OU se estiver carregando (para não piscar) */}
          {(results.length > 0 || isLoading) && (
            <Paper
              elevation={3}
              sx={{ padding: { xs: 2, sm: 3 }, borderRadius: 2, width: '100%' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Livros Cadastrados
                </Typography>
                <Chip label={`Total: ${results.length}`} color="default" />
              </Box>

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
                    {/* Se estiver carregando e não tiver resultados, mostra esqueleto ou nada */}
                    {results.map((livro) => (
                      <TableRow key={livro.id} hover>
                        <TableCell>{livro.titulo}</TableCell>
                        <TableCell>{livro.autor}</TableCell>
                        <TableCell>
                          <Chip
                            label={livro.status}
                            color={livro.status === 'Disponível' ? 'success' : 'warning'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar Livro">
                            <IconButton
                              component={RouterLink}
                              to={`/editar-livro/${livro.id}`}
                              color="primary"
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Deletar Livro">
                            <IconButton
                              onClick={() => handleClickOpenDelete(livro)}
                              color="error"
                              size="small"
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

      {/* Dialog de Confirmação mantém igual */}
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