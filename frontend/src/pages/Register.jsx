// src/pages/Register.jsx

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Link,
  Paper,
  Avatar,
  Stack,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService'

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password || !confirmPassword) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    try {
      // 2. LÓGICA DE SIMULAÇÃO REMOVIDA
      // Agora apenas chama o apiService
      await apiService.register(nome, email, password);

      // 3. Sucesso!
      setMessage({ type: 'success', text: 'Conta criada com sucesso! Redirecionando para o login...' });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      // 4. O 'catch' pega o erro lançado pelo apiService
      console.error("Erro ao tentar registrar:", error);
      setMessage({ type: 'error', text: error.message || 'Ocorreu um erro ao criar a conta.' });
      setIsLoading(false); // Garante que o loading pare em caso de erro
    }
    // 'finally' foi removido pois o loading só deve parar no sucesso
    // após o timeout, ou imediatamente no erro.
  };

  return (
    <Paper
      elevation={6}
      sx={{
        p: { xs: 3, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 400,
        width: '90%',
        mx: 2,
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Criar Nova Conta
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
        <Stack spacing={2}>
          <TextField
            required
            fullWidth
            id="nome"
            label="Nome Completo"
            name="nome"
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            required
            fullWidth
            id="email"
            label="Endereço de Email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            required
            fullWidth
            name="confirmPassword"
            label="Confirmar Senha"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ py: 1.5 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Registrar'}
          </Button>
        </Stack>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Link component={RouterLink} to="/login" variant="body2">
            Já tem uma conta? Entre
          </Link>
        </Stack>

        {message && (
          <Alert severity={message.type} sx={{ width: '100%', mt: 2 }}>
            {message.text}
          </Alert>
        )}
      </Box>
    </Paper>
  );
}