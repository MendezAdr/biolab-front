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
  
  // Variables matemáticas extraídas
  const [deudaRestante, setDeudaRestante] = useState<number>(0);
  const [totalPagado, setTotalPagado] = useState<number>(0);

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
          
          // Cálculos matemáticos en vivo
          const totalDivisaObj = Number(data.totalDivisa ?? (data as any).TotalDivisa ?? 0);
          const pagosPrevios = data.pagos ?? (data as any).Pagos ?? [];
          const sumaPagos = pagosPrevios.reduce((acc: number, p: any) => acc + (Number(p.monto ?? p.Monto) || 0), 0);
          
          setTotalPagado(sumaPagos);
          setDeudaRestante(Math.max(0, totalDivisaObj - sumaPagos));

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
      setDeudaRestante(0);
      setTotalPagado(0);
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

      <div className="relative bg-white rounded-3xl shadow-2xl border border-sky-100 w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6 border-b border-sky-50 pb-4">
          <h3 className="text-xl font-bold text-sky-900">
            Detalles de Factura {ordenDetalle ? <span className="font-mono text-sky-600 bg-sky-50 px-2 py-0.5 rounded ml-1">#{ordenDetalle.numeroFactura ?? (ordenDetalle as any).NumeroFactura}</span> : ''}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 transition-colors font-bold text-2xl leading-none">✕</button>
        </div>

        {cargando ? (
          <div className="flex justify-center items-center h-48 text-sky-600 font-medium animate-pulse">Cargando información completa de la orden...</div>
        ) : error ? (
          <div className="p-5 bg-rose-50 text-rose-700 font-bold text-center rounded-xl border border-rose-200">{error}</div>
        ) : ordenDetalle ? (
          <div className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-sky-950 p-5 rounded-2xl border border-sky-900 shadow-inner">
              <div className="md:col-span-2">
                <p className="text-[10px] text-sky-400 uppercase font-bold tracking-wider mb-1">Paciente Asignado</p>
                <p className="font-bold text-white text-lg truncate">{nombrePaciente}</p>
              </div>
              <div className="md:col-span-2 text-right md:border-l md:border-sky-800/50 md:pl-4">
                <p className="text-[10px] text-sky-400 uppercase font-bold tracking-wider mb-1">Fecha de Emisión</p>
                <p className="font-bold text-sky-100">{formatearFechaYHoraSegura(ordenDetalle.fechaOrden ?? (ordenDetalle as any).FechaOrden ?? ordenDetalle.fechaOrden ?? (ordenDetalle as any).FechaCreacion)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* COLUMNA IZQUIERDA: EXÁMENES */}
                <div>
                  <h4 className="font-bold text-sky-900 mb-3 border-b border-sky-50 pb-2 flex items-center">
                    <span className="mr-2">🔬</span> Exámenes Solicitados
                  </h4>
                  {(ordenDetalle.detalles ?? (ordenDetalle as any).Detalles)?.length > 0 ? (
                    <ul className="space-y-2">
                      {(ordenDetalle.detalles ?? (ordenDetalle as any).Detalles).map((det: any, index: number) => {
                        const nombreExamen = det.examenNombre ?? det.ExamenNombre ?? 'Examen General';
                        const precio = det.precioMomentoDivisa ?? det.PrecioMomentoDivisa ?? 0;
                        return (
                          <li key={index} className="flex justify-between items-center text-sm p-3 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:border-sky-200 transition-colors">
                            <span className="font-bold truncate pr-2">{nombreExamen}</span>
                            <span className="font-black text-emerald-600 text-right bg-emerald-50 px-2 py-1 rounded">
                              ${Number(precio).toFixed(2)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center border border-slate-200 shadow-sm">No hay exámenes registrados en esta orden.</p>
                  )}
                </div>

                {/* COLUMNA DERECHA: PAGOS Y TOTALES */}
                <div>
                  <h4 className="font-bold text-sky-900 mb-3 border-b border-sky-50 pb-2 flex items-center">
                    <span className="mr-2">💰</span> Registro de Pagos
                  </h4>
                  {(ordenDetalle.pagos ?? (ordenDetalle as any).Pagos)?.length > 0 ? (
                    <ul className="space-y-2 mb-6">
                      {(ordenDetalle.pagos ?? (ordenDetalle as any).Pagos).map((pago: any, index: number) => {
                        const met = pago.metodo ?? pago.Metodo;
                        const nombreMetodo = PagoMetodo.find(m => m.id === met)?.metodo || 'Desconocido';
                        const referencia = pago.referencia ?? pago.Referencia;
                        
                        // EL PAGO SIEMPRE ESTÁ EN USD, EL FRONT LO MULTIPLICA PARA MOSTRAR LOS BS ORIGINALES
                        const montoUSD = Number(pago.monto ?? pago.Monto);
                        const tasaHist = Number(ordenDetalle.tasaBcv ?? (ordenDetalle as any).TasaBcv ?? 1);
                        const montoBsCalculado = montoUSD * tasaHist;

                        return (
                          <li key={index} className="flex justify-between items-center text-sm p-3 bg-sky-50 border border-sky-100 text-slate-700 rounded-xl shadow-sm">
                            <div>
                                <span className="font-bold text-sky-900 block">{nombreMetodo}</span>
                                {referencia && <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">Ref: {referencia}</span>}
                            </div>
                            <div className="text-right">
                                <span className="font-black text-sky-700 bg-white px-2.5 py-1 border border-sky-200 rounded-lg shadow-sm block">${montoUSD.toFixed(2)}</span>
                                {met !== 5 && <span className="text-[10px] text-slate-400 font-bold block mt-1">Equivalió a Bs. {montoBsCalculado.toFixed(2)}</span>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center border border-slate-200 shadow-sm mb-6">Orden sin abonos registrados.</p>
                  )}

                  {/* CAJA DE TOTALES */}
                  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
                     <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Total Facturado</span>
                        <span className="font-black text-slate-700">${Number(ordenDetalle.totalDivisa ?? (ordenDetalle as any).TotalDivisa ?? 0).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Total Abonado</span>
                        <span className="font-black text-sky-600">${totalPagado.toFixed(2)}</span>
                     </div>
                     <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                        <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">Saldo Pendiente</span>
                        <span className={`font-black text-xl px-2.5 py-1 rounded-lg ${deudaRestante > 0.01 ? 'text-rose-600 bg-rose-50 border border-rose-100' : 'text-emerald-600 bg-emerald-50 border border-emerald-100'}`}>
                            ${deudaRestante.toFixed(2)}
                        </span>
                     </div>
                  </div>
                </div>
            </div>
              
            <AuditoriaFooter datosAuditales={ordenDetalle} />
            
            <div className="pt-6 mt-4 flex justify-end border-t border-sky-50">
              <div className="inline-block" title={!puedeVerReportes ? "No tienes permisos para reimprimir facturas o reportes antiguos." : ""}>
                <button 
                  onClick={manejarImpresion}
                  disabled={!puedeVerReportes}
                  className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md ${!puedeVerReportes ? 'bg-slate-300 text-white cursor-not-allowed shadow-none' : 'bg-sky-500 hover:bg-sky-400 text-white hover:-translate-y-0.5'}`}
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