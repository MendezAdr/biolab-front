import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import type { OrdenCreateDTO } from '../../types/DTOs/OrdenCreateDTO'; 

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

interface ModalNuevaOrdenProps {
  isOpen: boolean;               
  onClose: () => void;           
  onGuardar: (nueva: OrdenCreateDTO) => void; 
}

export function ModalNuevaOrden({ isOpen, onClose, onGuardar }: ModalNuevaOrdenProps) {
  const { tienePermiso } = useAuth();
  const puedeCrearOrden = tienePermiso(PERMISOS.CREAR_ORDENES_Y_DETALLES);

  const [numeroFactura, setNumeroFactura] = useState('');
  const [pacienteId, setPacienteId] = useState<number>(0);
  const [totalDivisa, setTotalDivisa] = useState('');
  const [tasaBcv, setTasaBcv] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNumeroFactura(`ORD-${Math.floor(Math.random() * 900) + 100}`);
      setPacienteId(0);
      setTotalDivisa('');
      setTasaBcv('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!numeroFactura || pacienteId === 0 || !totalDivisa || !tasaBcv) {
      toast.error("Por favor, rellena todos los campos principales de la orden.");
      return;
    }

    const ordenCreada: OrdenCreateDTO = {
      numeroFactura: numeroFactura,
      pacienteId: pacienteId,
      totalDivisa: Number(totalDivisa),
      tasaBcv: Number(tasaBcv),
      fecha: new Date(),
      detalles: [], 
      pagos: []     
    };

    onGuardar(ordenCreada); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Toaster position="bottom-right" />
      <div className="absolute inset-0 bg-sky-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-sky-100 max-w-md w-full p-7">
        
        <div className="flex justify-between items-center mb-6 border-b border-sky-50 pb-3">
          <h3 className="text-xl font-bold text-sky-900">Generar Nueva Orden</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 transition-colors font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">N° Documento</label>
              <input 
                type="text" 
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">ID Paciente</label>
              <input 
                type="number" 
                placeholder="Ej. 1"
                value={pacienteId || ''}
                onChange={(e) => setPacienteId(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Monto (USD)</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={totalDivisa}
                onChange={(e) => setTotalDivisa(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Tasa BCV</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="Ej. 36.50"
                value={tasaBcv}
                onChange={(e) => setTasaBcv(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900"
              />
            </div>
          </div>

          <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl mt-4 shadow-sm">
            <p className="text-xs text-sky-700 font-medium leading-relaxed">
              <span className="font-bold text-sky-800 text-sm block mb-1">ℹ️ Información</span>
              La selección interactiva de múltiples exámenes y métodos de pago se implementará en la siguiente fase visual del componente.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-5 border-t border-sky-50 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
              Cancelar
            </button>
            
            <div className="inline-block" title={!puedeCrearOrden ? "No posees los privilegios necesarios para emitir nuevas órdenes." : ""}>
              <button 
                type="submit" 
                disabled={!puedeCrearOrden}
                className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-md transition-all ${!puedeCrearOrden ? 'bg-slate-300 text-white cursor-not-allowed shadow-none' : 'text-white bg-sky-500 hover:bg-sky-400 hover:-translate-y-0.5'}`}
              >
                Registrar Orden
              </button>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}