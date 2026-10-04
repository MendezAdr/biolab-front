import React, { useState, useEffect } from 'react';
import type { PacienteCreateDTO, PacienteUpdateDTO } from '../../types/DTOs/PacienteCreateDTO';
import type { Paciente } from '../../types/PacienteModel';
import { AuditoriaFooter } from './AuditoriaFooter';
import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

interface ModalPacienteProps {
  isOpen: boolean;               
  onClose: () => void;           
  onGuardar: (datos: PacienteCreateDTO | PacienteUpdateDTO) => void; 
  pacienteExistente: Paciente | null; 
}

export function ModalPaciente({ isOpen, onClose, onGuardar, pacienteExistente }: ModalPacienteProps) {
  const { tienePermiso } = useAuth();
  const puedeGestionarPacientes = tienePermiso(PERMISOS.MODIFICAR_PACIENTES);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F'>('M');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [nombreAcompanante, setNombreAcompanante] = useState('');
  const [cedulaAcompanante, setCedulaAcompanante] = useState('');

  const esModoEdicion = !!pacienteExistente;

  const formatearFechaParaInput = (fecha: Date | string | undefined) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isOpen) {
      if (esModoEdicion && pacienteExistente) {
        setNombre(pacienteExistente.nombre);
        setApellido(pacienteExistente.apellido);
        setCedula(pacienteExistente.cedula);
        setSexo(pacienteExistente.sexo);
        setTelefono(pacienteExistente.telefono);
        setDireccion(pacienteExistente.direccion);
        setFechaNacimiento(formatearFechaParaInput(pacienteExistente.fechaNacimiento));
        setNombreAcompanante(pacienteExistente.nombreAcompanante || '');
        setCedulaAcompanante(pacienteExistente.cedulaAcompanante || '');
      } else {
        setNombre(''); setApellido(''); setCedula(''); setSexo('M'); 
        setTelefono(''); setDireccion(''); setFechaNacimiento('');
        setNombreAcompanante(''); setCedulaAcompanante('');
      }
    }
  }, [isOpen, pacienteExistente, esModoEdicion]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!nombre || !apellido || !cedula || !telefono || !direccion) {
      alert("Por favor, rellena todos los campos obligatorios (*).");
      return;
    }

    if (esModoEdicion && pacienteExistente) {
        const pacienteActualizado: PacienteUpdateDTO = {
            id: pacienteExistente.id,
            nombre: nombre,
            apellido: apellido,
            cedula: cedula,
            sexo: sexo,
            telefono: telefono,
            direccion: direccion,
            ...(nombreAcompanante && { NombreAcompanante: nombreAcompanante }),
            ...(cedulaAcompanante && { CedulaAcompanante: cedulaAcompanante }),
            ...(fechaNacimiento && { FechaNacimiento: new Date(fechaNacimiento) })
        };
        onGuardar(pacienteActualizado);
    } else {
        const pacienteCreado: PacienteCreateDTO = {
            nombre: nombre,
            apellido: apellido,
            cedula: cedula,
            sexo: sexo,
            telefono: telefono,
            direccion: direccion,
            ...(nombreAcompanante && { NombreAcompanante: nombreAcompanante }),
            ...(cedulaAcompanante && { CedulaAcompanante: cedulaAcompanante }),
            ...(fechaNacimiento && { FechaNacimiento: new Date(fechaNacimiento) })
        };
        onGuardar(pacienteCreado); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-sky-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-sky-100 max-w-2xl w-full p-7 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6 border-b border-sky-50 pb-3">
          <h3 className="text-xl font-bold text-sky-900">
            {esModoEdicion ? 'Actualizar Ficha del Paciente' : 'Registrar Nuevo Paciente'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 transition-colors font-bold text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Fila 1: Nombres y Apellidos */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Nombres *</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Apellidos *</label>
              <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900" />
            </div>
          </div>

          {/* Fila 2: Cédula y Sexo */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Cédula *</label>
              <input type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Sexo *</label>
              <select value={sexo} onChange={(e) => setSexo(e.target.value as 'M' | 'F')} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900">
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
          </div>

          {/* Fila 3: Teléfono y Fecha de Nacimiento */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Teléfono *</label>
              <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Fecha de Nacimiento</label>
              <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900" />
            </div>
          </div>

          {/* Fila 4: Dirección */}
          <div>
            <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Dirección *</label>
            <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900" />
          </div>

          <div className="border-t border-sky-50 mt-6 pt-4">
            <h4 className="text-sm font-bold text-sky-900 mb-4 flex items-center">
              <span className="mr-2">👥</span> Información del Acompañante (Opcional)
            </h4>

            {/* Fila 5: Acompañante */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                <input type="text" value={nombreAcompanante} onChange={(e) => setNombreAcompanante(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Cédula</label>
                <input type="text" value={cedulaAcompanante} onChange={(e) => setCedulaAcompanante(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900" />
              </div>
            </div>
          </div>
          
          <AuditoriaFooter datosAuditales={pacienteExistente} />

          <div className="flex justify-end space-x-3 pt-5 border-t border-sky-50 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
              Cancelar
            </button>
            
            {/* BOTÓN PROTEGIDO: Enviar Formulario */}
            <div className="inline-block" title={!puedeGestionarPacientes ? "No posees los privilegios necesarios para realizar esta acción." : ""}>
              <button 
                type="submit" 
                disabled={!puedeGestionarPacientes}
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all ${!puedeGestionarPacientes ? 'bg-slate-300 cursor-not-allowed shadow-none' : esModoEdicion ? 'bg-sky-500 hover:bg-sky-400 hover:-translate-y-0.5' : 'bg-emerald-500 hover:bg-emerald-400 hover:-translate-y-0.5'}`}
              >
                {esModoEdicion ? 'Guardar Cambios' : 'Registrar Paciente'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}