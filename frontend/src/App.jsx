// src/App.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="container">
      <main>
        {/* O Outlet renderiza o componente da rota ativa (Login ou Welcome) */}
        <Outlet />
      </main>
    </div>
  );
}

export default App;