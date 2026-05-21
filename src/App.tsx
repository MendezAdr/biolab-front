import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { PacientesPage } from './components/pages/PacientesPage';
import { ExamenesPage } from './components/pages/ExamenesPage';
import { UsuariosPage } from './components/pages/UsuariosPage';
import { PresupuestosPage } from './components/pages/PresupuestosPage';
import { ImpresionesPage } from './components/pages/ImpresionesPage';
import { FacturasPage } from './components/pages/FacturasPage';
import { HomePage } from './components/pages/HomePages';

function App() {
  return (
    <BrowserRouter>
      
        <Routes>
          {/* Si el usuario entra a la raíz "/", lo redirigimos automáticamente a "/pacientes" */}
          <Route path="/" element={<HomePage />} />
          
          {/* Definición de las rutas del sistema */}
          <Route path="/pacientes" element={<PacientesPage />} />
          <Route path="/examenes" element={<ExamenesPage />} />
          <Route path="/facturas" element={<FacturasPage />} />
          <Route path="/impresiones" element={<ImpresionesPage />} />
          <Route path="/presupuestos" element={<PresupuestosPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
        </Routes>
      
    </BrowserRouter>
  );
}

export default App;