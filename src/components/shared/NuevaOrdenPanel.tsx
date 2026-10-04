import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 
import { pacienteService } from '../../services/pacienteService';
import { examenesService } from '../../services/examenesService';
import { tasaService } from '../../services/tasaService';
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
  const { usuario, tienePermiso } = useAuth();
  const currentUserId = usuario?.id || 1; 

  const puedeCrearPaciente = tienePermiso(PERMISOS.MODIFICAR_PACIENTES);
  const puedeRegistrarPagos = tienePermiso(PERMISOS.GESTIONAR_PAGOS);
  const puedeCrearOrden = tienePermiso(PERMISOS.CREAR_ORDENES_Y_DETALLES);

  const [tasaBcv, setTasaBcv] = useState<number>(0);
  const location = useLocation();
  const examenesDesdePresupuesto = location.state?.examenesPreCargados || [];
  
  const [pacientesBD, setPacientesBD] = useState<Paciente[]>([]); 
  const [examenesBD, setExamenesBD] = useState<Examen[]>([]); 
  
  const [cargandoGlobal, setCargandoGlobal] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  
  const [busquedaCedula, setBusquedaCedula] = useState<string>(''); 
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null); 
  const [modalPacienteAbierto, setModalPacienteAbierto] = useState(false);

  const [busquedaExamen, setBusquedaExamen] = useState('');
  const [examenesCarrito, setExamenesCarrito] = useState<Examen[]>(examenesDesdePresupuesto); 

  const [pagosAgregados, setPagosAgregados] = useState<PagoOrdenCreateDTO[]>([]);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<number>(1);
  const [montoPagoInput, setMontoPagoInput] = useState<string>('');
  const [referenciaPagoInput, setReferenciaPagoInput] = useState<string>('');

  const seccionExamenesHabilitada = pacienteSeleccionado !== null || examenesCarrito.length > 0;
  const requiereAtencionPaciente = examenesCarrito.length > 0 && !pacienteSeleccionado;

  const cargarDatosMaestros = async () => {
    try {
      setCargandoGlobal(true);
      const [pacientesRes, examenesRes, tasaRes] = await Promise.all([
        pacienteService.getAll(),
        examenesService.getAll(),
        tasaService.getTasaActual()
      ]);
      setPacientesBD(pacientesRes || []);
      setExamenesBD(examenesRes || []);
      setTasaBcv(tasaRes || 0);
    } catch (err) {
      setErrorGlobal("Fallo al inicializar el módulo de órdenes.");
    } finally {
      setCargandoGlobal(false);
    }
  };

  useEffect(() => {
    if (puedeCrearOrden) {
      cargarDatosMaestros();
    } else {
      setCargandoGlobal(false);
    }
  }, [puedeCrearOrden]);

  const pacientesSugeridos = useMemo(() => {
    if (!busquedaCedula || busquedaCedula.length < 3) return [];
    return pacientesBD.filter(p => {
      const cedulaSegura = String(p.cedula ?? (p as any).Cedula ?? '').toLowerCase();
      return cedulaSegura.includes(busquedaCedula.toLowerCase());
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

  const totalDivisa = examenesCarrito.reduce((acc, ex) => acc + (ex.costoEnDivisa ?? (ex as any).CostoEnDivisa ?? 0), 0);
  const totalBolivares = totalDivisa * tasaBcv;
  
  const totalPagado = pagosAgregados.reduce((acc, pago) => acc + pago.monto, 0);
  const saldoRestante = totalDivisa - totalPagado;

  useEffect(() => {
    if (saldoRestante > 0) {
      setMontoPagoInput(saldoRestante.toFixed(2));
    } else {
      setMontoPagoInput('');
    }
  }, [saldoRestante]);

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
        const pacienteGuardado = await pacienteService.create(nuevoPaciente, currentUserId);
        await cargarDatosMaestros();
        setPacienteSeleccionado(pacienteGuardado);
        const cedulaSegura = String(pacienteGuardado.cedula ?? pacienteGuardado.Cedula ?? nuevoPaciente.cedula ?? '');
        setBusquedaCedula(cedulaSegura);
        setModalPacienteAbierto(false);
      })(),
      {
        loading: 'Registrando paciente...',
        success: 'Paciente registrado correctamente.',
        error: (err) => err.message || 'Error al registrar el paciente.'
      }
    );
  };

  const agregarPago = () => {
    const montoNum = Number(montoPagoInput);

    if (!montoNum || montoNum <= 0) {
      toast.error("El monto del pago debe ser mayor a cero.");
      return;
    }

    if (montoNum > saldoRestante) {
      toast.error(`No puedes registrar un pago superior al saldo pendiente ($${saldoRestante.toFixed(2)}).`);
      setMontoPagoInput(saldoRestante.toFixed(2));
      return;
    }

    const requiereReferencia = [2, 3, 6].includes(metodoPagoSeleccionado);
    if (requiereReferencia && !referenciaPagoInput.trim()) {
      toast.error("Este método de pago exige que ingrese un número de referencia.");
      return;
    }

    setPagosAgregados([...pagosAgregados, {
      monto: montoNum,
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
      pagos: pagosAgregados 
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
        error: (err) => err.message || 'Error crítico al procesar la orden.'
      }
    );
  };

  if (!puedeCrearOrden) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-sky-100 rounded-xl shadow-sm mx-auto max-w-2xl mt-12 text-center">
        <span className="text-6xl mb-4 opacity-80">🔒</span>
        <h2 className="text-xl font-bold text-sky-900 mb-2">Acceso Restringido</h2>
        <p className="text-slate-500">
          Tu nivel de acceso actual no te permite facturar ni emitir nuevas órdenes en el sistema.
        </p>
      </div>
    );
  }

  if (cargandoGlobal) return <div className="p-10 text-center animate-pulse text-sky-600 font-medium">Inicializando sistema de facturación...</div>;
  if (errorGlobal) return <div className="p-10 text-center text-rose-600">{errorGlobal}</div>;

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
                  className={`w-full rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none transition-all duration-300 ${
                    requiereAtencionPaciente 
                      ? 'border-2 border-rose-400 bg-rose-50 placeholder-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
                      : 'border border-slate-300 bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                  }`}
                />
                {requiereAtencionPaciente && (
                  <p className="text-xs text-rose-500 mt-2 font-medium animate-pulse">
                    * Requerido para poder procesar la orden con los exámenes actuales.
                  </p>
                )}
                {busquedaCedula.length >= 3 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-sky-100 rounded-lg shadow-xl overflow-hidden">
                    {pacientesSugeridos.length > 0 ? (
                      pacientesSugeridos.map((p, index) => {
                        const idSeguro = p.id ?? (p as any).Id ?? index;
                        const cedula = p.cedula ?? (p as any).Cedula;
                        const nombre = p.nombre ?? (p as any).Nombre;
                        const apellido = p.apellido ?? (p as any).Apellido;
                        return (
                          <div key={idSeguro} onClick={() => setPacienteSeleccionado(p)} className="p-3 hover:bg-sky-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors">
                            <span className="font-semibold text-sm text-sky-700">{cedula}</span> <span className="text-slate-400 mx-1">-</span> <span className="text-sm text-slate-600 font-medium">{nombre} {apellido}</span>
                          </div>
                        );
                      })
                    ) :(
                      <div className="p-5 text-center bg-slate-50">
                        <p className="text-sm text-slate-500 mb-3">No hay pacientes registrados con esa cédula.</p>
                        <div className="inline-block" title={!puedeCrearPaciente ? "Tu rol no tiene permiso para registrar pacientes nuevos." : ""}>
                          <button 
                            onClick={() => setModalPacienteAbierto(true)} 
                            disabled={!puedeCrearPaciente}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm ${!puedeCrearPaciente ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'}`}
                          >
                            + Registrar Nuevo Paciente
                          </button>
                        </div>
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
              <input type="text" placeholder="Buscar examen (ej. Hematología)..." value={busquedaExamen} onChange={(e) => setBusquedaExamen(e.target.value)} className="w-full border border-slate-300 text-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow" />
              <span className="absolute left-3 top-2.5 text-slate-400 text-lg">🔍</span>
            </div>
            <div className="max-h-64 overflow-y-auto border border-sky-50 rounded-lg custom-scrollbar">
              {examenesFiltrados.map(examen => {
                const exId = examen.id ?? (examen as any).Id;
                const nombreExamen = examen.nombreExamen ?? (examen as any).NombreExamen;
                const costo = examen.costoEnDivisa ?? (examen as any).CostoEnDivisa;
                const estaEnCarrito = examenesCarrito.some(e => (e.id ?? (e as any).Id) === exId);
                
                return (
                  <div key={exId} className="flex justify-between items-center p-3 hover:bg-sky-50 border-b border-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{nombreExamen}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-emerald-600">${costo}</span>
                      
                      <button 
                        onClick={() => agregarAlCarrito(examen)} 
                        disabled={estaEnCarrito}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                          estaEnCarrito 
                            ? 'bg-sky-100 text-sky-500 cursor-not-allowed border border-sky-200' 
                            : 'text-white bg-sky-500 hover:bg-sky-600 hover:shadow-md'
                        }`}
                      >
                        {estaEnCarrito ? 'Añadido ✔️' : 'Añadir'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`bg-white p-5 rounded-xl border border-sky-100 shadow-sm transition-opacity ${examenesCarrito.length === 0 ? 'opacity-50 pointer-events-none hidden' : ''}`}>
            <h3 className="font-bold text-sky-900 mb-4 border-b border-sky-50 pb-2">3. Distribución de Pagos</h3>
            
            <div className="flex gap-3 items-end mb-4 bg-sky-50/50 p-4 rounded-lg border border-sky-100">
              <div className="flex-1">
                <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1">Método</label>
                <select value={metodoPagoSeleccionado} onChange={(e) => setMetodoPagoSeleccionado(Number(e.target.value))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow">
                  {PagoMetodo.map(m => <option key={m.id} value={m.id}>{m.metodo}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1">Monto (USD)</label>
                <input type="number" step="0.01" value={montoPagoInput} onChange={(e) => setMontoPagoInput(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow" placeholder="0.00" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1">Ref. (Opcional)</label>
                <input type="text" value={referenciaPagoInput} onChange={(e) => setReferenciaPagoInput(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow" placeholder="N/A" />
              </div>
              
              <div className="inline-block" title={!puedeRegistrarPagos ? "Tu rol no tiene permiso para procesar pagos ni manejar caja." : ""}>
                <button 
                  onClick={agregarPago} 
                  disabled={saldoRestante <= 0 || !puedeRegistrarPagos} 
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all h-[38px] shadow-sm ${(!puedeRegistrarPagos || saldoRestante <= 0) ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600 text-white hover:shadow-md'}`}
                >
                  Añadir Pago
                </button>
              </div>
            </div>

            {pagosAgregados.length > 0 && (
              <div className="space-y-2">
                {pagosAgregados.map((p, index) => {
                  const nombreMetodo = PagoMetodo.find(m => m.id === p.metodo)?.metodo || 'Desconocido';
                  return (
                    <div key={index} className="flex justify-between items-center bg-white border border-sky-100 shadow-sm p-3 rounded-lg text-sm">
                      <div>
                        <span className="font-bold text-sky-900">{nombreMetodo}</span>
                        {p.referencia && <span className="text-slate-400 ml-2 font-medium">(Ref: {p.referencia})</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-emerald-600">${p.monto.toFixed(2)}</span>
                        <button onClick={() => quitarPago(index)} className="text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-md transition-colors font-bold flex items-center justify-center">✕</button>
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
            <h3 className="font-bold text-lg mb-4 border-b border-sky-700 pb-3 flex items-center">
              <span className="mr-2">📄</span> Resumen de la Orden
            </h3>
            
            <div className="min-h-[150px] max-h-[300px] overflow-y-auto mb-5 space-y-2.5 pr-2 custom-scrollbar">
              {examenesCarrito.length === 0 ? (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-sm text-sky-300/70 text-center italic">Aún no hay exámenes añadidos.</p>
                </div>
              ) : (
                examenesCarrito.map(ex => {
                  const exId = ex.id ?? (ex as any).Id;
                  const nombreExamen = ex.nombreExamen ?? (ex as any).NombreExamen;
                  const costo = ex.costoEnDivisa ?? (ex as any).CostoEnDivisa;
                  return (
                    <div key={exId} className="flex justify-between items-center text-sm bg-sky-800/80 p-3 rounded-lg border border-sky-700/50">
                      <span className="truncate pr-2 font-medium">{nombreExamen}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-400">${costo}</span>
                        <button onClick={() => quitarDelCarrito(exId)} className="text-sky-300 hover:text-rose-400 transition-colors font-bold text-xs bg-sky-900 p-1 rounded">✕</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-sky-700 pt-4 space-y-3 mb-5">
              <div className="flex justify-between text-sm text-sky-100 font-medium">
                <span>Subtotal USD:</span>
                <span className="font-bold">${totalDivisa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-sky-300 font-medium">
                <span>Equivalente VES:</span>
                <span>Bs. {totalBolivares.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-sky-950 p-4 rounded-xl border border-sky-800 space-y-3 shadow-inner">
               <div className="flex justify-between text-sm text-sky-200 font-medium">
                <span>Total Abonado:</span>
                <span className="text-emerald-400 font-bold">${totalPagado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-lg pt-3 border-t border-sky-800/80">
                <span className="text-white">Saldo Pendiente:</span>
                <span className={saldoRestante <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  ${saldoRestante.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="w-full mt-6" title={!puedeCrearOrden ? "No tienes permisos para emitir órdenes oficiales en el sistema." : ""}>
              <button 
                onClick={procesarOrdenFinal}
                disabled={examenesCarrito.length === 0 || !pacienteSeleccionado || !puedeCrearOrden}
                className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-lg text-white text-sm uppercase tracking-wide ${(!puedeCrearOrden || examenesCarrito.length === 0 || !pacienteSeleccionado ) ? 'bg-slate-700/50 border border-slate-600 cursor-not-allowed text-slate-400 shadow-none' : 'bg-sky-500 hover:bg-sky-400 border border-sky-400 hover:-translate-y-0.5'}`}
              >
                {saldoRestante === totalDivisa 
                  ? 'Guardar como Pendiente' 
                  : saldoRestante > 0 
                    ? 'Procesar con Pago Parcial' 
                    : 'Procesar y Guardar Orden'}
              </button>
            </div>
            
          </div>
        </div>

      </div>

      <ModalPaciente 
        isOpen={modalPacienteAbierto} 
        onClose={() => setModalPacienteAbierto(false)} 
        onGuardar={manejarGuardarPacienteInline}
        pacienteExistente={null}
      />
    </div>
  );
}