import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Avatar,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { Link as RouterLink } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(''); // Limpa a mensagem anterior

    // Validação para verificar se o campo está vazio
    if (!email) {
      setMessage({ type: 'error', text: 'Por favor, preencha o campo de e-mail.' });
      return;
    }

    setIsLoading(true);
    try {
      // Simula uma chamada de API para enviar o email
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessage({ type: 'success', text: 'Se um e-mail correspondente for encontrado, um link de redefinição será enviado.' });
    } catch {
      setMessage({ type: 'error', text: 'Ocorreu um erro ao tentar enviar o e-mail. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
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
        animation: 'fadeIn 0.5s ease-in-out',
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockResetIcon />
      </Avatar>
      <Typography component="h1" variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
        Redefinir Senha
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Insira seu e-mail abaixo e enviaremos um link para você voltar a acessar sua conta.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Endereço de E-mail"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          sx={{ mt: 3, mb: 2, py: 1.5 }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Link de Redefinição'}
        </Button>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <MuiLink component={RouterLink} to="/login" variant="body2">
              Voltar para o Login
            </MuiLink>
          </Grid>
        </Grid>

        {/* Componente de Alerta para exibir mensagens */}
        {message && (
          <Alert severity={message.type} sx={{ width: '100%', mt: 2 }}>
            {message.text}
          </Alert>
        )}
      </Box>
    </Paper>
  );
}

