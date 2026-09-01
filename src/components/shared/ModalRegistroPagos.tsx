import React, { useState, useEffect } from 'react';
import type { PagoStandaloneCreateDTO } from '../../types/DTOs/PagoStandaloneCreateDTO';
import type { PagoUpdateDTO } from '../../types/DTOs/PagoUpdateDTO';
import { MetodoPago } from '../../types/DTOs/MetodoPagoEnum';

interface ModalRegistroPagoProps {
  isOpen: boolean;               
  onClose: () => void;           
  onGuardar: (datos: PagoStandaloneCreateDTO | PagoUpdateDTO) => void; 
  pagoExistente: any | null; // Si viene lleno, estamos editando. Si es null, estamos creando.
}

export function ModalRegistroPago({ isOpen, onClose, onGuardar, pagoExistente }: ModalRegistroPagoProps) {
  
  const [ordenId, setOrdenId] = useState<number | ''>('');
  const [monto, setMonto] = useState<string>('');
  const [metodo, setMetodo] = useState<number>(1); // Asumiendo 1 = Punto, 2 = PagoMovil, etc.
  const [referencia, setReferencia] = useState('');

  const esModoEdicion = !!pagoExistente;

  useEffect(() => {
    if (isOpen) {
      if (esModoEdicion) {
        setOrdenId(pagoExistente.ordenId);
        setMonto(pagoExistente.monto.toString());
        setMetodo(pagoExistente.metodo);
        setReferencia(pagoExistente.referencia || '');
      } else {
        setOrdenId('');
        setMonto('');
        setMetodo(1);
        setReferencia('');
      }
    }
  }, [isOpen, pagoExistente, esModoEdicion]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!ordenId || !monto || !metodo) {
      alert("Completa los campos obligatorios.");
      return;
    }

    // Validación que replica la que tienes en tu IValidatableObject en C#
    const esPagoDigital = metodo === 2 || metodo === 6; // Ej: 2 = Pago Movil, 6 = Transferencia
    if (esPagoDigital && !referencia.trim()) {
      alert("Los pagos digitales requieren una referencia obligatoria.");
      return;
    }

    if (esModoEdicion) {
      const pagoCorregido: PagoUpdateDTO = {
        Id: pagoExistente.id,
        Monto: Number(monto),
        Metodo: MetodoPago,
        Referencia: referencia
      };
      onGuardar(pagoCorregido);
    } else {
      const nuevoAbono: PagoStandaloneCreateDTO = {
        OrdenId: Number(ordenId),
        Monto: Number(monto),
        Metodo: MetodoPago,
        Referencia: referencia
      };
      onGuardar(nuevoAbono);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
        
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {esModoEdicion ? 'Corregir Registro de Pago' : 'Registrar Nuevo Abono'}
            </h3>
            <p className="text-xs text-slate-500">
              {esModoEdicion ? 'Auditoría y modificación de caja' : 'Ingreso manual a una orden existente'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">ID de la Orden *</label>
            <input 
              type="number" 
              value={ordenId} 
              onChange={(e) => setOrdenId(Number(e.target.value))} 
              // Bloqueamos el input si estamos editando, para evitar que pasen el dinero a otra factura por accidente
              disabled={esModoEdicion} 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400" 
              placeholder="Ej. 12"
            />
            {esModoEdicion && <span className="text-[10px] text-slate-400">El ID de la orden no puede modificarse tras registrarse.</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Monto (USD) *</label>
              <input 
                type="number" 
                step="0.01" 
                value={monto} 
                onChange={(e) => setMonto(e.target.value)} 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" 
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Método *</label>
              <select 
                value={metodo} 
                onChange={(e) => setMetodo(Number(e.target.value))} 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none"
              >
                <option value={1}>Punto de Venta</option>
                <option value={2}>Pago Móvil</option>
                <option value={3}>BioPago</option>
                <option value={4}>Efectivo (Bs)</option>
                <option value={5}>Divisas</option>
                <option value={6}>Transferencia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Referencia</label>
            <input 
              type="text" 
              value={referencia} 
              onChange={(e) => setReferencia(e.target.value)} 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" 
              placeholder="Requerido para pagos digitales..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${esModoEdicion ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {esModoEdicion ? 'Guardar Corrección' : 'Registrar Abono'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}