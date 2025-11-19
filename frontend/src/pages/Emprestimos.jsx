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
import { apiService } from '../services/apiService'; // <--- 1. IMPORTANTE

export default function Emprestimos() {
  const navigate = useNavigate();
  
  // State para o formulário (agora esperamos IDs)
  const [formData, setFormData] = useState({ bookId: '', userId: '' });
  
  // State para a lista de empréstimos
  const [emprestimos, setEmprestimos] = useState([]);

  // States para feedback ao usuário
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // <--- 2. CARREGAR DADOS AO ABRIR A TELA
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
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // <--- 3. ENVIAR DADOS PARA O BACKEND
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validação simples
    if (!formData.bookId || !formData.userId) {
      setMessage({ type: 'error', text: 'Preencha os IDs do Livro e do Leitor.' });
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Converte para número, pois o backend espera Int
      await apiService.createLoan(Number(formData.userId), Number(formData.bookId));

      setMessage({ type: 'success', text: 'Empréstimo registrado com sucesso!' });
      setFormData({ bookId: '', userId: '' }); // Limpa o formulário
      
      // Recarrega a lista para mostrar o novo empréstimo
      fetchEmprestimos(); 

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao registrar empréstimo.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para "devolver" (Por enquanto apenas visual, backend ainda não tem essa rota)
  const handleDevolver = (id) => {
    alert("Funcionalidade de devolver no backend ainda será implementada!");
    setEmprestimos(prev => prev.filter(e => e.id !== id));
  };

  // Função auxiliar para formatar data
  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    return new Date(dataISO).toLocaleDateString('pt-BR');
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
            
            <Alert severity="info">
              Por enquanto, insira o <strong>ID (Número)</strong> do Livro e do Usuário.
              Você pode vê-los no banco de dados.
            </Alert>

            <TextField
              required
              fullWidth
              type="number"
              id="bookId"
              label="ID do Livro"
              name="bookId"
              value={formData.bookId}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Ex: 1"
            />
            <TextField
              required
              fullWidth
              type="number"
              id="userId"
              label="ID do Usuário (Leitor)"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Ex: 1"
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? null : <AddCircleOutlineIcon />}
              sx={{ py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Registrar Empréstimo'}
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
                  {/* <TableCell align="right">Ações</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {emprestimos.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={5} align="center">Nenhum empréstimo encontrado.</TableCell>
                   </TableRow>
                ) : (
                  emprestimos.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.id}</TableCell>
                      {/* Usamos as chaves exatas que vêm do Backend/SQL */}
                      <TableCell>{emp.titulo_livro}</TableCell>
                      <TableCell>{emp.nome_usuario}</TableCell>
                      <TableCell>{formatarData(emp.data_emprestimo)}</TableCell>
                      <TableCell>{formatarData(emp.data_devolucao_prevista)}</TableCell>
                      
                      { <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<KeyboardReturnIcon />}
                          onClick={() => handleDevolver(emp.id)}
                        >
                          Devolver
                        </Button>
                      </TableCell> 
                      }
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