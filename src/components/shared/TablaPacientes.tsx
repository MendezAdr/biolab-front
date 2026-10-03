import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast'; 
import { pacienteService } from '../../services/pacienteService';
import type { PacienteCreateDTO, PacienteUpdateDTO } from '../../types/DTOs/PacienteCreateDTO';

import { ModalPaciente } from './ModalPaciente';
import type { Paciente } from '../../types/PacienteModel';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

export function TablaPacientes() {
  const { usuario, tienePermiso } = useAuth();
  const currentUserId = usuario?.id || 1; 
  
  const puedeGestionarPacientes = tienePermiso(PERMISOS.MODIFICAR_PACIENTES);

  const [listaPacientes, setListaPacientes] = useState<Paciente[]>([]); 
  const [cargando, setCargando] = useState<boolean>(true);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pacienteAEditar, setPacienteAEditar] = useState<Paciente | null>(null);

  // ESTADOS PARA BÚSQUEDA Y ORDENAMIENTO
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [configuracionOrden, setConfiguracionOrden] = useState<{ campo: string, direccion: 'asc' | 'desc' } | null>(null);

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

  const alternarEstadoPaciente = async (id: number, nombre: string, estadoActual: boolean) => {
    const accionText = estadoActual ? 'desactivar' : 'activar';
    if(window.confirm(`¿Estás seguro de que deseas ${accionText} el registro de ${nombre}?`)) {
      try {
        if (estadoActual) {
            await pacienteService.deactivate(id, currentUserId);
        } else {
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

  // ------------------------------------------------------------------
  // LÓGICA DE PROCESAMIENTO (BÚSQUEDA Y ORDENAMIENTO)
  // ------------------------------------------------------------------
  const manejarOrden = (campo: string) => {
    let direccion: 'asc' | 'desc' = 'asc';
    if (configuracionOrden && configuracionOrden.campo === campo && configuracionOrden.direccion === 'asc') {
      direccion = 'desc';
    }
    setConfiguracionOrden({ campo, direccion });
  };

  const resetearFiltros = () => {
    setTerminoBusqueda('');
    setConfiguracionOrden(null);
  };

  const pacientesProcesados = useMemo(() => {
    let datos = [...listaPacientes];

    // 1. Filtrado por Búsqueda (Nombre, Apellido o Cédula)
    if (terminoBusqueda) {
      const busquedaLower = terminoBusqueda.toLowerCase();
      datos = datos.filter(paciente => {
        const nombreFull = `${paciente.nombre ?? (paciente as any).Nombre ?? ''} ${paciente.apellido ?? (paciente as any).Apellido ?? ''}`.toLowerCase();
        const cedula = String(paciente.cedula ?? (paciente as any).Cedula ?? '').toLowerCase();
        
        return nombreFull.includes(busquedaLower) || cedula.includes(busquedaLower);
      });
    }

    // 2. Ordenamiento de Columnas
    if (configuracionOrden) {
      datos.sort((a, b) => {
        const { campo, direccion } = configuracionOrden;
        
        // Soporte de variables en camelCase y PascalCase
        let valorA = (a as any)[campo] ?? (a as any)[campo.charAt(0).toUpperCase() + campo.slice(1)];
        let valorB = (b as any)[campo] ?? (b as any)[campo.charAt(0).toUpperCase() + campo.slice(1)];

        if (typeof valorA === 'string') valorA = valorA.toLowerCase();
        if (typeof valorB === 'string') valorB = valorB.toLowerCase();

        if (valorA < valorB) return direccion === 'asc' ? -1 : 1;
        if (valorA > valorB) return direccion === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return datos;
  }, [listaPacientes, terminoBusqueda, configuracionOrden]);

  const indicadorOrden = (campo: string) => {
    if (configuracionOrden?.campo === campo) {
      return configuracionOrden.direccion === 'asc' ? ' ↑' : ' ↓';
    }
    return null;
  };

  if (cargando) return <div className="flex justify-center items-center h-64 text-slate-500">Cargando base de datos...</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mx-auto max-w-5xl">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      {/* CABECERA PRINCIPAL */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
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

      {/* BARRA DE HERRAMIENTAS (TOOLBAR) INCRUSTADA */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-96 relative">
          <input 
            type="text" 
            placeholder="Buscar por Nombre, Apellido o Cédula..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow"
          />
          <span className="absolute left-3 top-2 text-slate-400">🔍</span>
        </div>
        
        {(terminoBusqueda || configuracionOrden) && (
          <button 
            onClick={resetearFiltros}
            className="px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors font-medium whitespace-nowrap"
          >
            ✕ Limpiar Filtros
          </button>
        )}
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 select-none">
              <th onClick={() => manejarOrden('nombre')} className="p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                Paciente {indicadorOrden('nombre')}
              </th>
              <th onClick={() => manejarOrden('cedula')} className="p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                Cédula {indicadorOrden('cedula')}
              </th>
              <th onClick={() => manejarOrden('telefono')} className="p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                Teléfono {indicadorOrden('telefono')}
              </th>
              <th onClick={() => manejarOrden('sexo')} className="p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                Sexo {indicadorOrden('sexo')}
              </th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {pacientesProcesados.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  <p>No se encontraron pacientes con los filtros actuales.</p>
                </td>
              </tr>
            ) : (
              pacientesProcesados.map((paciente) => {
                const id = paciente.id ?? (paciente as any).Id;
                const nombre =  paciente.nombre ?? (paciente as any).Nombre;
                const apellido = paciente.apellido ?? (paciente as any).Apellido;
                const cedula =  paciente.cedula ?? (paciente as any).Cedula;
                const telefono = paciente.telefono ?? (paciente as any).Telefono;
                const sexo = paciente.sexo ?? (paciente as any).Sexo;
                
                const isActive = paciente.isActive ?? (paciente as any).IsActive ?? true;

                return (
                  <tr key={id} className={`transition-colors ${!isActive ? 'bg-rose-50/40 opacity-75' : 'hover:bg-slate-50'}`}>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">
                        {nombre} {apellido}
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