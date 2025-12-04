import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  // TextField, // <--- REMOVIDO
  Stack,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  // NOVOS COMPONENTES:
  Select, 
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';

import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

export default function Emprestimos() {
  const navigate = useNavigate();

  // 1. Estados Existentes
  const [formData, setFormData] = useState({ bookId: '', clientId: '' });
  const [emprestimos, setEmprestimos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // 2. NOVOS ESTADOS PARA LISTAS DO SELECT
  const [livrosDisponiveis, setLivrosDisponiveis] = useState([]);
  const [clientesDisponiveis, setClientesDisponiveis] = useState([]);


  useEffect(() => {
    fetchEmprestimos();
    fetchListas(); // <--- NOVO: Carrega os dados para o Select
  }, []);

  const fetchEmprestimos = async () => {
    try {
      const data = await apiService.getLoans();
      setEmprestimos(data);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao buscar dados.' });
    }
  };

  // 3. NOVA FUNÇÃO: Carrega listas de Livros e Clientes
  const fetchListas = async () => {
    try {
      const [booksData, clientsData] = await Promise.all([
        apiService.getAllBooks(),
        apiService.getClients() // <--- USA A FUNÇÃO QUE JÁ EXISTIA
      ]);
      setLivrosDisponiveis(booksData);
      setClientesDisponiveis(clientsData);
    } catch (error) {
      console.error("Erro ao carregar listas:", error);
      setMessage({ type: 'error', text: 'Erro ao carregar opções de seleção.' });
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    // O valor do Select é o ID, que é exatamente o que o formulário espera
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // A validação agora checa se o Select tem algum valor (ID)
    if (!formData.bookId || !formData.clientId) {
      setMessage({ type: 'error', text: 'Selecione o Livro e o Cliente.' });
      return;
    }
    // ... O restante da lógica de envio (try/catch/finally) é MANTIDO
    try {
      setIsLoading(true);
      await apiService.createLoan(Number(formData.clientId), Number(formData.bookId));

      setMessage({ type: 'success', text: 'Empréstimo registrado com sucesso!' });
      setFormData({ bookId: '', clientId: '' });
      fetchEmprestimos();
      // Opcional: Re-carregar listas para atualizar estoque exibido
      fetchListas(); 

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
      fetchListas(); // <--- Recarrega listas para atualizar estoque
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
              Selecione o Livro e o Cliente (Leitor).
            </Alert>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              
              {/* CAMPO DE LIVRO: AGORA É UM SELECT */}
              <FormControl fullWidth required disabled={isLoading}>
                <InputLabel id="select-livro-label">Selecione o Livro</InputLabel>
                <Select
                  labelId="select-livro-label"
                  name="bookId"
                  value={formData.bookId}
                  label="Selecione o Livro"
                  onChange={handleChange}
                >
                  {livrosDisponiveis.map((livro) => (
                    <MenuItem key={livro.id} value={livro.id} disabled={livro.quantidade_estoque === 0}>
                      {livro.titulo} (Estoque: {livro.quantidade_estoque})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* CAMPO DE CLIENTE: AGORA É UM SELECT */}
              <FormControl fullWidth required disabled={isLoading}>
                <InputLabel id="select-cliente-label">Selecione o Cliente</InputLabel>
                <Select
                  labelId="select-cliente-label"
                  name="clientId"
                  value={formData.clientId}
                  label="Selecione o Cliente"
                  onChange={handleChange}
                >
                  {clientesDisponiveis.map((cliente) => (
                    <MenuItem key={cliente.id} value={cliente.id}>
                      {/* O backend deve retornar nome, mas fallback para email/ID */}
                      {cliente.nome ? cliente.nome : `ID: ${cliente.id}`} 
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
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
                  <TableCell><strong>Cliente</strong></TableCell>
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