import React, { useState } from 'react';
import type { Factura } from '../../types/Factura';

interface ModalNuevaFacturaProps {
  isOpen: boolean;               // El interruptor: ¿está abierto?
  onClose: () => void;           // Función para apagar la lámpara (cerrar)
  onGuardar: (nueva: Factura) => void; // El puente: envía la factura creada al panel principal
}

export function ModalNuevaFactura({ isOpen, onClose, onGuardar }: ModalNuevaFacturaProps) {
  // Estados para capturar lo que el usuario escribe en los inputs
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');

  // Si el interruptor está apagado, el componente devuelve 'null' (no dibuja nada en pantalla)
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue (comportamiento HTML viejo)

    if (!descripcion || !monto) {
      alert("Por favor, rellena todos los campos");
      return;
    }

    // Armamos el objeto DTO idéntico a lo que espera tu estructura
    const facturaCreada: Factura = {
      id: Date.now(), // ID temporal único
      referencia: `FAC-${Math.floor(Math.random() * 900) + 100}`,
      TotalDolares: Number(monto),
      descripcion: descripcion,
      fecha: new Date().toISOString()
    };

    onGuardar(facturaCreada); // Enviamos los datos al componente padre
    
    // Limpiamos el formulario para la próxima vez que se abra
    setDescripcion('');
    setMonto('');
    onClose(); // Cerramos el modal automáticamente
  };

  return (
    // CONTENEDOR MAESTRO DEL MODAL (Cubre toda la pantalla)
    // 'fixed inset-0': Lo clava ocupando el 100% del monitor.
    // 'z-50': Lo pone por encima de la barra lateral y de las tablas.
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* 1. EL FONDO OSCURECIDO (Backdrop)
          Si el usuario hace clic aquí, también se cierra el modal.
      */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* 2. LA CAJA FLOTANTE (La ventana real)
          'relative': Para flotar sobre el fondo oscuro.
          'max-w-md w-full': Ancho controlado y estandarizado para formularios pequeños.
      */}
      <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 transition-all transform scale-100">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">Generar Nueva Factura</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Descripción del servicio
            </label>
            <input 
              type="text" 
              placeholder="Ej. Perfil Lipídico, Hematología..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Monto Total (USD)
            </label>
            <input 
              type="number" 
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 bg-slate-50"
            />
          </div>

          {/* Botones de acción inferiores */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Registrar Factura
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}