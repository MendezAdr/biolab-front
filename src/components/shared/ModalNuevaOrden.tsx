import React, { useState, useEffect } from 'react';
import type { OrdenCreateDTO } from '../../types/DTOs/OrdenCreateDTO'; 

interface ModalNuevaOrdenProps {
  isOpen: boolean;               
  onClose: () => void;           
  onGuardar: (nueva: OrdenCreateDTO) => void; 
}

export function ModalNuevaOrden({ isOpen, onClose, onGuardar }: ModalNuevaOrdenProps) {
  // Estados para los campos principales del DTO
  const [numeroFactura, setNumeroFactura] = useState('');
  const [pacienteId, setPacienteId] = useState<number>(0);
  const [totalDivisa, setTotalDivisa] = useState('');
  const [tasaBcv, setTasaBcv] = useState('');

  // Limpiar formulario al abrir
  useEffect(() => {
    if (isOpen) {
      // En un entorno real, el Número de Factura podría autogenerarse en el backend. 
      // Si debes enviarlo desde el front, lo simulamos aquí:
      setNumeroFactura(`ORD-${Math.floor(Math.random() * 9000) + 1000}`);
      setPacienteId(0);
      setTotalDivisa('');
      setTasaBcv('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!numeroFactura || pacienteId === 0 || !totalDivisa || !tasaBcv) {
      alert("Por favor, rellena todos los campos principales de la orden.");
      return;
    }

    // Construimos el DTO respetando la estructura estricta que espera C#
    const ordenCreada: OrdenCreateDTO = {
      NumeroFactura: numeroFactura,
      PacienteId: pacienteId,
      TotalDivisa: Number(totalDivisa),
      TasaBCV: Number(tasaBcv),
      Fecha: new Date(),
      // Inicializamos las listas vacías para cumplir con el DTO. 
      // Más adelante, aquí inyectarás los arreglos generados por sub-formularios.
      Detalles: [], 
      Pagos: []     
    };

    onGuardar(ordenCreada); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Generar Nueva Orden</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">N° Documento</label>
              <input 
                type="text" 
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">ID Paciente</label>
              <input 
                type="number" 
                placeholder="Ej. 1"
                value={pacienteId || ''}
                onChange={(e) => setPacienteId(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Monto (USD)</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={totalDivisa}
                onChange={(e) => setTotalDivisa(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tasa BCV</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="Ej. 36.50"
                value={tasaBcv}
                onChange={(e) => setTasaBcv(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mt-2">
            <p className="text-xs text-blue-700">
              * Nota: La selección interactiva de múltiples exámenes y métodos de pago se implementará en la siguiente fase visual.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm">
              Registrar Orden
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}