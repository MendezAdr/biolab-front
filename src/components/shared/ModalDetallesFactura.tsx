import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordenesService } from '../../services/ordenesService';
import { pacienteService } from '../../services/pacienteService';
import type { Orden } from '../../types/OrdenesModel';
import { PagoMetodo, type Pago } from '../../types/PagoModel';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

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
               // 1. Enviamos currentUserId para pasar la validación del backend
               const respuestaBackend = await pacienteService.getById(pacienteId);
               
               // 2. Extracción profunda resistente a anidamiento
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
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">
            Detalles de la Factura {ordenDetalle ? `#${ordenDetalle.numeroFactura ?? (ordenDetalle as any).NumeroFactura}` : ''}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1 text-xl">✕</button>
        </div>

        {cargando ? (
          <div className="flex justify-center items-center h-40 text-slate-500">Cargando información completa...</div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 text-center rounded-lg">{error}</div>
        ) : ordenDetalle ? (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Paciente</p>
                <p className="font-medium text-slate-800">{nombrePaciente}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Fecha de Emisión</p>
                <p className="font-medium text-slate-800">{formatearFechaYHoraSegura(ordenDetalle.fechaOrden ?? (ordenDetalle as any).FechaOrden)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Total a Pagar (USD)</p>
                <p className="font-bold text-emerald-700 text-lg">${ordenDetalle.totalDivisa ?? (ordenDetalle as any).TotalDivisa}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-700 mb-2 border-b pb-1">Exámenes Solicitados</h4>
              {(ordenDetalle.detalles ?? (ordenDetalle as any).Detalles)?.length > 0 ? (
                <ul className="space-y-2">
                  {(ordenDetalle.detalles ?? (ordenDetalle as any).Detalles).map((det: any, index: number) => {
                    const nombreExamen = det.examenNombre ?? det.ExamenNombre ?? 'Examen General';
                    const precio = det.precioMomentoDivisa ?? det.PrecioMomentoDivisa ?? 0;
                    return (
                      <li key={index} className="flex justify-between items-center text-sm p-2 bg-white border text-slate-700 border-slate-100 rounded">
                        <span className="font-medium">{nombreExamen}</span>
                        <span className="font-bold text-emerald-700 text-right">
                          <span className="text-xs text-slate-400 font-normal mr-1">Precio Divisa:</span> 
                          ${precio}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No hay exámenes registrados.</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-slate-700 mb-2 border-b pb-1">Registro de Pagos (Abonos)</h4>
              {(ordenDetalle.pagos ?? (ordenDetalle as any).Pagos)?.length > 0 ? (
                <ul className="space-y-2">
                  {(ordenDetalle.pagos ?? (ordenDetalle as any).Pagos).map((pago: any, index: number) => {
                    const met = pago.metodo ?? pago.Metodo;
                    const metodoEncontrado = PagoMetodo.find(m => m.id === met);
                    const nombreMetodo = metodoEncontrado ? metodoEncontrado.metodo : 'Desconocido';
                    const referencia = pago.referencia ?? pago.Referencia;
                    const monto = pago.monto ?? pago.Monto;

                    return (
                      <li key={index} className="flex justify-between text-sm p-2 text-slate-700 bg-white border border-slate-100 rounded">
                        <span>{nombreMetodo} <span className="text-xs text-slate-500">(Ref: {referencia || 'N/A'})</span></span>
                        <span className="font-medium">${monto}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Orden pendiente de pago o sin abonos registrados.</p>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <div className="inline-block" title={!puedeVerReportes ? "No tienes permisos para reimprimir facturas o reportes antiguos." : ""}>
                <button 
                  onClick={manejarImpresion}
                  disabled={!puedeVerReportes}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${!puedeVerReportes ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700 text-white'}`}
                >
                  <span>🖨️</span> Imprimir Copia
                </button>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}