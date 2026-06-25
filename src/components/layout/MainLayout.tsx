import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Estado que controla si la barra lateral está visible o colapsada
  const [sidebarAbierta, setSidebarAbierta] = useState(true);

  return (
    <div className="min-h-screen bg-emerald-500/30 text-slate-100 flex relative overflow-x-hidden">
      
      {/* Botón Flotante "Sandwich" / Hamburguesa
          Se queda fijo arriba a la izquierda. Si la barra está abierta, se mueve junto con ella o se oculta.
      */}
      <button
        onClick={() => setSidebarAbierta(!sidebarAbierta)}
        className={`fixed top-68 z-50 p-1 rounded-lg bg-emerald-200 text-emerald-700  hover:bg-emerald-50 transition-all duration-300 cursor-pointer ${
          sidebarAbierta ? 'left-58' : 'left-2'
        }`}
        title={sidebarAbierta ? "Colapsar menú" : "Expandir menú"}
      >
        {sidebarAbierta ? (
          // Icono de flecha apuntando a la izquierda (para cerrar)
        <span className="text-lg font-bold">↩</span>
        ) : (
          // Icono clásico de tres líneas de menú (Hamburguesa)
          <span className="text-lg font-bold">☰</span>
        )}
      </button>

      {/* Importamos el menú lateral pasándole el estado y la función para cerrarlo */}
    
      <Sidebar abierta={sidebarAbierta} setAbierta={setSidebarAbierta} />

      {/* 'transition-all duration-300': Hace que el movimiento de las tablas sea fluido y suave al abrir/cerrar.
          'pl-64' o 'pl-0': Ajuste dinámico de margen según el estado.
      */}
      <main 
        className={`flex-1 min-h-screen bg-no-repeat bg-cover bg-center bg-fixed transition-all duration-300 ${
          sidebarAbierta ? 'pl-64' : 'pl-0'
        }`}
        style={{ backgroundImage: "url('/src/assets/Bioanalisis.jpg')" }}
      >
        {/* Capa de tinte blanco para suavizar la imagen */}
        <div className="min-h-screen bg-slate-50/80 p-8">
          {/* Añadimos un pt-16 (padding top) para que el contenido no se pegue con el botón flotante cuando esté cerrado */}
          <div className="max-w-7xl mx-auto pt-12 md:pt-4">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}