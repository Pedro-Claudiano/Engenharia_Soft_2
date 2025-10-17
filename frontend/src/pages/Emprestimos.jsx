// src/pages/Emprestimos.jsx

import React, { useState } from 'react';
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
  IconButton,
} from '@mui/material';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from 'react-router-dom';

// Dados de exemplo para simular empréstimos existentes
const emprestimosIniciais = [
  { id: 1, livro: 'O Senhor dos Anéis', leitor: 'Ana Silva', data: '2025-10-15' },
  { id: 2, livro: '1984', leitor: 'Carlos Souza', data: '2025-10-12' },
];

export default function Emprestimos() {
  const navigate = useNavigate();
  
  // State para o formulário
  const [formData, setFormData] = useState({ livro: '', leitor: '' });
  
  // State para a lista de empréstimos
  const [emprestimos, setEmprestimos] = useState(emprestimosIniciais);

  // States para feedback ao usuário
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Função para lidar com a mudança nos inputs do formulário
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // Função para submeter o formulário de novo empréstimo
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.livro || !formData.leitor) {
      setMessage({ type: 'error', text: 'Preencha o nome do livro e do leitor.' });
      return;
    }
    setIsLoading(true);
    setMessage('');

    // Simula uma chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const novoEmprestimo = {
      id: Date.now(), // ID único baseado no timestamp
      livro: formData.livro,
      leitor: formData.leitor,
      data: new Date().toISOString().split('T')[0], // Data de hoje
    };

    setEmprestimos(prevEmprestimos => [novoEmprestimo, ...prevEmprestimos]);
    setMessage({ type: 'success', text: 'Empréstimo registrado com sucesso!' });
    setFormData({ livro: '', leitor: '' }); // Limpa o formulário
    setIsLoading(false);
  };

  // Função para "devolver" um livro (removê-lo da lista)
  const handleDevolver = (id) => {
    setEmprestimos(prevEmprestimos => prevEmprestimos.filter(e => e.id !== id));
  };


  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f0f2f5', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gestão de Empréstimos
          </Typography>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>Voltar ao Painel</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {/* Seção do Formulário */}
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mb: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h5" component="h2" gutterBottom>
              Registrar Novo Empréstimo
            </Typography>
            <TextField
              required
              fullWidth
              id="livro"
              label="Nome do Livro ou ID"
              name="livro"
              value={formData.livro}
              onChange={handleChange}
              disabled={isLoading}
            />
            <TextField
              required
              fullWidth
              id="leitor"
              label="Nome do Leitor ou Matrícula"
              name="leitor"
              value={formData.leitor}
              onChange={handleChange}
              disabled={isLoading}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? null : <AddCircleOutlineIcon />}
              sx={{ py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Registrar'}
            </Button>
            {message && (
              <Alert severity={message.type} sx={{ width: '100%', mt: 2 }}>
                {message.text}
              </Alert>
            )}
          </Stack>
        </Paper>

        {/* Seção da Tabela de Empréstimos Ativos */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Empréstimos Ativos
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Livro</TableCell>
                  <TableCell>Leitor</TableCell>
                  <TableCell>Data do Empréstimo</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emprestimos.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.livro}</TableCell>
                    <TableCell>{emp.leitor}</TableCell>
                    <TableCell>{emp.data}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<KeyboardReturnIcon />}
                        onClick={() => handleDevolver(emp.id)}
                      >
                        Devolver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
}   