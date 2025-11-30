import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container
} from '@mui/material';

import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

export default function Emprestimos() {
  const navigate = useNavigate();

  // 1. Mudamos de userId para clientId
  const [formData, setFormData] = useState({ bookId: '', clientId: '' });
  const [emprestimos, setEmprestimos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchEmprestimos();
  }, []);

  const fetchEmprestimos = async () => {
    try {
      const data = await apiService.getLoans();
      setEmprestimos(data);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao buscar dados.' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bookId || !formData.clientId) {
      setMessage({ type: 'error', text: 'Preencha todos os campos.' });
      return;
    }

    try {
      setIsLoading(true);
      // 2. Enviamos clientId para a API
      await apiService.createLoan(Number(formData.clientId), Number(formData.bookId));

      setMessage({ type: 'success', text: 'Empréstimo registrado com sucesso!' });
      setFormData({ bookId: '', clientId: '' });
      fetchEmprestimos();

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao registrar empréstimo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevolver = async (id) => {
    if (!window.confirm('Confirmar devolução do livro?')) return;

    try {
      await apiService.devolverLoan(id);
      setMessage({ type: 'success', text: 'Livro devolvido com sucesso!' });
      fetchEmprestimos(); 
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao devolver livro.' });
    }
  };

  const formatarData = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('pt-BR');
  };

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Gestão de Empréstimos
          </Typography>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Voltar
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

        <Paper sx={{ p: 3, mb: 4 }} component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>

            <Typography variant="h5">Registrar Novo Empréstimo</Typography>

            <Alert severity="info">
              Informe o ID do Livro e o ID do Cliente (Leitor).
            </Alert>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                name="bookId"
                type="number"
                label="ID do Livro"
                fullWidth
                value={formData.bookId}
                onChange={handleChange}
                required
              />

              <TextField
                name="clientId" // <--- Campo atualizado
                type="number"
                label="ID do Cliente" // <--- Label atualizado
                fullWidth
                value={formData.clientId} // <--- Valor atualizado
                onChange={handleChange}
                required
              />
            </Stack>

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={!isLoading && <AddCircleOutlineIcon />}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Registrar Empréstimo'}
            </Button>

            {message && <Alert severity={message.type}>{message.text}</Alert>}
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Empréstimos Ativos
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Livro</strong></TableCell>
                  <TableCell><strong>Cliente</strong></TableCell> {/* <--- Atualizado */}
                  <TableCell><strong>Data Empréstimo</strong></TableCell>
                  <TableCell><strong>Devolução Prevista</strong></TableCell>
                  <TableCell align="center"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {emprestimos
                  .filter(emp => !emp.data_devolvido) 
                  .map(emp => (
                    <TableRow key={emp.id} hover>
                      <TableCell>{emp.id}</TableCell>
                      <TableCell>{emp.titulo_livro}</TableCell>
                      {/* 3. Exibimos nome_cliente em vez de nome_usuario */}
                      <TableCell>
                        {emp.nome_cliente} 
                        <Typography variant="caption" display="block" color="text.secondary">
                          CPF: {emp.cpf_cliente}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatarData(emp.data_emprestimo)}</TableCell>
                      <TableCell>{formatarData(emp.data_devolucao_prevista)}</TableCell>

                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          startIcon={<KeyboardReturnIcon />}
                          onClick={() => handleDevolver(emp.id)}
                        >
                          Devolver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                {emprestimos.filter(emp => !emp.data_devolvido).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Nenhum empréstimo ativo no momento.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

      </Container>
    </Box>
  );
}