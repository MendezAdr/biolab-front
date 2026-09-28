import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // Agregamos notificaciones elegantes
import type { ExamenCreateDTO } from '../../types/DTOs/ExamenCreateDTO';
import type { ExamenUpdateDTO } from '../../types/DTOs/ExamenUpdateDTO';
import type { Examen } from '../../types/ExamenModel';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

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
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
        
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {esModoEdicion ? 'Editar Examen' : 'Registrar Nuevo Examen'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre del Examen *</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              disabled={!puedeGestionarExamenes}
              className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 ${!puedeGestionarExamenes ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`} 
              placeholder="Ej. Perfil Tiroideo"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Costo Base (USD) *</label>
            <input 
              type="number" 
              step="0.01" 
              value={costo} 
              onChange={(e) => setCosto(e.target.value)} 
              disabled={!puedeGestionarExamenes}
              className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 ${!puedeGestionarExamenes ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`} 
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Descripción</label>
            <textarea 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
              disabled={!puedeGestionarExamenes}
              className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 h-20 resize-none ${!puedeGestionarExamenes ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`} 
              placeholder="Detalles sobre el procedimiento o preparación requerida..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            
            <div className="inline-block" title={!puedeGestionarExamenes ? "No posees los privilegios necesarios para guardar estos cambios." : ""}>
              <button 
                type="submit" 
                disabled={!puedeGestionarExamenes}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${!puedeGestionarExamenes ? 'bg-slate-400 cursor-not-allowed' : esModoEdicion ? 'bg-sky-600 hover:bg-sky-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
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