import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordenesService } from '../../services/ordenesService'; 
import { ModalDetallesFactura } from './ModalDetallesFactura';
import type { Orden } from '../../types/OrdenesModel';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

export function HistoricoFacturas() {
  const { usuario, tienePermiso } = useAuth();
  const currentUserId = usuario?.id || 1; 

  const puedeCrearOrdenes = tienePermiso(PERMISOS.CREAR_ORDENES_Y_DETALLES);
  const puedeVerHistorial = tienePermiso(PERMISOS.VER_REPORTES);

  const [listaFacturas, setListaFacturas] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [facturaSeleccionadaId, setFacturaSeleccionadaId] = useState<number | null>(null);

  // ESTADOS PARA BÚSQUEDA Y ORDENAMIENTO
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos'); // NUEVO FILTRO DE ESTADO
  const [configuracionOrden, setConfiguracionOrden] = useState<{ campo: string, direccion: 'asc' | 'desc' } | null>(null);

  const navigate = useNavigate();

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      setError(null); 
      const respuesta = await ordenesService.getAll(currentUserId);
      setListaFacturas(respuesta || []); 
    } catch (err) {
      console.error("Error al obtener histórico:", err);
      setError("No pudimos conectar con el servidor para cargar el historial de facturas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (puedeVerHistorial) {
      cargarHistorial();
    } else {
      setCargando(false);
    }
  }, [puedeVerHistorial]);

  const formatearFechaSegura = (fechaString: any) => {
    if (!fechaString) return 'Fecha no disponible';
    const fechaObj = new Date(fechaString);
    return isNaN(fechaObj.getTime()) ? 'Fecha inválida' : fechaObj.toLocaleDateString();
  };

  const navegarANuevaFactura = () => {
    navigate('/nueva-orden');
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
    setEstadoFiltro('todos');
    setConfiguracionOrden(null);
  };

  const facturasProcesadas = useMemo(() => {
    let datos = [...listaFacturas];

    // 1. Filtrado por Búsqueda de Texto
    if (terminoBusqueda) {
      const busquedaLower = terminoBusqueda.toLowerCase();
      datos = datos.filter(factura => {
        const numFactura = String(factura.numeroFactura ?? (factura as any).NumeroFactura ?? '').toLowerCase();
        const pacienteId = String(factura.pacienteId ?? (factura as any).PacienteId ?? '');
        const nombrePaciente = String(factura.nombrePaciente ?? (factura as any).NombrePaciente ?? '').toLowerCase();
        
        return numFactura.includes(busquedaLower) || 
               pacienteId.includes(busquedaLower) || 
               nombrePaciente.includes(busquedaLower);
      });
    }

    // 2. Filtrado por Estado de Pago
    if (estadoFiltro !== 'todos') {
      datos = datos.filter(factura => {
        const estadoNum = factura.estadoPago ?? (factura as any).EstadoPago ?? factura.estado ?? (factura as any).Estado;
        return String(estadoNum) === estadoFiltro;
      });
    }

    // 3. Ordenamiento
    if (configuracionOrden) {
      datos.sort((a, b) => {
        const { campo, direccion } = configuracionOrden;
        
        let valorA = (a as any)[campo] ?? (a as any)[campo.charAt(0).toUpperCase() + campo.slice(1)];
        let valorB = (b as any)[campo] ?? (b as any)[campo.charAt(0).toUpperCase() + campo.slice(1)];

        // Si se ordena por estado, asegurarse de mapearlo al número base para ordenar lógicamente
        if (campo === 'estado') {
          valorA = a.estadoPago ?? (a as any).EstadoPago ?? a.estado ?? (a as any).Estado;
          valorB = b.estadoPago ?? (b as any).EstadoPago ?? b.estado ?? (b as any).Estado;
        }

        if (campo === 'fechaOrden' || campo === 'fechaCreacion') {
          valorA = new Date(valorA ?? 0).getTime();
          valorB = new Date(valorB ?? 0).getTime();
        }

        if (valorA < valorB) return direccion === 'asc' ? -1 : 1;
        if (valorA > valorB) return direccion === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Por defecto, ordenamos de la más reciente a la más vieja
    if (!configuracionOrden) {
        datos.sort((a, b) => {
            const fechaA = new Date(a.fechaOrden ?? (a as any).FechaOrden ?? a.fechaOrden ?? (a as any).FechaCreacion ?? 0).getTime();
            const fechaB = new Date(b.fechaOrden ?? (b as any).FechaOrden ?? b.fechaOrden ?? (b as any).FechaCreacion ?? 0).getTime();
            return fechaB - fechaA;
        });
    }

    return datos;
  }, [listaFacturas, terminoBusqueda, estadoFiltro, configuracionOrden]);

  const indicadorOrden = (campo: string) => {
    if (configuracionOrden?.campo === campo) {
      return configuracionOrden.direccion === 'asc' ? ' ↑' : ' ↓';
    }
    return null;
  };

  // Función para renderizar el badge de color del estado
  const renderizarEstadoBadge = (estadoNum: number) => {
    switch (estadoNum) {
      case 1:
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">Pagado</span>;
      case 2:
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">Pendiente</span>;
      case 3:
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">Parcial</span>;
      case 4:
        return <span className="bg-slate-100 text-slate-500 border border-slate-300 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider line-through">Anulada</span>;
      default:
        return <span className="bg-slate-100 text-slate-500 border border-slate-300 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">Indefinido</span>;
    }
  };

  if (!puedeVerHistorial) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-sky-100 rounded-xl shadow-sm mx-auto max-w-2xl mt-12 text-center">
        <span className="text-6xl mb-4 opacity-80">🔒</span>
        <h2 className="text-xl font-bold text-sky-900 mb-2">Acceso Restringido</h2>
        <p className="text-slate-500">
          Tu nivel de acceso actual no te permite consultar el historial de facturación ni ver reportes antiguos.
        </p>
      </div>
    );
  }

  if (cargando) {
    return <div className="flex justify-center items-center h-64 text-sky-600 font-medium animate-pulse">Cargando histórico...</div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center max-w-2xl mx-auto mt-6">
        <p className="font-bold text-lg mb-2">Error de Conexión</p>
        <p className="font-medium text-sm mb-4">{error}</p>
        <button onClick={cargarHistorial} className="px-5 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl font-bold transition-colors shadow-sm">
          Reintentar conexión
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 max-w-7xl mx-auto">
      
      {/* CABECERA PRINCIPAL */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-sky-100 shadow-sm mt-6">
        <div>
          <h2 className="text-xl font-bold text-sky-900">Histórico de Facturas</h2>
          <p className="text-sm text-slate-500">Consulta, auditoría y reimpresión de órdenes registradas</p>
        </div>
        
        <div className="inline-block" title={!puedeCrearOrdenes ? "No tienes permisos para emitir órdenes oficiales en el sistema." : ""}>
          <button 
            onClick={navegarANuevaFactura}
            disabled={!puedeCrearOrdenes}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md ${!puedeCrearOrdenes ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer hover:-translate-y-0.5'}`}
          >
            + Crear Nueva Factura
          </button>
        </div>
      </div>

      <div className="bg-white border border-sky-100 text-slate-700 rounded-xl overflow-hidden shadow-sm">
        
        {/* BARRA DE HERRAMIENTAS (TOOLBAR) INCRUSTADA */}
        <div className="p-4 border-b border-sky-50 bg-sky-50/30 flex flex-col xl:flex-row gap-4 justify-between items-center">
          
          <div className="w-full xl:w-96 relative">
            <input 
              type="text" 
              placeholder="Buscar por N° Factura, ID o Nombre..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900"
            />
            <span className="absolute left-3 top-2 text-slate-400 text-lg">🔍</span>
          </div>

          <div className="flex w-full xl:w-auto flex-col sm:flex-row gap-3 items-center">
             <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">Estado:</span>
                <select 
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-sky-500 transition-shadow text-slate-700 bg-white"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="1">Pagado (Solvente)</option>
                  <option value="3">Parcial (Debe saldo)</option>
                  <option value="2">Pendiente (No pagado)</option>
                  <option value="4">Anulado</option>
                </select>
             </div>
          </div>
          
          {(terminoBusqueda || estadoFiltro !== 'todos' || configuracionOrden) && (
            <button 
              onClick={resetearFiltros}
              className="px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors font-bold whitespace-nowrap"
            >
              ✕ Limpiar Filtros
            </button>
          )}
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-sky-800 text-xs font-bold uppercase tracking-wider border-b border-sky-100 select-none">
                <th onClick={() => manejarOrden('numeroFactura')} className="p-4 cursor-pointer hover:bg-sky-50 transition-colors">
                  N° Documento {indicadorOrden('numeroFactura')}
                </th>
                <th onClick={() => manejarOrden('fechaOrden')} className="p-4 cursor-pointer hover:bg-sky-50 transition-colors">
                  Fecha {indicadorOrden('fechaOrden')}
                </th>
                <th onClick={() => manejarOrden('pacienteId')} className="p-4 cursor-pointer hover:bg-sky-50 transition-colors">
                  Paciente ID {indicadorOrden('pacienteId')}
                </th>
                <th onClick={() => manejarOrden('nombrePaciente')} className="p-4 cursor-pointer hover:bg-sky-50 transition-colors">
                  Nombre Paciente {indicadorOrden('nombrePaciente')}
                </th>
                <th onClick={() => manejarOrden('estado')} className="p-4 cursor-pointer hover:bg-sky-50 transition-colors">
                  Estado {indicadorOrden('estado')}
                </th>
                <th onClick={() => manejarOrden('totalDivisa')} className="p-4 text-right cursor-pointer hover:bg-sky-50 transition-colors">
                  Total (USD) {indicadorOrden('totalDivisa')}
                </th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {facturasProcesadas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-slate-500 bg-slate-50/50 italic">
                    No se encontraron facturas con los parámetros de búsqueda actuales.
                  </td>
                </tr>
              ) : (
                facturasProcesadas.map((factura) => {
                  const fId = factura.id ?? (factura as any).Id;
                  const numFactura = factura.numeroFactura ?? (factura as any).NumeroFactura;
                  const fecha = factura.fechaOrden ?? (factura as any).FechaOrden ?? factura.fechaOrden ?? (factura as any).FechaCreacion;
                  const paciente = factura.pacienteId ?? (factura as any).PacienteId;
                  const nombrePaciente = factura.nombrePaciente ?? (factura as any).NombrePaciente;
                  const total = factura.totalDivisa ?? (factura as any).TotalDivisa;
                  const estado = factura.estadoPago ?? (factura as any).EstadoPago ?? factura.estado ?? (factura as any).Estado;

                  return (
                    <tr key={fId} className="hover:bg-sky-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-sky-700">{numFactura}</td>
                      <td className="p-4 text-slate-500 font-medium text-xs">{formatearFechaSegura(fecha)}</td>
                      <td className="p-4 text-slate-400 font-bold font-mono">#{paciente}</td>
                      <td className="p-4 text-sky-900 font-bold truncate max-w-[150px]">{nombrePaciente || 'Desconocido'}</td>
                      <td className="p-4">{renderizarEstadoBadge(Number(estado))}</td>
                      <td className="p-4 font-black text-emerald-600 text-right">${Number(total).toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => setFacturaSeleccionadaId(fId)}
                          className="text-sky-600 hover:text-white font-bold text-xs bg-sky-50 border border-sky-100 hover:bg-sky-500 hover:border-sky-500 px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-sky-50 bg-slate-50 text-right">
            <span className="text-xs text-slate-500 font-medium">Mostrando <span className="font-bold text-sky-800">{facturasProcesadas.length}</span> registros</span>
        </div>
      </div>

      <ModalDetallesFactura 
        isOpen={facturaSeleccionadaId !== null} 
        ordenId={facturaSeleccionadaId}
        onClose={() => setFacturaSeleccionadaId(null)} 
      />
      
    </div>
  );
}