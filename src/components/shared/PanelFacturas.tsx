import React, { useState } from 'react';
import type { Factura } from "../../types/Factura";
// 1. Importamos nuestro nuevo componente modal
import { ModalNuevaFactura } from './ModalNuevaFactura';

export function PanelFacturas() {
  const [listaFacturas, setListaFacturas] = useState<Factura[]>([
    { id: 1, referencia: "FAC-001", TotalDolares: 120, descripcion: "Perfil general", fecha: "2026-06-14T08:00:00" },
    { id: 2, referencia: "FAC-002", TotalDolares: 45,  descripcion: "Hematología",   fecha: "2026-06-15T09:30:00" },
  ]);

  /* ========================================================================
     EL INTERRUPTOR DEL MODAL
     Falso = Cerrado / Verdadero = Abierto
     ========================================================================
  */
  const [modalAbierto, setModalAbierto] = useState(false);

  // Esta función recibe el objeto capturado en el modal y lo inyecta arriba a la izquierda
  function manejarGuardarFactura(facturaNueva: Factura) {
    setListaFacturas([facturaNueva, ...listaFacturas]);
  }

  const facturasOrdenadas = [...listaFacturas].sort(
    (b, a) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  return (
    <div className="space-y-6 p-2">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Módulo de Facturación</h2>
          <p className="text-xs text-slate-500">Historial ordenado cronológicamente</p>
        </div>
        
        {/* 2. Al hacer clic, encendemos el interruptor cambiando el estado a TRUE */}
        <button 
          onClick={() => setModalAbierto(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm"
        >
          + Nueva Factura
        </button>
      </div>

      {/* Cuadrícula de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {facturasOrdenadas.map((factura) => (
          <div key={factura.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                {factura.referencia}
              </span>
              <span className="text-lg font-bold text-slate-800">${factura.TotalDolares}.00</span>
            </div>
            <p className="text-sm text-slate-600">{factura.descripcion}</p>
          </div>
        ))}
      </div>

      {/* ========================================================================
         3. INYECTAMOS EL COMPONENTE MODAL EN LA BASE DEL DOCUMENTO
         Le pasamos el estado actual (isOpen), y las funciones para reaccionar.
         ========================================================================
      */}
      <ModalNuevaFactura 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        onGuardar={manejarGuardarFactura}
      />
    </div>
  );
}