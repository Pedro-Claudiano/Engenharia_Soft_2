// src/pages/Dashboard.jsx

import React from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Paper, 
  Grid,
  Button,
  Stack,
  Avatar
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// DADOS FICTÍCIOS (MOCK): No futuro, virão de uma API.
const stats = [
  { 
    title: 'Livros Emprestados', 
    value: '78', 
    icon: <MenuBookIcon />, 
    color: 'primary.main' 
  },
  { 
    title: 'Empréstimos Ativos', 
    value: '12', 
    icon: <AssignmentTurnedInIcon />, 
    color: 'success.main' 
  },
  { 
    title: 'Leitores Cadastrados', 
    value: '153', 
    icon: <PeopleAltIcon />, 
    color: 'info.main' 
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Usuário deslogado.");
    navigate('/'); // Volta para a tela de Welcome/Login
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* A AppBar (barra superior) é o padrão em dashboards */}
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Painel Administrativo
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} aria-label="sair">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Conteúdo Principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          bgcolor: 'grey.100', // Um cinza bem claro para o fundo
          p: 3, 
          mt: 8 // Margem no topo para não ficar atrás da AppBar
        }}
      >
        <Typography variant="h4" gutterBottom>
          Bem-vindo, Administrador!
        </Typography>

        {/* --- Seção de Estatísticas Rápidas --- */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper 
                elevation={3} 
                sx={{ p: 2, display: 'flex', alignItems: 'center' }}
              >
                <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56, mr: 2 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h5" component="p">{stat.value}</Typography>
                  <Typography color="text.secondary">{stat.title}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        {/* --- Seção de Ações Rápidas --- */}
        <Typography variant="h5" gutterBottom>
          Ações Rápidas
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Ação: Gerenciar Empréstimos */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1} alignItems="center">
                <AssignmentTurnedInIcon color="primary" sx={{ fontSize: 40 }}/>
                <Typography variant="h6">Empréstimos</Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ minHeight: 40 }}>
                  Registre novos empréstimos e gerencie devoluções.
                </Typography>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/emprestimos"
                >
                  Acessar
                </Button>
              </Stack>
            </Grid>

            {/* Ação: Buscar no Acervo */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1} alignItems="center">
                <SearchIcon color="primary" sx={{ fontSize: 40 }}/>
                <Typography variant="h6">Acervo</Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ minHeight: 40 }}>
                  Busque por livros, autores e consulte a disponibilidade.
                </Typography>
                <Button 
                  variant="outlined" 
                  component={RouterLink} 
                  to="/acervo" // Rota futura
                >
                  Buscar
                </Button>
              </Stack>
            </Grid>

            {/* Ação: Histórico */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1} alignItems="center">
                <HistoryIcon color="primary" sx={{ fontSize: 40 }}/>
                <Typography variant="h6">Histórico</Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ minHeight: 40 }}>
                  Consulte o histórico completo de empréstimos do sistema.
                </Typography>
                <Button 
                  variant="outlined" 
                  component={RouterLink} 
                  to="/historico" // Rota futura
                >
                  Ver Histórico
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}