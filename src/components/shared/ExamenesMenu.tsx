import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast'; 
import { examenesService } from '../../services/examenesService';
import { ModalExamen } from './ModalExamen';
import type { Examen } from '../../types/ExamenModel';
import type { ExamenCreateDTO } from '../../types/DTOs/ExamenCreateDTO';
import type { ExamenUpdateDTO } from '../../types/DTOs/ExamenUpdateDTO';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

export function ExamenesMenu() {
  const { usuario, tienePermiso } = useAuth();
  const currentUserId = usuario?.id || 1; 
  
  const puedeGestionarExamenes = tienePermiso(PERMISOS.GESTIONAR_EXAMENES);

  const [listaExamenes, setListaExamenes] = useState<Examen[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [examenAEditar, setExamenAEditar] = useState<Examen | null>(null);

  // ESTADOS PARA BÚSQUEDA Y ORDENAMIENTO
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [configuracionOrden, setConfiguracionOrden] = useState<{ campo: string, direccion: 'asc' | 'desc' } | null>(null);

  const cargarExamenes = async () => {
    try {
      setCargando(true);
      setError(null);
      const respuesta = await examenesService.getAll();
      setListaExamenes(respuesta || []);
    } catch (err) {
      console.error("Error al obtener exámenes:", err);
      setError("No pudimos conectar con el servidor para cargar el catálogo de exámenes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (puedeGestionarExamenes) {
      cargarExamenes();
    } else {
      setCargando(false);
    }
  }, [puedeGestionarExamenes]);

  const abrirModalCrear = () => {
    setExamenAEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (examen: Examen) => {
    setExamenAEditar(examen);
    setModalAbierto(true);
  };

  const eliminarExamen = async (id: number, nombre: string) => {
    const confirmar = window.confirm(`⚠️ ADVERTENCIA IRREVERSIBLE\n\n¿Estás seguro que deseas eliminar el examen "${nombre}" del catálogo?\n\nEsta acción no se puede deshacer.`);
    
    if (confirmar) {
        try {
            await examenesService.delete(id, currentUserId);
            toast.success("Examen eliminado correctamente del catálogo.");
            cargarExamenes(); 
        } catch(err: any) {
            toast.error(err.message || "Error al eliminar el examen. Verifica que no esté asociado a facturas previas.");
        }
    }
  };

  const manejarGuardado = async (datos: ExamenCreateDTO | ExamenUpdateDTO) => {
    toast.promise(
      (async () => {
        if (examenAEditar) {
          await examenesService.update(examenAEditar.id ?? (examenAEditar as any).Id, datos as ExamenUpdateDTO, currentUserId);
        } else {
          await examenesService.create(datos as ExamenCreateDTO, currentUserId);
        }
        setModalAbierto(false);
        await cargarExamenes();
      })(),
      {
        loading: 'Procesando examen...',
        success: '¡Catálogo actualizado con éxito!',
        error: (err) => err.message || 'Error al guardar el examen en el sistema.',
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

  const examenesProcesados = useMemo(() => {
    let datos = [...listaExamenes];

    // 1. Filtrado por Búsqueda
    if (terminoBusqueda) {
      const busquedaLower = terminoBusqueda.toLowerCase();
      datos = datos.filter(examen => {
        const id = String(examen.id ?? (examen as any).Id ?? '');
        const nombre = String(examen.nombreExamen ?? (examen as any).NombreExamen ?? '').toLowerCase();
        const descripcion = String(examen.descripcion ?? (examen as any).Descripcion ?? '').toLowerCase();
        
        return id.includes(busquedaLower) || 
               nombre.includes(busquedaLower) || 
               descripcion.includes(busquedaLower);
      });
    }

    // 2. Ordenamiento de Columnas
    if (configuracionOrden) {
      datos.sort((a, b) => {
        const { campo, direccion } = configuracionOrden;
        
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
  }, [listaExamenes, terminoBusqueda, configuracionOrden]);

  const indicadorOrden = (campo: string) => {
    if (configuracionOrden?.campo === campo) {
      return configuracionOrden.direccion === 'asc' ? ' ↑' : ' ↓';
    }
    return null;
  };

  if (!puedeGestionarExamenes) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-xl shadow-sm mx-auto max-w-2xl mt-12 text-center">
        <span className="text-6xl mb-4 opacity-80">🔒</span>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
        <p className="text-slate-500">
          Tu nivel de acceso actual no te permite visualizar ni administrar el catálogo de exámenes médicos.
        </p>
      </div>
    );
  }

  if (cargando) return <div className="p-10 text-center animate-pulse text-slate-500">Cargando catálogo de exámenes...</div>;
  
  if (error) return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center max-w-2xl mx-auto mt-6">
      <p className="font-semibold">{error}</p>
      <button onClick={cargarExamenes} className="mt-4 px-4 py-2 bg-rose-100 hover:bg-rose-200 rounded-lg text-sm transition-colors">Reintentar Conexión</button>
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mx-auto max-w-5xl mt-6">
      <Toaster position="bottom-right" reverseOrder={false} />

      {/* CABECERA PRINCIPAL */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-lg font-semibold text-emerald-800">Catálogo de Exámenes</h2>
          <p className="text-sm text-slate-500">Administra los servicios que ofrece el laboratorio</p>
        </div>

        <div className="inline-block" title={!puedeGestionarExamenes ? "No tienes permisos para agregar exámenes al catálogo." : ""}>
          <button 
            onClick={abrirModalCrear}
            disabled={!puedeGestionarExamenes}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${!puedeGestionarExamenes ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}`}
          >
            + Agregar Examen
          </button>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS (TOOLBAR) INCRUSTADA */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-96 relative">
          <input 
            type="text" 
            placeholder="Buscar por ID, Nombre o Descripción..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow"
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
              <th onClick={() => manejarOrden('id')} className="p-4 w-16 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                ID {indicadorOrden('id')}
              </th>
              <th onClick={() => manejarOrden('nombreExamen')} className="p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                Nombre del Examen {indicadorOrden('nombreExamen')}
              </th>
              <th onClick={() => manejarOrden('descripcion')} className="p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                Descripción {indicadorOrden('descripcion')}
              </th>
              <th onClick={() => manejarOrden('costoEnDivisa')} className="p-4 text-right cursor-pointer hover:bg-slate-50 transition-colors">
                Costo (USD) {indicadorOrden('costoEnDivisa')}
              </th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {examenesProcesados.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  No se encontraron exámenes con los filtros actuales.
                </td>
              </tr>
            ) : (
              examenesProcesados.map((examen) => {
                const id = examen.id ?? (examen as any).Id;
                const nombre = examen.nombreExamen ?? (examen as any).NombreExamen;
                const descripcion = examen.descripcion ?? (examen as any).Descripcion;
                const costo = examen.costoEnDivisa ?? (examen as any).CostoEnDivisa;

                return (
                  <tr key={id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-slate-400 text-center">{id}</td>
                    <td className="p-4 font-semibold text-slate-800">{nombre}</td>
                    <td className="p-4 text-slate-500 truncate max-w-xs" title={descripcion}>{descripcion || 'Sin descripción'}</td>
                    <td className="p-4 font-bold text-emerald-600 text-right">${costo}</td>
                    <td className="p-4 text-center space-x-2">
                      
                      <div className="inline-block" title={!puedeGestionarExamenes ? "No tienes permisos para modificar exámenes." : ""}>
                        <button 
                          onClick={() => abrirModalEditar(examen)} 
                          disabled={!puedeGestionarExamenes}
                          className={`font-medium text-xs px-3 py-1.5 rounded transition-colors ${!puedeGestionarExamenes ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-sky-50 text-sky-600 hover:text-sky-800'}`}
                        >
                          Editar
                        </button>
                      </div>

                      <div className="inline-block" title={!puedeGestionarExamenes ? "No tienes permisos para eliminar exámenes." : ""}>
                        <button 
                          onClick={() => eliminarExamen(id, nombre)} 
                          disabled={!puedeGestionarExamenes}
                          className={`font-medium text-xs px-3 py-1.5 rounded transition-colors ${!puedeGestionarExamenes ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-rose-50 text-rose-600 hover:text-rose-800'}`}
                        >
                          Eliminar
                        </button>
                      </div>

                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ModalExamen 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        onGuardar={manejarGuardado}
        examenExistente={examenAEditar}
      />
    </div>
  );
}