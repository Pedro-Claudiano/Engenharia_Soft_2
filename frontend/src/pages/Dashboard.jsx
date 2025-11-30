import React, { useEffect, useState } from 'react';
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
  Avatar,
  CircularProgress,
  Container,
  Divider
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person'; // <--- 1. IMPORTADO ÍCONE DE PESSOA
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { apiService } from '../services/apiService';

export default function Dashboard() {
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState({
    totalHistory: 0,
    activeLoans: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const loans = await apiService.getLoans();
        const active = loans.filter(l => !l.data_devolvido).length;
        const total = loans.length;

        setStatsData({
          totalHistory: total,
          activeLoans: active
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const stats = [
    {
      title: 'Histórico Total',
      value: loading ? '...' : statsData.totalHistory,
      icon: <MenuBookIcon />,
      color: 'primary.main',
      bgColor: 'primary.light'
    },
    {
      title: 'Empréstimos Ativos',
      value: loading ? '...' : statsData.activeLoans,
      icon: <AssignmentTurnedInIcon />,
      color: 'success.main',
      bgColor: 'success.light'
    }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="fixed" elevation={1}>
        <Toolbar>
          <MenuBookIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Biblioteca System
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
          p: 3,
          mt: 8,
          width: '100%',
        }}
      >
        <Container maxWidth="lg">
          
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
              Painel de Controle
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Visão geral e ferramentas de gerenciamento
            </Typography>
          </Box>

          {/* --- CARDS DE ESTATÍSTICAS --- */}
          <Grid container spacing={4} sx={{ mb: 6 }} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={5} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 3,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: stat.color,
                      width: 64,
                      height: 64,
                      mr: 3,
                      boxShadow: 2
                    }}
                  >
                    {loading ? <CircularProgress size={30} color="inherit" /> : stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="p" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ mb: 6 }} >
            <Typography color="text.secondary" variant="overline">ACESSO RÁPIDO</Typography>
          </Divider>

          {/* --- CARDS DE AÇÃO --- */}
          <Grid container spacing={4} justifyContent="center">
            
            {/* CARD 1: EMPRÉSTIMOS (md mudou para 4) */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 3,
                  transition: '0.3s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: 10 }
                }}
              >
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 70, height: 70, mb: 2 }}>
                  <AssignmentTurnedInIcon sx={{ fontSize: 35 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Empréstimos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Gerencie o fluxo de livros, saídas e devoluções.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/emprestimos"
                  fullWidth
                  sx={{ mt: 'auto', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Gerenciar
                </Button>
              </Paper>
            </Grid>

            {/* CARD 2: ACERVO (md mudou para 4) */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 3,
                  transition: '0.3s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: 10 }
                }}
              >
                <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main', width: 70, height: 70, mb: 2 }}>
                  <SearchIcon sx={{ fontSize: 35 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Acervo de Livros
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Consulte disponibilidade, adicione ou edite livros.
                </Typography>
                
                <Stack direction="row" spacing={2} sx={{ width: '100%', mt: 'auto' }}>
                  <Button
                    variant="outlined"
                    component={RouterLink}
                    to="/acervo"
                    fullWidth
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Buscar
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    component={RouterLink}
                    to="/cadastrar-livro"
                    fullWidth
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Novo
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            {/* CARD 3: CLIENTES (NOVO) */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 3,
                  transition: '0.3s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: 10 }
                }}
              >
                <Avatar sx={{ bgcolor: 'info.light', color: 'info.main', width: 70, height: 70, mb: 2 }}>
                  <PersonIcon sx={{ fontSize: 35 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Leitores
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Cadastre e gerencie os clientes da biblioteca.
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  color="info"
                  component={RouterLink}
                  to="/clientes"
                  fullWidth
                  sx={{ mt: 'auto', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Gerenciar Leitores
                </Button>
              </Paper>
            </Grid>

          </Grid>
        </Container>
      </Box>
    </Box>
  );
}