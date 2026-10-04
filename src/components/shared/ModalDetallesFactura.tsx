import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordenesService } from '../../services/ordenesService';
import { pacienteService } from '../../services/pacienteService';
import type { Orden } from '../../types/OrdenesModel';
import { PagoMetodo, type Pago } from '../../types/PagoModel';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';
import { AuditoriaFooter } from './AuditoriaFooter';

interface ModalDetallesFacturaProps {
  ordenId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ModalDetallesFactura({ ordenId, isOpen, onClose }: ModalDetallesFacturaProps) {
  const { usuario, tienePermiso } = useAuth();
  const currentUserId = usuario?.id || 1; 

  const puedeVerReportes = tienePermiso(PERMISOS.VER_REPORTES);

  const [ordenDetalle, setOrdenDetalle] = useState<Orden | null>(null);
  const [nombrePaciente, setNombrePaciente] = useState<string>('Cargando...');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && ordenId) {
      const cargarDetalles = async () => {
        try {
          setCargando(true);
          setError(null);
          
          const data = await ordenesService.getById(ordenId, currentUserId);
          setOrdenDetalle(data);
          
          const pacienteId = data.pacienteId ?? data.PacienteId;
          
          if (data && pacienteId) {
            try {
               const respuestaBackend = await pacienteService.getById(pacienteId);
               
               const p = respuestaBackend?.Data ?? respuestaBackend?.data ?? respuestaBackend?.objeto ?? respuestaBackend;

               if (p && (p.nombre || p.Nombre)) {
                   const n = p.nombre ?? p.Nombre;
                   const a = p.apellido ?? p.Apellido ?? '';
                   setNombrePaciente(`${n} ${a}`.trim());
               } else {
                   setNombrePaciente(`ID: ${pacienteId} (Datos ilegibles)`);
               }
            } catch(err) {
               console.warn("Fallo al consultar paciente:", err);
               setNombrePaciente(`ID: ${pacienteId} (Desconocido)`);
            }
          }

        } catch (err) {
          setError("No se pudieron cargar los detalles de esta factura.");
        } finally {
          setCargando(false);
        }
      };
      cargarDetalles();
    } else {
      setOrdenDetalle(null);
      setNombrePaciente('Cargando...');
    }
  }, [isOpen, ordenId, currentUserId]);

  const formatearFechaYHoraSegura = (fechaString: any) => {
    if (!fechaString) return 'No disponible';
    const fechaObj = new Date(fechaString);
    return isNaN(fechaObj.getTime()) ? 'Inválida' : fechaObj.toLocaleString();
  };

  const manejarImpresion = () => {
    if (!ordenDetalle) return;
    
    const paqueteImpresion = {
      tipoDocumento: 'factura',
      datos: {
          ...ordenDetalle,
          PacienteNombre: nombrePaciente 
      }
    };

    onClose();
    navigate('/impresiones', { state: paqueteImpresion });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-sky-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-sky-100 w-full max-w-2xl p-7 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6 border-b border-sky-50 pb-3">
          <h3 className="text-xl font-bold text-sky-900">
            Detalles de Factura {ordenDetalle ? <span className="font-mono text-sky-600">#{ordenDetalle.numeroFactura ?? (ordenDetalle as any).NumeroFactura}</span> : ''}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 transition-colors font-bold text-xl">✕</button>
        </div>

        {cargando ? (
          <div className="flex justify-center items-center h-40 text-sky-600 font-medium animate-pulse">Cargando información completa...</div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 font-medium text-center rounded-lg border border-rose-200">{error}</div>
        ) : ordenDetalle ? (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-sky-50/50 p-5 rounded-xl border border-sky-100 shadow-sm">
              <div>
                <p className="text-[10px] text-sky-700 uppercase font-bold tracking-wider mb-1">Paciente</p>
                <p className="font-bold text-slate-800">{nombrePaciente}</p>
              </div>
              <div>
                <p className="text-[10px] text-sky-700 uppercase font-bold tracking-wider mb-1">Fecha de Emisión</p>
                <p className="font-bold text-slate-800">{formatearFechaYHoraSegura(ordenDetalle.fechaOrden ?? (ordenDetalle as any).FechaOrden)}</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-sky-50 shadow-sm text-center">
                <p className="text-[10px] text-sky-700 uppercase font-bold tracking-wider mb-1">Total a Pagar (USD)</p>
                <p className="font-black text-emerald-600 text-lg">${ordenDetalle.totalDivisa ?? (ordenDetalle as any).TotalDivisa}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sky-900 mb-3 border-b border-sky-50 pb-2">Exámenes Solicitados</h4>
              {(ordenDetalle.detalles ?? (ordenDetalle as any).Detalles)?.length > 0 ? (
                <ul className="space-y-2">
                  {(ordenDetalle.detalles ?? (ordenDetalle as any).Detalles).map((det: any, index: number) => {
                    const nombreExamen = det.examenNombre ?? det.ExamenNombre ?? 'Examen General';
                    const precio = det.precioMomentoDivisa ?? det.PrecioMomentoDivisa ?? 0;
                    return (
                      <li key={index} className="flex justify-between items-center text-sm p-3 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:border-sky-200 transition-colors">
                        <span className="font-bold">{nombreExamen}</span>
                        <span className="font-black text-emerald-600 text-right bg-emerald-50 px-2 py-1 rounded">
                          <span className="text-[10px] text-emerald-700 font-bold uppercase mr-1">Precio:</span> 
                          ${precio}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded-lg text-center">No hay exámenes registrados en esta orden.</p>
              )}
            </div>

            <div>
              <h4 className="font-bold text-sky-900 mb-3 border-b border-sky-50 pb-2">Registro de Pagos (Abonos)</h4>
              {(ordenDetalle.pagos ?? (ordenDetalle as any).Pagos)?.length > 0 ? (
                <ul className="space-y-2">
                  {(ordenDetalle.pagos ?? (ordenDetalle as any).Pagos).map((pago: any, index: number) => {
                    const met = pago.metodo ?? pago.Metodo;
                    const metodoEncontrado = PagoMetodo.find(m => m.id === met);
                    const nombreMetodo = metodoEncontrado ? metodoEncontrado.metodo : 'Desconocido';
                    const referencia = pago.referencia ?? pago.Referencia;
                    const monto = pago.monto ?? pago.Monto;

                    return (
                      <li key={index} className="flex justify-between text-sm p-3 bg-sky-50 border border-sky-100 text-slate-700 rounded-lg shadow-sm">
                        <span className="font-bold text-sky-900">{nombreMetodo} <span className="text-xs text-sky-600 font-medium ml-1">(Ref: {referencia || 'N/A'})</span></span>
                        <span className="font-black text-sky-700">${monto}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded-lg text-center">Orden pendiente de pago o sin abonos registrados.</p>
              )}
            </div>
              
            <AuditoriaFooter datosAuditales={ordenDetalle} />
            
            <div className="pt-5 mt-2 flex justify-end border-t border-sky-50">
              <div className="inline-block" title={!puedeVerReportes ? "No tienes permisos para reimprimir facturas o reportes antiguos." : ""}>
                <button 
                  onClick={manejarImpresion}
                  disabled={!puedeVerReportes}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md ${!puedeVerReportes ? 'bg-slate-300 text-white cursor-not-allowed shadow-none' : 'bg-sky-500 hover:bg-sky-400 text-white hover:-translate-y-0.5'}`}
                >
                  <span className="text-lg">🖨️</span> Imprimir Copia PDF
                </button>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}