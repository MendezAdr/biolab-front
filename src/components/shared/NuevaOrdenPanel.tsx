import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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

// 1. IMPORTAMOS EL CONTEXTO GLOBAL DE SEGURIDAD
import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

export function NuevaOrdenPanel() {
  // 2. EXTRAEMOS EL USUARIO Y LA FUNCIÓN COMPROBADORA
  const { usuario, tienePermiso } = useAuth();
  
  // Usamos el ID real del usuario, o 1 como fallback de seguridad
  const currentUserId = usuario?.id || 1; 

  // ==========================================
  // EVALUACIÓN DE PRIVILEGIOS
  // ==========================================
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
    cargarDatosMaestros();
  }, []);

  const pacientesSugeridos = useMemo(() => {
    if (!busquedaCedula || busquedaCedula.length < 3) return [];
    return pacientesBD.filter(p => {
      const cedulaSegura = String(p.Cedula || p.Cedula || '').toLowerCase();
      return cedulaSegura.includes(busquedaCedula.toLowerCase());
    });
  }, [busquedaCedula, pacientesBD]);

  const examenesFiltrados = useMemo(() => {
    if (!busquedaExamen) return examenesBD;
    const busquedaLower = busquedaExamen.toLowerCase();
    return examenesBD.filter(e => {
      const nombreSeguro = String(e.NombreExamen || '').toLowerCase();
      return nombreSeguro.includes(busquedaLower);
    });
  }, [busquedaExamen, examenesBD]);

  const totalDivisa = examenesCarrito.reduce((acc, ex) => acc + (ex.CostoEnDivisa || 0), 0);
  const totalBolivares = totalDivisa * tasaBcv;
  
  const totalPagado = pagosAgregados.reduce((acc, pago) => acc + pago.Monto, 0);
  const saldoRestante = totalDivisa - totalPagado;

  useEffect(() => {
    if (saldoRestante > 0) {
      setMontoPagoInput(saldoRestante.toFixed(2));
    } else {
      setMontoPagoInput('');
    }
  }, [saldoRestante]);

  const agregarAlCarrito = (examen: Examen) => {
    if (!examenesCarrito.find(e => e.Id === examen.Id)) {
      setExamenesCarrito([...examenesCarrito, examen]);
    }
  };

  const quitarDelCarrito = (idExamen: number) => {
    setExamenesCarrito(examenesCarrito.filter(e => e.Id !== idExamen));
    setPagosAgregados([]); 
  };

  const manejarGuardarPacienteInline = async (nuevoPaciente: PacienteCreateDTO) => {
    try {
      const pacienteGuardado = await pacienteService.create(nuevoPaciente, currentUserId);
      await cargarDatosMaestros();
      setPacienteSeleccionado(pacienteGuardado);
      const cedulaSeguraParaElEstado = String(pacienteGuardado.Cedula || pacienteGuardado.cedula || nuevoPaciente.Cedula || '');
      setBusquedaCedula(cedulaSeguraParaElEstado);
      setModalPacienteAbierto(false);
    } catch (err) {
      alert("Error al registrar el paciente.");
    }
  };

  const agregarPago = () => {
    const montoNum = Number(montoPagoInput);
    if (!montoNum || montoNum <= 0) return;

    const requiereReferencia = [2, 3, 6].includes(metodoPagoSeleccionado);
    if (requiereReferencia && !referenciaPagoInput.trim()) {
      alert("Este método de pago exige que ingrese un número de referencia.");
      return;
    }

    setPagosAgregados([...pagosAgregados, {
      Monto: montoNum,
      Metodo: metodoPagoSeleccionado,
      Referencia: referenciaPagoInput
    }]);

    setReferenciaPagoInput('');
  };

  const quitarPago = (index: number) => {
    setPagosAgregados(pagosAgregados.filter((_, i) => i !== index));
  };

  const procesarOrdenFinal = async () => {
    if (!pacienteSeleccionado || examenesCarrito.length === 0) {
      alert("Faltan datos en la orden.");
      return;
    }
    //if (saldoRestante > 0) {
    //  alert(`Aún hay un saldo pendiente de $${saldoRestante.toFixed(2)}. Complete el pago para procesar la orden.`);
    //  return;
    // }

    const nuevaOrden: OrdenCreateDTO = {
      NumeroFactura: `ORD-${Date.now()}`, 
      PacienteId: pacienteSeleccionado.Id,
      TotalDivisa: totalDivisa,
      TasaBCV: tasaBcv,
      Fecha: new Date(),
      Detalles: examenesCarrito.map(ex => ({ ExamenId: ex.Id, PrecioMomentoDivisa: ex.CostoEnDivisa })),
      Pagos: pagosAgregados 
    };

    try {
      await ordenesService.create(nuevaOrden, currentUserId);
      alert("¡Orden registrada exitosamente!");
      setPacienteSeleccionado(null);
      setBusquedaCedula('');
      setExamenesCarrito([]);
      setPagosAgregados([]);
    } catch (err) {
      alert("Error crítico al procesar la orden.");
    }
  };

  if (cargandoGlobal) return <div className="p-10 text-center animate-pulse text-slate-500">Inicializando sistema de facturación...</div>;
  if (errorGlobal) return <div className="p-10 text-center text-red-600">{errorGlobal}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Nueva Orden de Laboratorio</h2>
          <p className="text-sm text-slate-500">Operador actual: <span className="font-semibold text-emerald-700">{usuario?.nombre || 'Desconocido'}</span></p>
        </div>
        <div className="bg-sky-50 border border-sky-100 text-sky-800 px-4 py-2 rounded-lg text-sm font-bold flex flex-col items-end">
          <span>Tasa BCV del Día</span>
          <span className="text-lg">Bs. {tasaBcv.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">1. Identificación del Paciente</h3>
            {pacienteSeleccionado ? (
              // ... el cuadro verde del paciente seleccionado se queda igual ...
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-bold text-emerald-800">{pacienteSeleccionado.Nombre} {pacienteSeleccionado.Apellido}</p>
                  <p className="text-xs text-emerald-700">C.I: {pacienteSeleccionado.Cedula}</p>
                </div>
                <button onClick={() => setPacienteSeleccionado(null)} className="text-xs text-rose-500 hover:underline">
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
                  // Clases dinámicas: Si requiere atención, el borde se hace más grueso y rojo
                  className={`w-full rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none transition-all duration-300 ${
                    requiereAtencionPaciente 
                      ? 'border-2 border-rose-400 bg-rose-50 placeholder-rose-300 focus:border-rose-500' 
                      : 'border border-slate-300 bg-white focus:border-emerald-500'
                  }`}
                />
                {/* Texto de ayuda no invasivo que aparece suavemente */}
                {requiereAtencionPaciente && (
                  <p className="text-xs text-rose-500 mt-2 font-medium animate-pulse">
                    * Requerido para poder procesar la orden con los exámenes actuales.
                  </p>
                )}
                {busquedaCedula.length >= 3 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    {pacientesSugeridos.length > 0 ? (
                      pacientesSugeridos.map((p, index) => {
                        const idSeguro = p.Id || index;
                        return (
                          <div key={idSeguro} onClick={() => setPacienteSeleccionado(p)} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0">
                            <span className="font-semibold text-sm">{p.Cedula}</span> - <span className="text-sm text-slate-600">{p.Nombre} {p.Apellido}</span>
                          </div>
                        );
                      })
                    ) :(
                      <div className="p-4 text-center">
                        <p className="text-sm text-slate-500 mb-3">No hay pacientes con esa cédula.</p>
                        {/* BOTÓN PROTEGIDO 1: Registrar Paciente */}
                        <div className="inline-block" title={!puedeCrearPaciente ? "Tu rol no tiene permiso para registrar pacientes nuevos." : ""}>
                          <button 
                            onClick={() => setModalPacienteAbierto(true)} 
                            disabled={!puedeCrearPaciente}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!puedeCrearPaciente ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
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

          <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-opacity ${!seccionExamenesHabilitada ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">2. Selección de Exámenes</h3>
            <input type="text" placeholder="🔍 Buscar examen (ej. Hematología)..." value={busquedaExamen} onChange={(e) => setBusquedaExamen(e.target.value)} className="w-full border border-slate-300 text-slate-700 rounded-lg px-4 py-2 text-sm mb-4 bg-slate-50" />
            <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-lg">
              {examenesFiltrados.map(examen => {
                // Comprobamos en tiempo real si este examen ya existe en el carrito
                const estaEnCarrito = examenesCarrito.some(e => e.Id === examen.Id);
                
                return (
                  <div key={examen.Id} className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{examen.NombreExamen}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-emerald-600">${examen.CostoEnDivisa}</span>
                      
                      {/* Botón dinámico: Cambia de estilo y se desactiva si ya fue agregado */}
                      <button 
                        onClick={() => agregarAlCarrito(examen)} 
                        disabled={estaEnCarrito}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                          estaEnCarrito 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'text-white bg-slate-800 hover:bg-slate-700'
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

          <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-opacity ${examenesCarrito.length === 0 ? 'opacity-50 pointer-events-none hidden' : ''}`}>
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">3. Distribución de Pagos</h3>
            
            <div className="flex gap-3 items-end mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Método</label>
                <select value={metodoPagoSeleccionado} onChange={(e) => setMetodoPagoSeleccionado(Number(e.target.value))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white">
                  {PagoMetodo.map(m => <option key={m.id} value={m.id}>{m.metodo}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Monto (USD)</label>
                <input type="number" step="0.01" value={montoPagoInput} onChange={(e) => setMontoPagoInput(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white" placeholder="0.00" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Ref. (Opcional)</label>
                <input type="text" value={referenciaPagoInput} onChange={(e) => setReferenciaPagoInput(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white" placeholder="N/A" />
              </div>
              
              {/* BOTÓN PROTEGIDO 2: Añadir Pago */}
              <div className="inline-block" title={!puedeRegistrarPagos ? "Tu rol no tiene permiso para procesar pagos ni manejar caja." : ""}>
                <button 
                  onClick={agregarPago} 
                  disabled={saldoRestante <= 0 || !puedeRegistrarPagos} 
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors h-[38px] ${(!puedeRegistrarPagos || saldoRestante <= 0) ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700 text-white'}`}
                >
                  Añadir Pago
                </button>
              </div>
            </div>

            {pagosAgregados.length > 0 && (
              <div className="space-y-2">
                {pagosAgregados.map((p, index) => {
                  const nombreMetodo = PagoMetodo.find(m => m.id === p.Metodo)?.metodo || 'Desconocido';
                  return (
                    <div key={index} className="flex justify-between items-center bg-white border border-slate-200 p-2 rounded-lg text-sm">
                      <div>
                        <span className="font-semibold text-slate-700">{nombreMetodo}</span>
                        {p.Referencia && <span className="text-slate-400 ml-2">(Ref: {p.Referencia})</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sky-700">${p.Monto.toFixed(2)}</span>
                        <button onClick={() => quitarPago(index)} className="text-rose-500 hover:text-rose-700 font-bold">✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-800 text-white p-5 rounded-xl shadow-lg sticky top-6">
            <h3 className="font-bold text-lg mb-4 border-b border-slate-600 pb-2">Resumen de la Orden</h3>
            
            <div className="min-h-[150px] max-h-[300px] overflow-y-auto mb-4 space-y-2 pr-2">
              {examenesCarrito.length === 0 ? (
                <p className="text-sm text-slate-400 text-center italic mt-10">Aún no hay exámenes añadidos.</p>
              ) : (
                examenesCarrito.map(ex => (
                  <div key={ex.Id} className="flex justify-between text-sm bg-slate-700 p-2 rounded">
                    <span className="truncate pr-2">{ex.NombreExamen}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400">${ex.CostoEnDivisa}</span>
                      <button onClick={() => quitarDelCarrito(ex.Id)} className="text-rose-400 hover:text-rose-300 font-bold">✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-600 pt-4 space-y-2 mb-4">
              <div className="flex justify-between text-sm text-slate-300">
                <span>Subtotal USD:</span>
                <span>${totalDivisa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-sky-300">
                <span>Equivalente VES:</span>
                <span>Bs. {totalBolivares.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 space-y-2">
               <div className="flex justify-between text-sm text-slate-300">
                <span>Total Abonado:</span>
                <span className="text-sky-400">${totalPagado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-700">
                <span>Saldo Pendiente:</span>
                <span className={saldoRestante <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  ${saldoRestante.toFixed(2)}
                </span>
              </div>
            </div>

            {/* BOTÓN PROTEGIDO 3: Crear Orden Final */}
            <div className="w-full mt-6" title={!puedeCrearOrden ? "No tienes permisos para emitir órdenes oficiales en el sistema." : ""}>
              <button 
                onClick={procesarOrdenFinal}
                disabled={examenesCarrito.length === 0 || !pacienteSeleccionado || !puedeCrearOrden}
                className={`w-full font-bold py-3 rounded-lg transition-colors text-white ${(!puedeCrearOrden || examenesCarrito.length === 0 || !pacienteSeleccionado ) ? 'bg-slate-600 cursor-not-allowed text-slate-400' : 'bg-emerald-500 hover:bg-emerald-400'}`}
              >{/* TEXTO DINÁMICO SEGÚN LA DEUDA */}
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