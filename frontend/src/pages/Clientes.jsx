import React, { useState, useEffect } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Paper, Container,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Tooltip, Alert, CircularProgress, Fab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

export default function Clientes() {
  const navigate = useNavigate();
  
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Estados do Dialog de Cadastro/Edição
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ nome: '', cpf: '' });

  // Estados do Dialog de Exclusão
  const [openConfirm, setOpenConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const data = await apiService.getClients();
      setClientes(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar clientes.' });
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DO FORMULÁRIO (CRIAR/EDITAR) ---
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData({ nome: '', cpf: '' });
    setOpenDialog(true);
  };

  const handleOpenEdit = (cliente) => {
    setIsEditMode(true);
    setCurrentId(cliente.id);
    setFormData({ nome: cliente.nome, cpf: cliente.cpf });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.cpf) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      if (isEditMode) {
        await apiService.updateClient(currentId, formData);
        setMessage({ type: 'success', text: 'Cliente atualizado!' });
      } else {
        await apiService.createClient(formData);
        setMessage({ type: 'success', text: 'Cliente cadastrado!' });
      }
      setOpenDialog(false);
      fetchClientes(); // Atualiza a lista
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  // --- LÓGICA DE EXCLUSÃO ---
  const handleDeleteClick = (cliente) => {
    setClientToDelete(cliente);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await apiService.deleteClient(clientToDelete.id);
      setMessage({ type: 'success', text: 'Cliente removido.' });
      fetchClientes();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setOpenConfirm(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            Gestão de Leitores (Clientes)
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 10, mb: 4 }}>
        
        {message && (
          <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" /> Lista de Clientes
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
              Novo Cliente
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Nome</strong></TableCell>
                    <TableCell><strong>CPF</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id} hover>
                      <TableCell>{cliente.id}</TableCell>
                      <TableCell>{cliente.nome}</TableCell>
                      <TableCell>{cliente.cpf}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton color="primary" onClick={() => handleOpenEdit(cliente)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton color="error" onClick={() => handleDeleteClick(cliente)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {clientes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">Nenhum cliente cadastrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* DIALOG DE CRIAR/EDITAR */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEditMode ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome Completo"
            fullWidth
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          />
          <TextField
            margin="dense"
            label="CPF"
            fullWidth
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          Tem certeza que deseja excluir o cliente <strong>{clientToDelete?.nome}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>Excluir</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}