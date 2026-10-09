import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast'; 
import { pagosService } from '../../services/pagosService';
import { ModalRegistroPago } from './ModalRegistroPagos';
import type { PagoStandaloneCreateDTO } from '../../types/DTOs/PagoStandaloneCreateDTO';
import type { PagoUpdateDTO } from '../../types/DTOs/PagoUpdateDTO';
import { PagoMetodo, type Pago } from '../../types/PagoModel';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

export function PanelPagos() {
  const { usuario, tienePermiso } = useAuth();
  const currentUserId = usuario?.id || 1; 

  const puedeGestionarPagos = tienePermiso(PERMISOS.GESTIONAR_PAGOS);

  const [listaPagos, setListaPagos] = useState<Pago[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pagoAEditar, setPagoAEditar] = useState<Pago | null>(null);

  // ESTADOS DE FILTRADO Y ORDENAMIENTO
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [fechaFiltroInicio, setFechaFiltroInicio] = useState('');
  const [fechaFiltroFin, setFechaFiltroFin] = useState('');
  const [configuracionOrden, setConfiguracionOrden] = useState<{ campo: string, direccion: 'asc' | 'desc' } | null>(null);

  // ESTADOS DE PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const [limitePorPagina, setLimitePorPagina] = useState(20);

  const cargarPagos = async () => {
    try {
      setCargando(true);
      setError(null);
      const respuesta = await pagosService.getAll();
      setListaPagos(respuesta || []);
    } catch (err) {
      console.error("Error al obtener pagos:", err);
      setError("No pudimos conectar con el servidor para cargar el historial de pagos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (puedeGestionarPagos) {
      cargarPagos();
    } else {
      setCargando(false);
    }
  }, [puedeGestionarPagos]);

  // Si cambia algún filtro, regresamos a la página 1
  useEffect(() => {
    setPaginaActual(1);
  }, [terminoBusqueda, fechaFiltroInicio, fechaFiltroFin, limitePorPagina, configuracionOrden]);

  const abrirModalCrear = () => {
    setPagoAEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (pago: Pago) => {
    setPagoAEditar(pago);
    setModalAbierto(true);
  };

  const anularPago = async (id: number) => {
    if(window.confirm("¿Estás seguro de anular este pago? Esta acción es irreversible y afectará la caja.")){
        try {
            await pagosService.delete(id, currentUserId);
            toast.success("Pago anulado y retirado de la caja correctamente.");
            cargarPagos();
        } catch(err: any) {
            toast.error(err.message || "Error al anular el pago. Verifica tus permisos.");
        }
    }
  };

  const manejarGuardado = async (datos: PagoStandaloneCreateDTO | PagoUpdateDTO) => {
    toast.promise(
      (async () => {
        if (pagoAEditar) {
          const pagoId = pagoAEditar.id ?? (pagoAEditar as any).Id;
          await pagosService.update(pagoId, datos as PagoUpdateDTO, currentUserId);
        } else {
          await pagosService.createAddPago(datos as PagoStandaloneCreateDTO, currentUserId);
        }
        setModalAbierto(false);
        await cargarPagos();
      })(),
      {
        loading: 'Procesando transacción...',
        success: '¡Caja actualizada con éxito!',
        error: (err) => err.message || 'Error al procesar el pago.',
      }
    );
  };

  const manejarOrden = (campo: string) => {
    let direccion: 'asc' | 'desc' = 'asc';
    if (configuracionOrden && configuracionOrden.campo === campo && configuracionOrden.direccion === 'asc') {
      direccion = 'desc';
    }
    setConfiguracionOrden({ campo, direccion });
  };

  const resetearFiltros = () => {
    setTerminoBusqueda('');
    setFechaFiltroInicio('');
    setFechaFiltroFin('');
    setConfiguracionOrden(null);
    setPaginaActual(1);
  };

  const formatearFecha = (fechaString: any) => {
    if (!fechaString) return '---';
    const obj = new Date(fechaString);
    return isNaN(obj.getTime()) ? '---' : obj.toLocaleString();
  };

  const pagosProcesados = useMemo(() => {
    let datos = [...listaPagos];

    // 1. Filtrado por Búsqueda (Texto)
    if (terminoBusqueda) {
      const busquedaLower = terminoBusqueda.toLowerCase();
      datos = datos.filter(pago => {
        const id = String(pago.id ?? (pago as any).Id ?? '');
        const ordenId = String(pago.ordenId ?? (pago as any).OrdenId ?? '');
        const referencia = String(pago.referencia ?? (pago as any).Referencia ?? '').toLowerCase();
        
        return id.includes(busquedaLower) || 
               ordenId.includes(busquedaLower) || 
               referencia.includes(busquedaLower);
      });
    }

    // 2. Filtrado por Fechas
    if (fechaFiltroInicio || fechaFiltroFin) {
      datos = datos.filter(pago => {
        const fechaString = pago.fechaCreacion ?? (pago as any).FechaCreacion;
        if (!fechaString) return true; 

        const fechaObj = new Date(fechaString);
        let pasaFiltro = true;

        if (fechaFiltroInicio) {
          const fInicio = new Date(fechaFiltroInicio + 'T00:00:00');
          if (fechaObj < fInicio) pasaFiltro = false;
        }

        if (fechaFiltroFin) {
          const fFin = new Date(fechaFiltroFin + 'T23:59:59');
          if (fechaObj > fFin) pasaFiltro = false;
        }

        return pasaFiltro;
      });
    }

    // 3. Ordenamiento de Columnas
    if (configuracionOrden) {
      datos.sort((a, b) => {
        const { campo, direccion } = configuracionOrden;
        
        let valorA = (a as any)[campo] ?? (a as any)[campo.charAt(0).toUpperCase() + campo.slice(1)];
        let valorB = (b as any)[campo] ?? (b as any)[campo.charAt(0).toUpperCase() + campo.slice(1)];

        if (campo === 'fechaCreacion') {
           valorA = new Date(valorA ?? 0).getTime();
           valorB = new Date(valorB ?? 0).getTime();
        } else {
           if (typeof valorA === 'string') valorA = valorA.toLowerCase();
           if (typeof valorB === 'string') valorB = valorB.toLowerCase();
        }

        if (valorA < valorB) return direccion === 'asc' ? -1 : 1;
        if (valorA > valorB) return direccion === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Ordenamiento por defecto: más recientes primero (si no hay un filtro de orden activo)
    if (!configuracionOrden) {
        datos.sort((a, b) => {
            const fechaA = new Date(a.fechaCreacion ?? (a as any).FechaCreacion ?? 0).getTime();
            const fechaB = new Date(b.fechaCreacion ?? (b as any).FechaCreacion ?? 0).getTime();
            return fechaB - fechaA;
        });
    }

    return datos;
  }, [listaPagos, terminoBusqueda, fechaFiltroInicio, fechaFiltroFin, configuracionOrden]);

  // PAGINACIÓN CÁLCULOS
  const totalPaginas = Math.max(1, Math.ceil(pagosProcesados.length / limitePorPagina));
  const pagosPaginados = pagosProcesados.slice(
    (paginaActual - 1) * limitePorPagina,
    paginaActual * limitePorPagina
  );

  const indicadorOrden = (campo: string) => {
    if (configuracionOrden?.campo === campo) {
      return configuracionOrden.direccion === 'asc' ? ' ↑' : ' ↓';
    }
    return null;
  };

  if (!puedeGestionarPagos) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-sky-100 rounded-xl shadow-sm mx-auto max-w-2xl mt-12 text-center">
        <span className="text-6xl mb-4 opacity-80">🔒</span>
        <h2 className="text-xl font-bold text-sky-900 mb-2">Acceso Restringido</h2>
        <p className="text-slate-500">
          Tu nivel de acceso actual no te permite auditar la caja, registrar ni corregir pagos en el sistema.
        </p>
      </div>
    );
  }

  if (cargando) return <div className="p-10 text-center animate-pulse text-sky-600 font-medium">Cargando módulo de caja...</div>;
  
  if (error) return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center max-w-2xl mx-auto">
      <p className="font-bold">{error}</p>
      <button onClick={cargarPagos} className="mt-4 px-5 py-2 bg-rose-100 hover:bg-rose-200 rounded-lg text-sm font-bold transition-colors">Reintentar</button>
    </div>
  );

  return (
    <div className="space-y-6 p-2 max-w-7xl mx-auto">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      {/* CABECERA PRINCIPAL */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-sky-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-sky-900">Control de Caja y Abonos</h2>
          <p className="text-sm text-slate-500">Auditoría de pagos, correcciones y recepción de deudas</p>
        </div>

        <div className="inline-block" title={!puedeGestionarPagos ? "Tu rol no tiene permiso para registrar pagos en caja." : ""}>
          <button 
            onClick={abrirModalCrear}
            disabled={!puedeGestionarPagos}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md ${!puedeGestionarPagos ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-500 hover:bg-emerald-400 text-white hover:-translate-y-0.5'}`}
          >
            + Registrar Abono Manual
          </button>
        </div>
      </div>

      <div className="bg-white border border-sky-100 text-slate-700 rounded-xl overflow-hidden shadow-sm">
        
        {/* BARRA DE HERRAMIENTAS (BÚSQUEDA Y FECHAS) */}
        <div className="p-4 border-b border-sky-50 bg-sky-50/30 flex flex-col xl:flex-row gap-4 justify-between items-center">
          
          <div className="w-full xl:w-96 relative">
            <input 
              type="text" 
              placeholder="Buscar ID de Pago, Orden o Referencia..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow"
            />
            <span className="absolute left-3 top-2 text-slate-400 text-lg">🔍</span>
          </div>

          <div className="flex w-full xl:w-auto flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">Desde:</span>
                <input 
                  type="date" 
                  value={fechaFiltroInicio}
                  onChange={(e) => setFechaFiltroInicio(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-sky-500 transition-shadow"
                />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">Hasta:</span>
                <input 
                  type="date" 
                  value={fechaFiltroFin}
                  onChange={(e) => setFechaFiltroFin(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-sky-500 transition-shadow"
                />
            </div>
          </div>
          
          {(terminoBusqueda || fechaFiltroInicio || fechaFiltroFin || configuracionOrden) && (
            <button 
              onClick={resetearFiltros}
              className="px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors font-bold whitespace-nowrap"
            >
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-sky-800 text-xs font-bold uppercase tracking-wider border-b border-sky-100 select-none">
                <th onClick={() => manejarOrden('id')} className="p-4 cursor-pointer hover:bg-sky-50 transition-colors">
                  ID {indicadorOrden('id')}
                </th>
                <th onClick={() => manejarOrden('fechaCreacion')} className="p-4 cursor-pointer hover:bg-sky-50 transition-colors">
                  Fecha y Hora {indicadorOrden('fechaCreacion')}
                </th>
                <th onClick={() => manejarOrden('ordenId')} className="p-4 cursor-pointer hover:bg-sky-50 transition-colors">
                  Orden {indicadorOrden('ordenId')}
                </th>
                <th onClick={() => manejarOrden('metodo')} className="p-4 cursor-pointer hover:bg-sky-50 transition-colors">
                  Método {indicadorOrden('metodo')}
                </th>
                <th onClick={() => manejarOrden('referencia')} className="p-4 cursor-pointer hover:bg-sky-50 transition-colors">
                  Referencia {indicadorOrden('referencia')}
                </th>
                <th onClick={() => manejarOrden('monto')} className="p-4 text-right cursor-pointer hover:bg-sky-50 transition-colors">
                  Monto (USD) {indicadorOrden('monto')}
                </th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {pagosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-slate-500 bg-slate-50/50 italic">
                    No se encontraron pagos con los filtros y fechas establecidas.
                  </td>
                </tr>
              ) : (
                pagosPaginados.map((pago) => {
                  const id = pago.id ?? (pago as any).Id;
                  const fecha = pago.fechaCreacion ?? (pago as any).FechaCreacion;
                  const ordenId = pago.ordenId ?? (pago as any).OrdenId;
                  const metodo = pago.metodo ?? (pago as any).Metodo;
                  const referencia = pago.referencia ?? (pago as any).Referencia;
                  const monto = pago.monto ?? (pago as any).Monto;

                  const nombreMetodo = PagoMetodo.find(m => m.id === metodo)?.metodo || 'Desconocido';

                  return (
                    <tr key={id} className="hover:bg-sky-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-400">#{id}</td>
                      <td className="p-4 text-slate-500 text-xs font-medium">{formatearFecha(fecha)}</td>
                      <td className="p-4 font-bold text-sky-700 hover:underline cursor-pointer" title="ID de Factura Interna">ORD-{ordenId}</td>
                      <td className="p-4">
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">
                          {nombreMetodo}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{referencia || 'N/A'}</td>
                      <td className="p-4 font-black text-emerald-600 text-right">${monto}</td>
                      <td className="p-4 text-center space-x-2">
                        
                        <div className="inline-block" title={!puedeGestionarPagos ? "Sin permisos." : ""}>
                          <button 
                            onClick={() => abrirModalEditar(pago)} 
                            disabled={!puedeGestionarPagos}
                            className={`font-bold text-xs px-3 py-1.5 rounded-lg transition-colors ${!puedeGestionarPagos ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'}`}
                          >
                            Corregir
                          </button>
                        </div>

                        <div className="inline-block" title={!puedeGestionarPagos ? "Sin permisos." : ""}>
                          <button 
                            onClick={() => anularPago(id)} 
                            disabled={!puedeGestionarPagos}
                            className={`font-bold text-xs px-3 py-1.5 rounded-lg transition-colors ${!puedeGestionarPagos ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200'}`}
                          >
                            Anular
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
        
        {/* PIE DE PAGINACIÓN */}
        {pagosProcesados.length > 0 && (
          <div className="p-4 border-t border-sky-50 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-slate-500 font-medium">
              Mostrando <span className="font-bold text-sky-800">{pagosPaginados.length}</span> de <span className="font-bold text-sky-800">{pagosProcesados.length}</span> pagos encontrados
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="px-3 py-1.5 text-xs font-bold rounded bg-white border border-slate-300 text-slate-600 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              
              <span className="px-4 py-1 text-sm font-bold text-sky-900 bg-sky-100 rounded-md">
                Pág {paginaActual} / {totalPaginas}
              </span>
              
              <button 
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1.5 text-xs font-bold rounded bg-white border border-slate-300 text-slate-600 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Límites:</span>
              <select 
                value={limitePorPagina} 
                onChange={(e) => setLimitePorPagina(Number(e.target.value))}
                className="border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 bg-white"
              >
                <option value={10}>10 por pág</option>
                <option value={20}>20 por pág</option>
                <option value={50}>50 por pág</option>
                <option value={100}>100 por pág</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <ModalRegistroPago 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        onGuardar={manejarGuardado}
        pagoExistente={pagoAEditar}
      />
      
    </div>
  );
}