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
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          {/* --- TÍTULO ATUALIZADO --- */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Painel do Bibliotecário
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} aria-label="sair">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'grey.100', // Fundo cinza claro
          p: 3,
          mt: 8, // Margem do topo para a AppBar
          minHeight: '100vh',
          boxSizing: 'border-box'
        }}
      >
        {/* --- SAUDAÇÃO ATUALIZADA --- */}
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Bem-vindo, Bibliotecário!
        </Typography>

        {/* Cards de estatísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={3}
                sx={{ p: 2.5, display: 'flex', alignItems: 'center', borderRadius: 2 }}
              >
                <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56, mr: 2 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h5" component="p" sx={{ fontWeight: 600 }}>{stat.value}</Typography>
                  <Typography color="text.secondary">{stat.title}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Ações Rápidas
        </Typography>
        
        {/* Card de Ações Rápidas */}
        <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1} alignItems="center">
                <AssignmentTurnedInIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6">Empréstimos</Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ minHeight: 40 }}>
                  Registre novos empréstimos e gerencie devoluções.
                </Typography>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/emprestimos"
                  sx={{ mt: 1 }}
                >
                  Acessar
                </Button>
              </Stack>
            </Grid>

            {/* --- CARD ACERVO AJUSTADO --- */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1} alignItems="center">
                <SearchIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6">Acervo</Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ minHeight: 40 }}>
                  Busque, cadastre ou gerencie os livros do sistema.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    variant="outlined"
                    component={RouterLink}
                    to="/acervo"
                  >
                    Buscar
                  </Button>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/cadastrar-livro"
                  >
                    Cadastrar
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            {/* --- FIM DO AJUSTE --- */}

            <Grid item xs={12} md={4}>
              <Stack spacing={1} alignItems="center">
                <HistoryIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6">Histórico</Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ minHeight: 40 }}>
                  Consulte o histórico completo de empréstimos do sistema.
                </Typography>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/historico"
                  sx={{ mt: 1 }}
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

