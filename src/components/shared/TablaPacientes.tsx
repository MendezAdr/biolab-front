import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast'; 
import { pacienteService } from '../../services/pacienteService';
import type { PacienteCreateDTO, PacienteUpdateDTO } from '../../types/DTOs/PacienteCreateDTO';

import { ModalPaciente } from './ModalPaciente';
import type { Paciente } from '../../types/PacienteModel';

// 1. IMPORTAMOS EL CONTEXTO Y LOS PERMISOS
import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

export function TablaPacientes() {
  // 2. EXTRAEMOS LA SESIÓN ACTUAL
  const { usuario, tienePermiso } = useAuth();
  const currentUserId = usuario?.id || 1; 
  
  // Evaluamos el permiso
  const puedeGestionarPacientes = tienePermiso(PERMISOS.MODIFICAR_PACIENTES);

  const [listaPacientes, setListaPacientes] = useState<Paciente[]>([]); 
  const [cargando, setCargando] = useState<boolean>(true);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pacienteAEditar, setPacienteAEditar] = useState<Paciente | null>(null);

  const cargarPacientes = async () => {
    try {
      setCargando(true);
      const respuesta = await pacienteService.getAll();
      
      const pacientesExtraidos = respuesta?.Data || respuesta?.data || respuesta;
      
      if (Array.isArray(pacientesExtraidos)) {
          setListaPacientes(pacientesExtraidos);
      } else {
          setListaPacientes([]); 
      }
      
    } catch (err: any) {
      toast.error(err.message || "Fallo de conexión al cargar pacientes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const abrirModalCrear = () => {
    setPacienteAEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (paciente: Paciente) => {
    setPacienteAEditar(paciente);
    setModalAbierto(true);
  };

  /* const desactivarPaciente = async (id: number, nombre: string) => {
    if(window.confirm(`¿Estás seguro de que deseas desactivar el registro de ${nombre}?`)) {
      try {
        await pacienteService.deactivate(id, currentUserId);
        toast.success("Paciente desactivado del sistema.");
        cargarPacientes();
      } catch (err: any) {
         toast.error(err.message || "Error al intentar desactivar el paciente.");
      }
    }
  }; */
  const alternarEstadoPaciente = async (id: number, nombre: string, estadoActual: boolean) => {
    const accionText = estadoActual ? 'desactivar' : 'activar';
    if(window.confirm(`¿Estás seguro de que deseas ${accionText} el registro de ${nombre}?`)) {
      try {
        if (estadoActual) {
            await pacienteService.deactivate(id, currentUserId);
        } else {
            // Asumimos que pasar 'true' al método activate reactiva el registro
            await pacienteService.activate(id, true, currentUserId); 
        }
        toast.success(`Paciente ${estadoActual ? 'desactivado' : 'activado'} correctamente.`);
        cargarPacientes();
      } catch (err: any) {
         toast.error(err.message || `Error al intentar ${accionText} el paciente.`);
      }
    }
  };
  const manejarGuardado = async (datos: PacienteCreateDTO | PacienteUpdateDTO) => {
    toast.promise(
      (async () => {
        if ('id' in datos) {
          await pacienteService.update(datos.id, datos as PacienteUpdateDTO, currentUserId);
        } else {
          await pacienteService.create(datos as PacienteCreateDTO, currentUserId);
        }
        setModalAbierto(false);
        await cargarPacientes();
      })(),
      {
        loading: 'Procesando paciente...',
        success: '¡Registro actualizado con éxito!',
        error: (err) => err.message || 'Ocurrió un error al guardar.', 
      }
    );
  };

  if (cargando) return <div className="flex justify-center items-center h-64 text-slate-500">Cargando base de datos...</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mx-auto max-w-5xl">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-semibold text-sky-700">Lista de Pacientes</h2>
          <p className="text-sm text-slate-500">Registro histórico general del laboratorio</p>
        </div>
        
        <div className="inline-block" title={!puedeGestionarPacientes ? "Tu rol no tiene permiso para registrar pacientes." : ""}>
          <button 
            onClick={abrirModalCrear}
            disabled={!puedeGestionarPacientes}
            className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors ${!puedeGestionarPacientes ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
          >
            + Nuevo Paciente
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <th className="p-4">Paciente</th>
              <th className="p-4">Cédula</th>
              <th className="p-4">Teléfono</th>
              <th className="p-4">Sexo</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {listaPacientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  <p>No hay pacientes registrados en el sistema actualmente.</p>
                </td>
              </tr>
            ) : (
              listaPacientes.map((paciente) => {
                const id = paciente.id;
                const nombre =  paciente.nombre;
                const apellido = paciente.apellido;
                const cedula =  paciente.cedula;
                const telefono = paciente.telefono;
                const sexo = paciente.sexo;
                
                // Extraemos el estado (contingencia por si el backend lo manda en PascalCase)
                const isActive = paciente.isActive ?? (paciente as any).IsActive ?? true;

                return (
                  // Cambiamos el fondo y la opacidad si el paciente está inactivo
                  <tr key={id} className={`transition-colors ${!isActive ? 'bg-rose-50/40 opacity-75' : 'hover:bg-slate-50'}`}>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">
                        {nombre} {apellido}
                        {/* Etiqueta visual para destacar inactivos */}
                        {!isActive && (
                          <span className="ml-2 text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Inactivo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{cedula}</td>
                    <td className="p-4 text-slate-600">{telefono}</td>
                    <td className="p-4">
                      <span className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded text-xs font-medium border border-sky-100">
                        {sexo}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      
                      <div className="inline-block" title={!puedeGestionarPacientes ? "Tu rol no tiene permiso para editar fichas." : ""}>
                        <button 
                          onClick={() => abrirModalEditar(paciente)}
                          disabled={!puedeGestionarPacientes}
                          className={`font-medium text-xs px-3 py-1.5 rounded transition-colors ${!puedeGestionarPacientes ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-sky-50 text-sky-600 hover:text-sky-800'}`}
                        >
                          Editar
                        </button>
                      </div>

                      {/* BOTÓN DINÁMICO: Cambia texto y color según el estado */}
                      <div className="inline-block" title={!puedeGestionarPacientes ? "Tu rol no tiene permiso para alterar el estado." : ""}>
                        <button 
                          onClick={() => alternarEstadoPaciente(id, nombre, isActive)}
                          disabled={!puedeGestionarPacientes}
                          className={`font-medium text-xs px-3 py-1.5 rounded transition-colors ${
                            !puedeGestionarPacientes 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : isActive 
                                ? 'bg-rose-50 text-rose-600 hover:text-rose-800' 
                                : 'bg-emerald-50 text-emerald-600 hover:text-emerald-800'
                          }`}
                        >
                          {isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>

                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        <ModalPaciente 
          isOpen={modalAbierto} 
          onClose={() => setModalAbierto(false)} 
          onGuardar={manejarGuardado}
          pacienteExistente={pacienteAEditar}
        />  
      </div>
    </div>
  );
}