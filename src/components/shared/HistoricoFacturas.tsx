import React, { useState, useEffect } from 'react';
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

  if (!puedeVerHistorial) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-xl shadow-sm mx-auto max-w-2xl mt-12 text-center">
        <span className="text-6xl mb-4 opacity-80">🔒</span>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
        <p className="text-slate-500">
          Tu nivel de acceso actual no te permite consultar el historial de facturación ni ver reportes antiguos.
        </p>
      </div>
    );
  }

  if (cargando) {
    return <div className="flex justify-center items-center h-64 text-slate-500">Cargando histórico...</div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center max-w-2xl mx-auto">
        <p className="font-semibold">{error}</p>
        <button onClick={cargarHistorial} className="mt-4 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-sm">
          Reintentar conexión
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Histórico de Facturas</h2>
          <p className="text-sm text-slate-500">Consulta y reimpresión de órdenes registradas</p>
        </div>
        
        <div className="inline-block" title={!puedeCrearOrdenes ? "No tienes permisos para emitir órdenes oficiales en el sistema." : ""}>
          <button 
            onClick={navegarANuevaFactura}
            disabled={!puedeCrearOrdenes}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm ${!puedeCrearOrdenes ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}`}
          >
            + Crear Nueva Factura
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">N° Documento</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">ID Paciente</th>
                <th className="p-4 text-right">Total (USD)</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {listaFacturas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    No hay facturas registradas.
                  </td>
                </tr>
              ) : (
                listaFacturas.map((factura) => {
                  const fId = factura.id ?? (factura as any).Id;
                  const numFactura = factura.numeroFactura ?? (factura as any).NumeroFactura;
                  // CORRECCIÓN: Leemos fechaOrden primero según lo que revela el backend
                  const fecha = factura.fechaOrden ?? (factura as any).FechaOrden;
                  const paciente = factura.pacienteId ?? (factura as any).PacienteId;
                  const total = factura.totalDivisa ?? (factura as any).TotalDivisa;

                  return (
                    <tr key={fId} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-semibold text-emerald-700">{numFactura}</td>
                      <td className="p-4 text-slate-500">{formatearFechaSegura(fecha)}</td>
                      <td className="p-4 text-slate-600">{paciente}</td>
                      <td className="p-4 font-bold text-slate-800 text-right">${total}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => setFacturaSeleccionadaId(fId)}
                          className="text-sky-600 hover:text-sky-800 font-medium text-xs bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded transition-colors"
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
      </div>

      <ModalDetallesFactura 
        isOpen={facturaSeleccionadaId !== null} 
        ordenId={facturaSeleccionadaId}
        onClose={() => setFacturaSeleccionadaId(null)} 
      />
      
    </div>
  );
}