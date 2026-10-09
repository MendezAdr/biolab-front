import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast'; 
import { ordenesService } from '../../services/ordenesService'; 
import type { PagoStandaloneCreateDTO } from '../../types/DTOs/PagoStandaloneCreateDTO';
import type { PagoUpdateDTO } from '../../types/DTOs/PagoUpdateDTO';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';
import { AuditoriaFooter } from './AuditoriaFooter';

interface ModalRegistroPagoProps {
  isOpen: boolean;               
  onClose: () => void;           
  onGuardar: (datos: PagoStandaloneCreateDTO | PagoUpdateDTO) => void; 
  pagoExistente: any | null; 
}

export function ModalRegistroPago({ isOpen, onClose, onGuardar, pagoExistente }: ModalRegistroPagoProps) {
  const { usuario, tienePermiso } = useAuth();
  const currentUserId = usuario?.id || 1; 
  const puedeGestionarPagos = tienePermiso(PERMISOS.GESTIONAR_PAGOS);

  const [ordenId, setOrdenId] = useState<number | ''>('');
  const [montoInput, setMontoInput] = useState<string>('');
  const [metodo, setMetodo] = useState<number>(1); 
  const [referencia, setReferencia] = useState('');

  const [busquedaOrden, setBusquedaOrden] = useState('');
  
  const [ordenesActivasBD, setOrdenesActivasBD] = useState<any[]>([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false);
  const [tasaOrdenActiva, setTasaOrdenActiva] = useState<number>(0);

  const esModoEdicion = !!pagoExistente;
  const isMonedaNacional = metodo !== 5; 

  const datosAuditoriaNormalizados = useMemo(() => {
    if (!pagoExistente) return null;
    return {
      ...pagoExistente,
      creadoPorId: pagoExistente.creadoPorId ?? pagoExistente.CreadoPorId,
      fechaCreacion: pagoExistente.fechaCreacion ?? pagoExistente.FechaCreacion,
      modificadoPorId: pagoExistente.modificadoPorId ?? pagoExistente.ModificadoPorId,
      fechaModificacion: pagoExistente.fechaModificacion ?? pagoExistente.FechaModificacion,
      usuarioCreador: pagoExistente.usuarioCreador ?? pagoExistente.UsuarioCreador,
      usuarioModificador: pagoExistente.usuarioModificador ?? pagoExistente.UsuarioModificador,
      creadoPorNombre: pagoExistente.creadoPorNombre ?? pagoExistente.CreadoPorNombre,
      modificadoPorNombre: pagoExistente.modificadoPorNombre ?? pagoExistente.ModificadoPorNombre
    };
  }, [pagoExistente]);

  const cargarOrdenesConDeuda = async () => {
    try {
      setCargandoOrdenes(true);
      const respuesta = await ordenesService.getUnpaid(currentUserId);
      
      const ordenesProcesadas = respuesta.map((o: any) => {
          const pagosPrevios = o.pagos ?? o.Pagos ?? [];
          const totalPagado = pagosPrevios.reduce((acc: number, p: any) => acc + (Number(p.monto ?? p.Monto) || 0), 0);
          const deudaMatematica = (Number(o.totalDivisa) - totalPagado).toFixed(2);
          
          return {
              id: o.id,
              numeroFactura: o.numeroFactura,
              totalDivisa: Number(o.totalDivisa),
              deudaRestante: Number(deudaMatematica),
              estadoPago: o.estadoPago,
              tasaBcv: o.tasaBcv ?? o.TasaBcv ?? 1
          };
      });

      setOrdenesActivasBD(ordenesProcesadas.filter((o: any) => o.deudaRestante > 0.01));
    } catch (err) {
      console.error("Error cargando órdenes", err);
    } finally {
      setCargandoOrdenes(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (esModoEdicion && pagoExistente) {
        const oId = pagoExistente.ordenId ?? pagoExistente.OrdenId;
        const met = pagoExistente.metodo ?? pagoExistente.Metodo;
        const mUSD = Number(pagoExistente.monto ?? pagoExistente.Monto);
        
        setOrdenId(oId);
        setBusquedaOrden(`ORD-${oId}`); 
        setMetodo(met);
        setReferencia(pagoExistente.referencia ?? pagoExistente.Referencia ?? '');
        
        ordenesService.getById(oId, currentUserId).then(orden => {
            const tasaHistorica = orden.tasaBcv ?? orden.TasaBcv ?? 1;
            setTasaOrdenActiva(tasaHistorica);
            setMontoInput((met !== 5) ? (mUSD * tasaHistorica).toFixed(2) : mUSD.toFixed(2));
        }).catch(() => {
            setTasaOrdenActiva(1);
            setMontoInput(mUSD.toFixed(2));
        });

      } else {
        setOrdenId(''); setBusquedaOrden(''); setMontoInput(''); setMetodo(1); setReferencia(''); setTasaOrdenActiva(0);
        cargarOrdenesConDeuda();
      }
    }
  }, [isOpen, pagoExistente, esModoEdicion]);

  const ordenesSugeridas = useMemo(() => {
    if (busquedaOrden.length < 1 || ordenId !== '') return []; 
    return ordenesActivasBD.filter(o => String(o.id).includes(busquedaOrden.toLowerCase()) || String(o.numeroFactura).toLowerCase().includes(busquedaOrden.toLowerCase()));
  }, [busquedaOrden, ordenesActivasBD, ordenId]);

  // Extraemos la orden actual para cálculos en vivo
  const ordenActual = useMemo(() => {
    if (!ordenId) return null;
    return ordenesActivasBD.find(o => o.id === ordenId) || null;
  }, [ordenId, ordenesActivasBD]);

  if (!isOpen) return null;

  const seleccionarOrden = (orden: any) => {
    setOrdenId(orden.id);
    setBusquedaOrden(`ORD-${orden.id} (${orden.numeroFactura})`);
    setTasaOrdenActiva(orden.tasaBcv);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    const valorInput = Number(montoInput);

    if (!ordenId || !valorInput || !metodo) {
      toast.error("Completa los campos obligatorios.");
      return;
    }

    if (valorInput <= 0) {
      toast.error("El monto debe ser mayor a cero.");
      return;
    }

    const montoNormalizadoUSD = isMonedaNacional ? (valorInput / tasaOrdenActiva) : valorInput;

    if (!esModoEdicion) {
      if (ordenActual) {
        if (montoNormalizadoUSD > (ordenActual.deudaRestante + 0.02)) {
          toast.error(`Abono excesivo. La orden solo debe $${ordenActual.deudaRestante.toFixed(2)}.`);
          setMontoInput(isMonedaNacional ? (ordenActual.deudaRestante * tasaOrdenActiva).toFixed(2) : ordenActual.deudaRestante.toFixed(2));
          return;
        }
      }
    }

    const esPagoDigital = [2, 3, 6].includes(metodo); 
    if (esPagoDigital && !referencia.trim()) {
      toast.error("Este método requiere un número de referencia válido.");
      return;
    }

    if (esModoEdicion) {
      onGuardar({
        id: pagoExistente.id ?? pagoExistente.Id,
        monto: Number(montoNormalizadoUSD.toFixed(2)),
        metodo: metodo, 
        referencia: referencia
      });
    } else {
      onGuardar({
        ordenId: Number(ordenId),
        monto: Number(montoNormalizadoUSD.toFixed(2)),
        metodo: metodo, 
        referencia: referencia
      });
    }
  };

  // Cálculo de simulación de pago en vivo
  const calcularNuevaDeuda = () => {
    if (!ordenActual) return 0;
    const valorPagar = Number(montoInput) || 0;
    const pagoUSD = isMonedaNacional ? (valorPagar / tasaOrdenActiva) : valorPagar;
    return Math.max(0, ordenActual.deudaRestante - pagoUSD);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-sky-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl border border-sky-100 max-w-md w-full p-7 overflow-visible">
        
        <div className="flex justify-between items-center mb-6 border-b border-sky-50 pb-3">
          <div>
            <h3 className="text-xl font-bold text-sky-900">{esModoEdicion ? 'Corregir Registro' : 'Registrar Nuevo Abono'}</h3>
            <p className="text-xs text-sky-600 font-medium mt-1">Auditoría y modificación de caja de seguridad</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 font-bold text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          
          <div className="relative">
            <label className="block text-xs font-bold text-sky-800 uppercase mb-1.5">Buscar Orden Pendiente *</label>
            <input 
              type="text" 
              value={busquedaOrden} 
              onChange={(e) => { setBusquedaOrden(e.target.value); setOrdenId(''); setTasaOrdenActiva(0); }} 
              disabled={esModoEdicion} 
              className={`w-full border rounded-lg px-3 py-2.5 text-sm text-sky-900 bg-slate-50 transition-shadow ${ordenId !== '' ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/50' : 'border-slate-300 focus:border-sky-500'}`} 
              placeholder={cargandoOrdenes ? "Cargando órdenes..." : "Buscar por ID o N° Factura..."}
            />

            {!esModoEdicion && ordenesSugeridas.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-sky-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {ordenesSugeridas.map((orden) => (
                    <div key={orden.id} onClick={() => seleccionarOrden(orden)} className="p-3 hover:bg-sky-50 cursor-pointer border-b border-slate-100 flex justify-between items-center">
                      <div><span className="font-bold text-sky-700">ORD-{orden.id}</span></div>
                      <div className="text-right">
                         <span className="text-xs font-bold text-rose-500 block leading-tight">Debe: ${orden.deudaRestante.toFixed(2)}</span>
                         <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mt-0.5">Bs. {(orden.deudaRestante * orden.tasaBcv).toFixed(2)}</span>
                      </div>
                    </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={`block text-xs font-bold uppercase mb-1.5 ${isMonedaNacional ? 'text-indigo-800' : 'text-emerald-800'}`}>
                Monto ({isMonedaNacional ? 'Bs' : 'USD'}) *
              </label>
              <input 
                type="number" step="0.01" 
                value={montoInput} 
                onChange={(e) => setMontoInput(e.target.value)} 
                disabled={!ordenId}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm font-bold bg-slate-50 transition-shadow disabled:opacity-50 ${isMonedaNacional ? 'border-indigo-300 text-indigo-700 focus:border-indigo-500' : 'border-emerald-300 text-emerald-700 focus:border-emerald-500'}`} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase mb-1.5">Método *</label>
              <select 
                value={metodo} 
                onChange={(e) => setMetodo(Number(e.target.value))} 
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:border-sky-500"
              >
                <option value={1}>Punto de Venta</option>
                <option value={2}>Pago Móvil</option>
                <option value={3}>BioPago</option>
                <option value={4}>Efectivo (Bs)</option>
                <option value={5}>Divisas</option>
                <option value={6}>Transferencia</option>
              </select>
            </div>
          </div>
          
          {/* PANEL INFORMATIVO DE SALDOS */}
          {ordenActual && (
            <div className="bg-sky-50 border border-sky-100 p-3 rounded-lg shadow-inner">
               <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-sky-800">Deuda actual:</span>
                  <div className="text-right">
                     <span className="font-bold text-rose-500 mr-2">${ordenActual.deudaRestante.toFixed(2)}</span>
                     <span className="text-slate-500 font-medium">Bs. {(ordenActual.deudaRestante * tasaOrdenActiva).toFixed(2)}</span>
                  </div>
               </div>

               {montoInput && (
                 <>
                   <div className="flex justify-between items-center text-xs mb-1.5 border-t border-sky-100 pt-1.5">
                      <span className="text-slate-500">Pago equivalente a:</span>
                      <span className="font-bold text-slate-700">
                          {isMonedaNacional ? `$${(Number(montoInput) / tasaOrdenActiva).toFixed(2)} USD` : `Bs. ${(Number(montoInput) * tasaOrdenActiva).toFixed(2)}`}
                      </span>
                   </div>
                   <div className="flex justify-between items-center text-xs border-t border-sky-100 pt-1.5">
                      <span className="font-bold text-sky-800 uppercase tracking-wider">Restante a pagar:</span>
                      <span className={`font-black ${calcularNuevaDeuda() <= 0.01 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          ${calcularNuevaDeuda().toFixed(2)}
                      </span>
                   </div>
                 </>
               )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-sky-800 uppercase mb-1.5">Referencia</label>
            <input type="text" value={referencia} onChange={(e) => setReferencia(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50" placeholder="Requerido para pagos digitales..." />
          </div>
          
          <AuditoriaFooter datosAuditales={datosAuditoriaNormalizados} />

          <div className="flex justify-end space-x-3 pt-5 border-t border-sky-50 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancelar</button>
            <button type="submit" disabled={!puedeGestionarPagos} className="px-5 py-2.5 text-sm font-bold rounded-xl shadow-md text-white bg-sky-500 hover:bg-sky-400 disabled:bg-slate-300">
               {esModoEdicion ? 'Guardar Corrección' : 'Registrar Abono'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}