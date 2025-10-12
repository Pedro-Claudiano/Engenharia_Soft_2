import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import Welcome from './pages/Welcome.jsx';
import Login from './pages/Login.jsx';
import './style.css';

// Criação do roteador com o mapa do site
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // O App é o layout principal
    children: [ // As páginas são "filhas" do layout
      {
        index: true,
        element: <Welcome />,
      },
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

