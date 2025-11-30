// src/pages/Emprestimos.jsx

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
} from '@mui/material';

import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

export default function Emprestimos() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ bookId: '', userId: '' });
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
      // O '||' serve como um "ou", caso o erro não tenha mensagem, usa a fixa.
      setMessage({ type: 'error', text: error.message || 'Erro ao devolver livro.' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bookId || !formData.userId) {
      setMessage({ type: 'error', text: 'Preencha todos os campos.' });
      return;
    }

    try {
      setIsLoading(true);
      await apiService.createLoan(Number(formData.userId), Number(formData.bookId));

      setMessage({ type: 'success', text: 'Empréstimo registrado!' });
      setFormData({ bookId: '', userId: '' });
      fetchEmprestimos();

    } catch (error) {
      // O '||' serve como um "ou", caso o erro não tenha mensagem, usa a fixa.
      setMessage({ type: 'error', text: error.message || 'Erro ao devolver livro.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevolver = async (id) => {
    if (!window.confirm('Confirmar devolução?')) return;

    try {
      await apiService.devolverLoan(id);

      setMessage({ type: 'success', text: 'Livro devolvido com sucesso!' });

      fetchEmprestimos(); // Atualiza lista — emprestimo some da tabela

    } catch (error) {
      // O '||' serve como um "ou", caso o erro não tenha mensagem, usa a fixa.
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

      <Box sx={{ p: 3 }}>

        <Paper sx={{ p: 3, mb: 4 }} component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>

            <Typography variant="h5">Registrar Empréstimo</Typography>

            <Alert severity="info">
              Preencha o ID do Livro e o ID do Usuário.
            </Alert>

            <TextField
              name="bookId"
              type="number"
              label="ID do Livro"
              value={formData.bookId}
              onChange={handleChange}
              required
            />

            <TextField
              name="userId"
              type="number"
              label="ID do Usuário"
              value={formData.userId}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              variant="contained"
              startIcon={!isLoading && <AddCircleOutlineIcon />}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Registrar'}
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
                  <TableCell><strong>Leitor</strong></TableCell>
                  <TableCell><strong>Data Empréstimo</strong></TableCell>
                  <TableCell><strong>Devolução Prevista</strong></TableCell>
                  <TableCell><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>

                {emprestimos
                  .filter(emp => !emp.data_devolvido)  // ⬅ IMPORTANTE: só mostra ativos
                  .map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.id}</TableCell>
                      <TableCell>{emp.titulo_livro}</TableCell>
                      <TableCell>{emp.nome_usuario}</TableCell>
                      <TableCell>{formatarData(emp.data_emprestimo)}</TableCell>
                      <TableCell>{formatarData(emp.data_devolucao_prevista)}</TableCell>

                      <TableCell>
                        <Button
                          variant="outlined"
                          color="warning"
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

      </Box>
    </Box>
  );
}
