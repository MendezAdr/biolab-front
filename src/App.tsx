import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PacientesPage } from './components/pages/PacientesPage';
import { ExamenesPage } from './components/pages/ExamenesPage';
import { UsuariosPage } from './components/pages/UsuariosPage';
import { PresupuestosPage } from './components/pages/PresupuestosPage';
import { PagosPage } from './components/pages/PagosPage';
import { ImpresionesPage } from './components/pages/ImpresionesPage';
import { HistoricoFacturasPage } from './components/pages/HistoricoFacturasPage';
import { HomePage } from './components/pages/HomePages';
import { NuevaOrdenPage } from './components/pages/NuevaOrdenPage';

function App() {
  return (
    <BrowserRouter>
      
        <Routes>
          {/* Si el usuario entra a la raíz "/", lo redirigimos automáticamente a "/pacientes" */}
          <Route path="/" element={<HomePage />} />
          
          {/* Definición de las rutas del sistema */}
          <Route path="/pacientes" element={<PacientesPage />} />
          <Route path="/examenes" element={<ExamenesPage />} />
          <Route path="/historial-facturas" element={<HistoricoFacturasPage />} />
          <Route path="/impresiones" element={<ImpresionesPage />} />
          <Route path="/presupuestos" element={<PresupuestosPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/pagos" element={<PagosPage/>} />
          <Route path="/nueva-orden" element={<NuevaOrdenPage />} />
        </Routes>
      
    </BrowserRouter>
  );
}

export default App;