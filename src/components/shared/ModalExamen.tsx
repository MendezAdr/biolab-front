import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; 
import type { ExamenCreateDTO } from '../../types/DTOs/ExamenCreateDTO';
import type { ExamenUpdateDTO } from '../../types/DTOs/ExamenUpdateDTO';
import type { Examen } from '../../types/ExamenModel';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';
import { AuditoriaFooter } from './AuditoriaFooter';

interface ModalExamenProps {
  isOpen: boolean;               
  onClose: () => void;           
  onGuardar: (datos: ExamenCreateDTO | ExamenUpdateDTO) => void; 
  examenExistente: Examen | null; 
}

export function ModalExamen({ isOpen, onClose, onGuardar, examenExistente }: ModalExamenProps) {
  const { tienePermiso } = useAuth();
  const puedeGestionarExamenes = tienePermiso(PERMISOS.GESTIONAR_EXAMENES);

  const [nombre, setNombre] = useState('');
  const [costo, setCosto] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const esModoEdicion = !!examenExistente;

  useEffect(() => {
    if (isOpen) {
      if (esModoEdicion && examenExistente) {
        // EXTRACCIÓN SEGURA (camelCase con contingencia)
        setNombre(examenExistente.nombreExamen ?? (examenExistente as any).NombreExamen ?? '');
        setCosto((examenExistente.costoEnDivisa ?? (examenExistente as any).CostoEnDivisa ?? 0).toString());
        setDescripcion(examenExistente.descripcion ?? (examenExistente as any).Descripcion ?? '');
      } else {
        setNombre('');
        setCosto('');
        setDescripcion('');
      }
    }
  }, [isOpen, examenExistente, esModoEdicion]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!nombre || !costo) {
      toast.error("El nombre y el costo son obligatorios.");
      return;
    }

    // PAYLOADS ESTRICTAMENTE EN camelCase
    if (esModoEdicion && examenExistente) {
      const examenActualizado: ExamenUpdateDTO = {
        id: examenExistente.id ?? (examenExistente as any).Id,
        nombreExamen: nombre,
        costoEnDivisa: Number(costo),
        descripcion: descripcion
      };
      onGuardar(examenActualizado);
    } else {
      const nuevoExamen: ExamenCreateDTO = {
        nombreExamen: nombre,
        costoEnDivisa: Number(costo),
        descripcion: descripcion
      };
      onGuardar(nuevoExamen);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-sky-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl border border-sky-100 max-w-md w-full p-7">
        
        <div className="flex justify-between items-center mb-6 border-b border-sky-50 pb-3">
          <div>
            <h3 className="text-xl font-bold text-sky-900">
              {esModoEdicion ? 'Editar Examen' : 'Registrar Nuevo Examen'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 transition-colors font-bold text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Nombre del Examen *</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              disabled={!puedeGestionarExamenes}
              className={`w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow ${!puedeGestionarExamenes ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-sky-900'}`} 
              placeholder="Ej. Perfil Tiroideo"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Costo Base (USD) *</label>
            <input 
              type="number" 
              step="0.01" 
              value={costo} 
              onChange={(e) => setCosto(e.target.value)} 
              disabled={!puedeGestionarExamenes}
              className={`w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow ${!puedeGestionarExamenes ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-sky-900'}`} 
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Descripción</label>
            <textarea 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
              disabled={!puedeGestionarExamenes}
              className={`w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm h-20 resize-none focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow custom-scrollbar ${!puedeGestionarExamenes ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-sky-900'}`} 
              placeholder="Detalles sobre el procedimiento o preparación requerida..."
            />
          </div>

          <AuditoriaFooter datosAuditales={examenExistente} />
          
          <div className="flex justify-end space-x-3 pt-5 border-t border-sky-50 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
              Cancelar
            </button>
            
            <div className="inline-block" title={!puedeGestionarExamenes ? "No posees los privilegios necesarios para guardar estos cambios." : ""}>
              <button 
                type="submit" 
                disabled={!puedeGestionarExamenes}
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all ${!puedeGestionarExamenes ? 'bg-slate-300 cursor-not-allowed shadow-none' : esModoEdicion ? 'bg-sky-500 hover:bg-sky-400 hover:-translate-y-0.5' : 'bg-emerald-500 hover:bg-emerald-400 hover:-translate-y-0.5'}`}
              >
                {esModoEdicion ? 'Guardar Cambios' : 'Registrar Examen'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}