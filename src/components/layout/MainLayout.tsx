import React from 'react';
import { Sidebar } from './Sidebar';


interface MainLayoutProps {
  children: React.ReactNode; // Esto representa el contenido dinámico que irá a la derecha
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-emerald-500/70 text-slate-100">
      {/* Importamos el menú lateral fijo */}
      <Sidebar />

      {/* 'pl-64': ¡SUPER IMPORTANTE! Le da un margen izquierdo idéntico al ancho del Sidebar (w-64).
        Esto evita que el menú fijo tape el contenido de tus tablas o formularios.
      */}
      <main className="pl-64 min-h-screen ">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}