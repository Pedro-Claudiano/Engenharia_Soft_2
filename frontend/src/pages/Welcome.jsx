// src/pages/Welcome.jsx

import React from 'react';
import { Box, Button, Typography, Paper, Avatar, Stack } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook'; // Ícone de livro
import { Link } from 'react-router-dom';

export default function Welcome() {
  return (
    <Paper
      elevation={6} // Sombra mais pronunciada para o card
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 400,
        mx: 2, // Margem nas laterais em telas pequenas
        animation: 'fadeIn 0.5s ease-in-out',
      }}
    >
      {/* NOVO: Avatar com ícone para identidade visual */}
      <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
        <MenuBookIcon />
      </Avatar>
      <Typography component="h1" variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
        Biblioteca Digital
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Faça login ou crie uma conta para acessar nosso acervo.
      </Typography>

      {/* ALTERADO: Usando Stack para organizar os botões */}
      <Stack spacing={2} sx={{ width: '100%' }}>
        <Button
          component={Link}
          to="/login"
          variant="contained"
          size="large"
        >
          Entrar
        </Button>
        <Button
          component={Link}
          to="/register"
          variant="outlined"
          size="large"
        >
          Registrar
        </Button>
      </Stack>
    </Paper>
  );
}