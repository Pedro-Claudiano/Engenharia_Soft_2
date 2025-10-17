// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

// Importando o layout de seu novo arquivo
import CenteredLayout from './components/CenteredLayout.jsx';

// Importando todas as suas páginas
import Welcome from './pages/Welcome.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Emprestimos from './pages/Emprestimos.jsx';
import Register from './pages/Register.jsx'; // <-- 1. IMPORTE A NOVA PÁGINA

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
  { // <-- 2. ADICIONE A NOVA ROTA
    path: "/register",
    element: <CenteredLayout><Register /></CenteredLayout>,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/emprestimos",
    element: <Emprestimos />,
  },
]);

// --- RENDERIZAÇÃO PRINCIPAL DO APP ---
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <RouterProvider router={router} />
  </React.StrictMode>,
);