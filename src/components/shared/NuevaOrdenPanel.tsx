import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 
import { pacienteService } from '../../services/pacienteService';
import { examenesService } from '../../services/examenesService';
import { ordenesService } from '../../services/ordenesService';
import { ModalPaciente } from './ModalPaciente';
import type { OrdenCreateDTO } from '../../types/DTOs/OrdenCreateDTO';
import type { PacienteCreateDTO } from '../../types/DTOs/PacienteCreateDTO';
import type { PagoOrdenCreateDTO } from '../../types/DTOs/PagoOrdenCreateDTO';
import { PagoMetodo } from '../../types/PagoModel'; 
import type { Examen } from '../../types/ExamenModel'; 
import type { Paciente } from '../../types/PacienteModel';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

export function NuevaOrdenPanel() {
  const { usuario, tienePermiso, tasaBcv } = useAuth();
  const currentUserId = usuario?.id || 1; 

  const puedeCrearPaciente = tienePermiso(PERMISOS.MODIFICAR_PACIENTES);
  const puedeRegistrarPagos = tienePermiso(PERMISOS.GESTIONAR_PAGOS);
  const puedeCrearOrden = tienePermiso(PERMISOS.CREAR_ORDENES_Y_DETALLES);
  
  const location = useLocation();
  const examenesDesdePresupuesto = location.state?.examenesPreCargados || [];
  const cedulaDesdePresupuesto = location.state?.cedulaPreCargada || '';
  
  const [pacientesBD, setPacientesBD] = useState<Paciente[]>([]); 
  const [examenesBD, setExamenesBD] = useState<Examen[]>([]); 
  
  const [cargandoGlobal, setCargandoGlobal] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  
  const [busquedaCedula, setBusquedaCedula] = useState<string>(cedulaDesdePresupuesto); 
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null); 
  const [modalPacienteAbierto, setModalPacienteAbierto] = useState(false);

  const [busquedaExamen, setBusquedaExamen] = useState('');
  const [examenesCarrito, setExamenesCarrito] = useState<Examen[]>(examenesDesdePresupuesto); 

  const [pagosAgregados, setPagosAgregados] = useState<PagoOrdenCreateDTO[]>([]);
  
  // ESTADOS BIMODALES
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<number>(1); // Por defecto: Punto de Venta (Bs)
  const [montoPagoInput, setMontoPagoInput] = useState<string>('');
  const [referenciaPagoInput, setReferenciaPagoInput] = useState<string>('');

  const seccionExamenesHabilitada = pacienteSeleccionado !== null || examenesCarrito.length > 0;
  const requiereAtencionPaciente = examenesCarrito.length > 0 && !pacienteSeleccionado;

  // LÓGICA DE MONEDA: Solo el Método 5 (Divisas) es en USD. Todo lo demás es Bolívares.
  const isMonedaNacional = metodoPagoSeleccionado !== 5;

  const cargarDatosMaestros = async () => {
    try {
      setCargandoGlobal(true);
      const [pacientesRes, examenesRes] = await Promise.all([
        pacienteService.getAll(),
        examenesService.getAll()
      ]);
      setPacientesBD(pacientesRes?.Data || pacientesRes?.data || pacientesRes || []);
      setExamenesBD(examenesRes || []);
    } catch (err) {
      setErrorGlobal("Fallo al inicializar el módulo de órdenes.");
    } finally {
      setCargandoGlobal(false);
    }
  };

  useEffect(() => {
    if (puedeCrearOrden) cargarDatosMaestros();
    else setCargandoGlobal(false);
  }, [puedeCrearOrden]);

  const pacientesSugeridos = useMemo(() => {
    if (!busquedaCedula || busquedaCedula.length < 3) return [];
    return pacientesBD.filter(p => {
      const cedulaSegura = String(p.cedula ?? (p as any).Cedula ?? '').toLowerCase();
      const isActive = p.isActive ?? (p as any).IsActive ?? true;
      return cedulaSegura.includes(busquedaCedula.toLowerCase()) && isActive;
    });
  }, [busquedaCedula, pacientesBD]);

  const examenesFiltrados = useMemo(() => {
    if (!busquedaExamen) return examenesBD;
    const busquedaLower = busquedaExamen.toLowerCase();
    return examenesBD.filter(e => {
      const nombreSeguro = String(e.nombreExamen ?? (e as any).NombreExamen ?? '').toLowerCase();
      return nombreSeguro.includes(busquedaLower);
    });
  }, [busquedaExamen, examenesBD]);

  // CÁLCULOS GLOBALES SIEMPRE EN DÓLARES (Con proyecciones a Bs)
  const totalDivisa = examenesCarrito.reduce((acc, ex) => acc + (ex.costoEnDivisa ?? (ex as any).CostoEnDivisa ?? 0), 0);
  const totalBolivares = totalDivisa * tasaBcv;
  
  // Los pagos agregados SIEMPRE guardan Dólares
  const totalPagadoUSD = pagosAgregados.reduce((acc, pago) => acc + pago.monto, 0);
  const saldoRestanteUSD = totalDivisa - totalPagadoUSD;

  // Auto-completar el input de pago dependiendo de la moneda seleccionada
  useEffect(() => {
    if (saldoRestanteUSD > 0) {
      // Si estamos en Bolívares, mostramos el saldo pendiente multiplicado por la tasa
      const sugerencia = isMonedaNacional ? (saldoRestanteUSD * tasaBcv) : saldoRestanteUSD;
      setMontoPagoInput(sugerencia.toFixed(2));
    } else {
      setMontoPagoInput('');
    }
  }, [saldoRestanteUSD, isMonedaNacional, tasaBcv]);

  const agregarAlCarrito = (examen: Examen) => {
    const idExamen = examen.id ?? (examen as any).Id;
    if (!examenesCarrito.find(e => (e.id ?? (e as any).Id) === idExamen)) {
      setExamenesCarrito([...examenesCarrito, examen]);
    }
  };

  const quitarDelCarrito = (idExamen: number) => {
    setExamenesCarrito(examenesCarrito.filter(e => (e.id ?? (e as any).Id) !== idExamen));
    setPagosAgregados([]); 
  };

  const manejarGuardarPacienteInline = async (nuevoPaciente: PacienteCreateDTO) => {
    toast.promise(
      (async () => {
        const respuestaCreacion = await pacienteService.create(nuevoPaciente, currentUserId);
        
        const pacientesActualizados = await pacienteService.getAll();
        const listaDocs = pacientesActualizados?.Data || pacientesActualizados?.data || pacientesActualizados || [];
        setPacientesBD(listaDocs);

        const cedulaBuscada = nuevoPaciente.cedula ?? (nuevoPaciente as any).Cedula;
        const pacienteReal = listaDocs.find((p: any) => (p.cedula ?? p.Cedula) === cedulaBuscada);
        
        if (pacienteReal) {
            setPacienteSeleccionado(pacienteReal);
            setBusquedaCedula(pacienteReal.cedula ?? pacienteReal.Cedula);
        } else {
            const fallbackObj = { ...nuevoPaciente, id: respuestaCreacion?.id ?? 9999 };
            setPacienteSeleccionado(fallbackObj as any);
            setBusquedaCedula(cedulaBuscada);
        }
        setModalPacienteAbierto(false);
      })(),
      {
        loading: 'Registrando ficha...',
        success: 'Paciente registrado y vinculado automáticamente.',
        error: 'Error al registrar el paciente.'
      }
    );
  };

  const agregarPago = () => {
    const valorInput = Number(montoPagoInput);

    if (!valorInput || valorInput <= 0) {
      toast.error("El monto debe ser mayor a cero.");
      return;
    }

    // CONVERSIÓN CRÍTICA: Llevamos lo que escribió el usuario a DÓLARES
    const montoNormalizadoUSD = isMonedaNacional ? (valorInput / tasaBcv) : valorInput;

    // Tolerancia de centavos para problemas de redondeo
    if (montoNormalizadoUSD > saldoRestanteUSD + 0.02) {
      toast.error(`El abono supera la deuda pendiente ($${saldoRestanteUSD.toFixed(2)}).`);
      setMontoPagoInput(isMonedaNacional ? (saldoRestanteUSD * tasaBcv).toFixed(2) : saldoRestanteUSD.toFixed(2));
      return;
    }

    const requiereReferencia = [2, 3, 6].includes(metodoPagoSeleccionado);
    if (requiereReferencia && !referenciaPagoInput.trim()) {
      toast.error("Este método exige un número de referencia.");
      return;
    }

    // Se guarda estrictamente en USD
    setPagosAgregados([...pagosAgregados, {
      monto: Number(montoNormalizadoUSD.toFixed(2)),
      metodo: metodoPagoSeleccionado,
      referencia: referenciaPagoInput
    }]);

    setReferenciaPagoInput('');
  };

  const quitarPago = (index: number) => {
    setPagosAgregados(pagosAgregados.filter((_, i) => i !== index));
  };

  const procesarOrdenFinal = async () => {
    if (!pacienteSeleccionado || examenesCarrito.length === 0) {
      toast.error("Faltan datos en la orden.");
      return;
    }

    const pacienteId = pacienteSeleccionado.id ?? (pacienteSeleccionado as any).Id;

    const nuevaOrden: OrdenCreateDTO = {
      numeroFactura: `ORD-${Date.now()}`, 
      pacienteId: pacienteId,
      totalDivisa: totalDivisa,
      tasaBcv: tasaBcv,
      fecha: new Date(),
      detalles: examenesCarrito.map(ex => ({ 
        examenId: ex.id ?? (ex as any).Id, 
        precioMomentoDivisa: ex.costoEnDivisa ?? (ex as any).CostoEnDivisa 
      })),
      pagos: pagosAgregados // Ya están en USD normalizados
    };

    toast.promise(
      (async () => {
        await ordenesService.create(nuevaOrden, currentUserId);
        setPacienteSeleccionado(null);
        setBusquedaCedula('');
        setExamenesCarrito([]);
        setPagosAgregados([]);
      })(),
      {
        loading: 'Procesando venta...',
        success: '¡Orden registrada exitosamente!',
        error: (err) => err.message || 'Error al procesar la orden.'
      }
    );
  };

  if (!puedeCrearOrden) return <div className="p-12 text-center">🔒 Acceso Restringido</div>;
  if (cargandoGlobal) return <div className="p-10 text-center text-sky-600 font-medium">Inicializando...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <Toaster position="bottom-right" />
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-sky-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-sky-900">Nueva Orden de Laboratorio</h2>
          <p className="text-sm text-slate-500">Operador actual: <span className="font-bold text-sky-600">{usuario?.nombre || 'Desconocido'}</span></p>
        </div>
        <div className="bg-sky-50 border border-sky-200 text-sky-900 px-4 py-2 rounded-lg text-sm font-bold flex flex-col items-end shadow-sm">
          <span className="text-sky-600 text-xs uppercase tracking-wider">Tasa BCV del Día</span>
          <span className="text-lg">Bs. {tasaBcv.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-5 rounded-xl border border-sky-100 shadow-sm">
            <h3 className="font-bold text-sky-900 mb-4 border-b border-sky-50 pb-2">1. Identificación del Paciente</h3>
            {pacienteSeleccionado ? (
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-4 rounded-lg shadow-sm">
                <div>
                  <p className="text-sm font-bold text-emerald-800">{pacienteSeleccionado.nombre ?? (pacienteSeleccionado as any).Nombre} {pacienteSeleccionado.apellido ?? (pacienteSeleccionado as any).Apellido}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">C.I: {pacienteSeleccionado.cedula ?? (pacienteSeleccionado as any).Cedula}</p>
                </div>
                <button onClick={() => setPacienteSeleccionado(null)} className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded hover:bg-emerald-200 transition-colors">
                  Cambiar Paciente
                </button>
              </div>
            ) : (
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ingrese Cédula del paciente..."
                  value={busquedaCedula}
                  onChange={(e) => setBusquedaCedula(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm border border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                {busquedaCedula.length >= 3 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-sky-100 rounded-lg shadow-xl overflow-hidden">
                    {pacientesSugeridos.length > 0 ? (
                      pacientesSugeridos.map((p, index) => (
                          <div key={index} onClick={() => setPacienteSeleccionado(p)} className="p-3 hover:bg-sky-50 cursor-pointer border-b border-slate-100">
                            <span className="font-semibold text-sm text-sky-700">{p.cedula ?? (p as any).Cedula}</span> <span className="mx-1">-</span> <span className="text-sm text-slate-600">{p.nombre ?? (p as any).Nombre} {p.apellido ?? (p as any).Apellido}</span>
                          </div>
                      ))
                    ) :(
                      <div className="p-5 text-center bg-slate-50">
                        <p className="text-sm text-slate-500 mb-3">No hay pacientes con esa cédula.</p>
                        <button onClick={() => setModalPacienteAbierto(true)} className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                          + Registrar Nuevo Paciente
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`bg-white p-5 rounded-xl border border-sky-100 shadow-sm transition-opacity ${!seccionExamenesHabilitada ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="font-bold text-sky-900 mb-4 border-b border-sky-50 pb-2">2. Selección de Exámenes</h3>
            <div className="relative mb-4">
              <input type="text" placeholder="Buscar examen..." value={busquedaExamen} onChange={(e) => setBusquedaExamen(e.target.value)} className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-slate-50" />
              <span className="absolute left-3 top-2.5 text-slate-400 text-lg">🔍</span>
            </div>
            <div className="max-h-64 overflow-y-auto border border-sky-50 rounded-lg custom-scrollbar">
              {examenesFiltrados.map(examen => {
                const exId = examen.id ?? (examen as any).Id;
                const estaEnCarrito = examenesCarrito.some(e => (e.id ?? (e as any).Id) === exId);
                return (
                  <div key={exId} className="flex justify-between items-center p-3 hover:bg-sky-50 border-b border-slate-50">
                    <p className="text-sm font-medium text-slate-700">{examen.nombreExamen ?? (examen as any).NombreExamen}</p>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-emerald-600">${examen.costoEnDivisa ?? (examen as any).CostoEnDivisa}</span>
                      <button onClick={() => agregarAlCarrito(examen)} disabled={estaEnCarrito} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${estaEnCarrito ? 'bg-sky-100 text-sky-500 cursor-not-allowed' : 'text-white bg-sky-500'}`}>
                        {estaEnCarrito ? 'Añadido ✔️' : 'Añadir'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DISTRIBUCIÓN DE PAGOS BIMODAL */}
          <div className={`bg-white p-5 rounded-xl border border-sky-100 shadow-sm transition-opacity ${examenesCarrito.length === 0 ? 'opacity-50 pointer-events-none hidden' : ''}`}>
            <h3 className="font-bold text-sky-900 mb-4 border-b border-sky-50 pb-2">3. Recepción de Pagos</h3>
            
            <div className="flex flex-wrap lg:flex-nowrap gap-3 items-end mb-4 bg-sky-50/50 p-4 rounded-lg border border-sky-100">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-bold text-sky-800 uppercase mb-1">Método</label>
                <select value={metodoPagoSeleccionado} onChange={(e) => setMetodoPagoSeleccionado(Number(e.target.value))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:border-sky-500">
                  {PagoMetodo.map(m => <option key={m.id} value={m.id}>{m.metodo}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                {/* ETIQUETA DINÁMICA DE MONEDA */}
                <label className={`block text-xs font-bold uppercase mb-1 ${isMonedaNacional ? 'text-indigo-800' : 'text-emerald-800'}`}>
                  Monto ({isMonedaNacional ? 'Bs' : 'USD'})
                </label>
                <input 
                    type="number" step="0.01" 
                    value={montoPagoInput} 
                    onChange={(e) => setMontoPagoInput(e.target.value)} 
                    className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white font-bold ${isMonedaNacional ? 'text-indigo-700 focus:border-indigo-500' : 'text-emerald-700 focus:border-emerald-500'}`} 
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-bold text-sky-800 uppercase mb-1">Ref.</label>
                <input type="text" value={referenciaPagoInput} onChange={(e) => setReferenciaPagoInput(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white" placeholder="Opcional" />
              </div>
              
              <div className="w-full lg:w-auto">
                <button onClick={agregarPago} disabled={saldoRestanteUSD <= 0} className="w-full px-5 py-2 rounded-lg text-sm font-bold bg-sky-500 hover:bg-sky-600 text-white h-[38px] disabled:bg-slate-300">
                  Abonar
                </button>
              </div>
            </div>

            {/* EQUIVALENCIA VISUAL EN TIEMPO REAL */}
            {montoPagoInput && (
                <p className="text-xs text-slate-500 mb-4 px-2 font-medium">
                   Equivale a: <span className="font-bold text-slate-700">
                     {isMonedaNacional 
                        ? `$${(Number(montoPagoInput) / tasaBcv).toFixed(2)} USD` 
                        : `Bs. ${(Number(montoPagoInput) * tasaBcv).toFixed(2)}`}
                   </span>
                </p>
            )}

            {pagosAgregados.length > 0 && (
              <div className="space-y-2">
                {pagosAgregados.map((p, index) => {
                  const nombreMetodo = PagoMetodo.find(m => m.id === p.metodo)?.metodo || 'Desconocido';
                  return (
                    <div key={index} className="flex justify-between items-center bg-white border border-sky-100 p-3 rounded-lg text-sm">
                      <div>
                        <span className="font-bold text-sky-900">{nombreMetodo}</span>
                        {p.referencia && <span className="text-slate-400 ml-2 font-medium">(Ref: {p.referencia})</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="font-black text-emerald-600 block leading-tight">${p.monto.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-400 font-bold block">Bs. {(p.monto * tasaBcv).toFixed(2)}</span>
                        </div>
                        <button onClick={() => quitarPago(index)} className="text-rose-400 hover:text-rose-600 bg-rose-50 p-1.5 rounded-md font-bold">✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-sky-900 text-white p-6 rounded-xl shadow-xl border border-sky-800 sticky top-6">
            <h3 className="font-bold text-lg mb-4 border-b border-sky-700 pb-3">📄 Resumen de la Orden</h3>
            
            <div className="min-h-[150px] max-h-[300px] overflow-y-auto mb-5 space-y-2.5 pr-2 custom-scrollbar">
              {examenesCarrito.length === 0 ? (
                <p className="text-sm text-sky-300/70 text-center italic mt-10">Aún no hay exámenes añadidos.</p>
              ) : (
                examenesCarrito.map(ex => (
                    <div key={ex.id ?? (ex as any).Id} className="flex justify-between items-center text-sm bg-sky-800/80 p-3 rounded-lg border border-sky-700/50">
                      <span className="truncate pr-2 font-medium">{ex.nombreExamen ?? (ex as any).NombreExamen}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-400">${ex.costoEnDivisa ?? (ex as any).CostoEnDivisa}</span>
                        <button onClick={() => quitarDelCarrito(ex.id ?? (ex as any).Id)} className="text-sky-300 hover:text-rose-400 text-xs bg-sky-900 p-1 rounded">✕</button>
                      </div>
                    </div>
                ))
              )}
            </div>

            <div className="border-t border-sky-700 pt-4 space-y-3 mb-5">
              <div className="flex justify-between text-sm text-sky-100 font-medium">
                <span>Subtotal USD:</span><span className="font-bold">${totalDivisa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-sky-300 font-medium">
                <span>Equivalente VES:</span><span>Bs. {totalBolivares.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-sky-950 p-4 rounded-xl border border-sky-800 space-y-3 shadow-inner">
               <div className="flex justify-between text-sm text-sky-200 font-medium">
                <span>Total Abonado:</span>
                <span className="text-emerald-400 font-bold">${totalPagadoUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-lg pt-3 border-t border-sky-800/80">
                <span className="text-white">Saldo Pendiente:</span>
                <div className="text-right leading-tight">
                    <span className={saldoRestanteUSD <= 0 ? 'text-emerald-400 block' : 'text-rose-400 block'}>${saldoRestanteUSD.toFixed(2)}</span>
                    {saldoRestanteUSD > 0 && <span className="text-[10px] text-sky-400 block uppercase font-bold tracking-wider">Bs. {(saldoRestanteUSD * tasaBcv).toFixed(2)}</span>}
                </div>
              </div>
            </div>

            <div className="w-full mt-6">
              <button 
                onClick={procesarOrdenFinal}
                disabled={examenesCarrito.length === 0 || !pacienteSeleccionado || !puedeCrearOrden}
                className={`w-full font-bold py-3.5 rounded-xl shadow-lg text-white text-sm uppercase tracking-wide ${(!puedeCrearOrden || examenesCarrito.length === 0 || !pacienteSeleccionado ) ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-400'}`}
              >
                {saldoRestanteUSD === totalDivisa ? 'Guardar como Pendiente' : saldoRestanteUSD > 0 ? 'Procesar con Pago Parcial' : 'Procesar y Guardar Orden'}
              </button>
            </div>
            
          </div>
        </div>

      </div>

      <ModalPaciente isOpen={modalPacienteAbierto} onClose={() => setModalPacienteAbierto(false)} onGuardar={manejarGuardarPacienteInline} pacienteExistente={null}/>
    </div>
  );
}