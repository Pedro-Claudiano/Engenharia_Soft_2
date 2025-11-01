// src/pages/Login.jsx

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Paper,
  Avatar,
  Stack,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' });
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // 2. LÓGICA DE SIMULAÇÃO REMOVIDA
      // Agora apenas chama o apiService
      await apiService.login(email, password);
      
      // 3. Sucesso! Navega para o dashboard
      navigate('/dashboard');

    } catch (error) {
      // 4. O 'catch' pega o erro lançado pelo apiService
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        // AJUSTE 1: Aumentando o padding (espaçamento interno).
        // Em telas pequenas (xs) o padding será 3 (24px) e em maiores (sm) será 4 (32px).
        p: { xs: 3, sm: 4 }, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 400,
        width: '90%', // Garante que não cole nas bordas em telas muito pequenas
        mx: 2,
        animation: 'fadeIn 0.5s ease-in-out',
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Acessar sua Conta
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
        <Stack spacing={2}>
          <TextField
            required
            fullWidth
            id="email"
            label="Endereço de Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            required
            fullWidth
            name="password"
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ py: 1.5 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>
        </Stack>

        {/* AJUSTE 2: Substituindo Grid por Stack para alinhar os links corretamente. */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
          sx={{ mt: 2 }}
        >
          <Link component={RouterLink} to="/" variant="body2">
            Página Inicial
          </Link>
          <Link component={RouterLink} to="/ForgotPassword" variant="body2">
            Esqueceu a senha?
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