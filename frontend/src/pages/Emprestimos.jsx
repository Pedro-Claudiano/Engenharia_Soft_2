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
import { apiService } from '../services/apiService'; // IMPORTANTE

export default function Emprestimos() {
  const navigate = useNavigate();
  
  // Dados do formulário
  const [formData, setFormData] = useState({ bookId: '', userId: '' });

  // Lista de empréstimos
  const [emprestimos, setEmprestimos] = useState([]);

  // Feedback e loading
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Carregar empréstimos ao entrar
  useEffect(() => {
    fetchEmprestimos();
  }, []);

  const fetchEmprestimos = async () => {
    try {
      const data = await apiService.getLoans();
      setEmprestimos(data);
    } catch (error) {
      console.error("Erro ao buscar empréstimos:", error);
      setMessage({ type: 'error', text: 'Não foi possível carregar a lista de empréstimos.' });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Criar empréstimo
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.bookId || !formData.userId) {
      setMessage({ type: 'error', text: 'Preencha os IDs do Livro e do Leitor.' });
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      await apiService.createLoan(Number(formData.userId), Number(formData.bookId));

      setMessage({ type: 'success', text: 'Empréstimo registrado com sucesso!' });
      setFormData({ bookId: '', userId: '' });

      fetchEmprestimos();

    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao registrar empréstimo.' });
    } finally {
      setIsLoading(false);
    }
  };

  // DEVOLVER — AGORA USANDO O BACKEND
  const handleDevolver = async (id) => {
    if (!window.confirm("Confirmar devolução do livro?")) return;

    try {
      await apiService.returnLoan(id);

      setMessage({ type: 'success', text: 'Livro devolvido com sucesso!' });

      fetchEmprestimos();

    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erro ao devolver livro.' });
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Topo */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Gestão de Empréstimos
          </Typography>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Voltar ao Painel
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        
        {/* FORMULÁRIO */}
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mb: 4 }}>
          <Stack spacing={2}>
            
            <Typography variant="h5">Registrar Novo Empréstimo</Typography>

            <Alert severity="info">
              Digite o <strong>ID do Livro</strong> e o <strong>ID do Usuário</strong>.
            </Alert>

            <TextField
              type="number"
              label="ID do Livro"
              name="bookId"
              required
              value={formData.bookId}
              onChange={handleChange}
            />

            <TextField
              type="number"
              label="ID do Usuário (Leitor)"
              name="userId"
              required
              value={formData.userId}
              onChange={handleChange}
            />

            <Button
              type="submit"
              variant="contained"
              startIcon={!isLoading && <AddCircleOutlineIcon />}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Registrar Empréstimo"}
            </Button>

            {message?.text && (
              <Alert severity={message.type}>{message.text}</Alert>
            )}

          </Stack>
        </Paper>

        {/* LISTA */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Histórico de Empréstimos
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

                {emprestimos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Nenhum empréstimo encontrado.</TableCell>
                  </TableRow>
                ) : (
                  emprestimos.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.id}</TableCell>
                      <TableCell>{emp.titulo_livro}</TableCell>
                      <TableCell>{emp.nome_usuario}</TableCell>
                      <TableCell>{formatarData(emp.data_emprestimo)}</TableCell>
                      <TableCell>{formatarData(emp.data_devolucao_prevista)}</TableCell>

                      <TableCell>
                        <Button
                          variant="outlined"
                          startIcon={<KeyboardReturnIcon />}
                          onClick={() => handleDevolver(emp.id)}
                          color="warning"
                        >
                          Devolver
                        </Button>
                      </TableCell>

                    </TableRow>
                  ))
                )}

              </TableBody>
            </Table>
          </TableContainer>

        </Paper>
      </Box>
    </Box>
  );
}
