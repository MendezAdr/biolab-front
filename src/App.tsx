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
import { RolesPage } from './components/pages/RolesPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/pages/LoginPage';

// 1. Sub-componente que actúa como Guardia de Seguridad
function RutasPrincipales() {
  const { usuario } = useAuth();

  // Si no hay usuario en memoria, interceptamos la pantalla y forzamos el Login
  if (!usuario) {
    return <LoginPage />;
  }

  // Si el usuario existe, le entregamos el mapa de rutas del sistema
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pacientes" element={<PacientesPage />} />
      <Route path="/examenes" element={<ExamenesPage />} />
      <Route path="/historial-facturas" element={<HistoricoFacturasPage />} />
      <Route path="/impresiones" element={<ImpresionesPage />} />
      <Route path="/presupuestos" element={<PresupuestosPage />} />
      <Route path="/usuarios" element={<UsuariosPage />} />
      <Route path="/pagos" element={<PagosPage />} />
      <Route path="/nueva-orden" element={<NuevaOrdenPage />} />
      <Route path="/roles" element={<RolesPage />} />
      
      {/* Ruta comodín: Si intentan entrar a una URL que no existe, los devuelve al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// 2. Componente Principal que envuelve la aplicación
export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider envuelve a RutasPrincipales para que useAuth pueda funcionar */}
      <AuthProvider>
        <RutasPrincipales />
      </AuthProvider>
    </BrowserRouter>
  );
}