// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import CenteredLayout from './components/CenteredLayout.jsx';

// Importando todas as suas páginas
import Welcome from './pages/Welcome.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Emprestimos from './pages/Emprestimos.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import NewBook from './pages/newBook.jsx';
import Acervo from './pages/Acervo.jsx';
import EditarLivro from './pages/editBook.jsx';

// --- CONFIGURAÇÃO DAS ROTAS ---
const router = createBrowserRouter([
  {
    path: "/",
    element: <CenteredLayout><Welcome /></CenteredLayout>,
  },
  {
    path: "/login",
    element: <CenteredLayout><Login /></CenteredLayout>,
  },
  { 
    path: "/register",
    element: <CenteredLayout><Register /></CenteredLayout>,
  },
  {
    path: "/ForgotPassword",
    element: <CenteredLayout><ForgotPassword /></CenteredLayout>,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/emprestimos",
    element: <Emprestimos />,
  },
  {
    path: "/cadastrar-livro",
    element: <NewBook />, // Não usa o CenteredLayout pois tem seu próprio AppBar
  },
  {
    path: "/acervo",
    element: <Acervo />,
  },
  {
    path: "/editar-livro/:id", // 2. ROTA ADICIONADA AQUI
    element: <EditarLivro />,
  },
]);

// --- RENDERIZAÇÃO PRINCIPAL DO APP ---
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <RouterProvider router={router} />
  </React.StrictMode>,
);