import React, { useState, useEffect, useMemo } from 'react';
import { pacienteService } from '../../services/pacienteService';
import { examenesService } from '../../services/examenesService';
import { tasaService } from '../../services/tasaService';
import { ordenesService } from '../../services/ordenesService';
import { ModalPaciente } from './ModalPaciente';
import type { OrdenCreateDTO } from '../../types/DTOs/OrdenCreateDTO';
import type { PacienteCreateDTO } from '../../types/DTOs/PacienteCreateDTO';
import type { PagoOrdenCreateDTO } from '../../types/DTOs/PagoOrdenCreateDTO';
import { PagoMetodo } from '../../types/PagoModel'; 
import type { Examen } from '../../types/ExamenModel'; // <-- IMPORTAMOS EL MODELO DE EXAMEN
import type { Paciente } from '../../types/PacienteModel';
import { useLocation } from 'react-router-dom';
// import type { Paciente } from '../../types/PacienteModel'; // <-- IMPORTA TU MODELO DE PACIENTE AQUÍ

export function NuevaOrdenPanel() {
  
  const currentUserId = 1; 
  const [tasaBcv, setTasaBcv] = useState<number>(0);

  //para presupuestos 
  const location = useLocation();
  const examenesDesdePresupuesto = location.state?.examenesPreCargados || [];
  
  // ==========================================
  // 1. ESTADOS DE DATOS EN MEMORIA (Tipados estrictamente)
  // ==========================================
  
  // CAMBIO: Reemplazamos any[] por los tipos reales
  const [pacientesBD, setPacientesBD] = useState<Paciente[]>([]); // Cambia 'any' por 'Paciente' cuando lo importes
  const [examenesBD, setExamenesBD] = useState<Examen[]>([]); 
  
  const [cargandoGlobal, setCargandoGlobal] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  

  // ==========================================
  // 2. ESTADOS DEL FLUJO DE TRABAJO (Wizard)
  // ==========================================
  
  const [busquedaCedula, setBusquedaCedula] = useState<string>(''); // Forzamos a que siempre sea string
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null); // Cambia 'any' por 'Paciente'
  const [modalPacienteAbierto, setModalPacienteAbierto] = useState(false);

  const [busquedaExamen, setBusquedaExamen] = useState('');
  const [examenesCarrito, setExamenesCarrito] = useState<Examen[]>(examenesDesdePresupuesto); // Tipado con Examen

  const [pagosAgregados, setPagosAgregados] = useState<PagoOrdenCreateDTO[]>([]);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<number>(1);
  const [montoPagoInput, setMontoPagoInput] = useState<string>('');
  const [referenciaPagoInput, setReferenciaPagoInput] = useState<string>('');

  // ==========================================
  // 3. EFECTO DE CARGA INICIAL
  // ==========================================
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

  // ==========================================
  // 4. LÓGICA Y CÁLCULOS EN MEMORIA
  // ==========================================
  
  const pacientesSugeridos = useMemo(() => {
    // RED DE SEGURIDAD: Si busquedaCedula es undefined o null por alguna razón, retornamos vacío antes de evaluar .length
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
      // Uso de NombreExamen según el ExamenModel
      const nombreSeguro = String(e.NombreExamen || '').toLowerCase();
      return nombreSeguro.includes(busquedaLower);
    });
  }, [busquedaExamen, examenesBD]);

  // Cálculos de Totales (CostoEnDivisa según ExamenModel)
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

  // ==========================================
  // 5. MANEJADORES DE EVENTOS
  // ==========================================

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
      
      // EL ARREGLO CRUCIAL: Verificamos si viene en PascalCase o camelCase, o usamos la que enviamos. 
      // Lo convertimos a String explícitamente para evitar que `busquedaCedula` se corrompa.
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

    if (saldoRestante > 0) {
      alert(`Aún hay un saldo pendiente de $${saldoRestante.toFixed(2)}. Complete el pago para procesar la orden.`);
      return;
    }

    const nuevaOrden: OrdenCreateDTO = {
      NumeroFactura: `ORD-${Date.now()}`, 
      PacienteId: pacienteSeleccionado.Id,
      TotalDivisa: totalDivisa,
      TasaBCV: tasaBcv,
      Fecha: new Date(),
      Detalles: examenesCarrito.map(ex => ({
        ExamenId: ex.Id,
        PrecioMomentoDivisa: ex.CostoEnDivisa 
      })),
      // Inyectamos el arreglo de pagos construido
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

  // ==========================================
  // 6. RENDERIZADO VISUAL
  // ==========================================

  if (cargandoGlobal) return <div className="p-10 text-center animate-pulse text-slate-500">Inicializando sistema de facturación...</div>;
  if (errorGlobal) return <div className="p-10 text-center text-red-600">{errorGlobal}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Cabecera */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Nueva Orden de Laboratorio</h2>
          <p className="text-sm text-slate-500">Facturación bimodal en tiempo real</p>
        </div>
        <div className="bg-sky-50 border border-sky-100 text-sky-800 px-4 py-2 rounded-lg text-sm font-bold flex flex-col items-end">
          <span>Tasa BCV del Día</span>
          <span className="text-lg">Bs. {tasaBcv.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Área de Trabajo (Pasos 1, 2 y 3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PASO 1: PACIENTE */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">1. Identificación del Paciente</h3>
            {pacienteSeleccionado ? (
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-bold text-emerald-800">{pacienteSeleccionado.Nombre} {pacienteSeleccionado.Apellido}</p>
                  <p className="text-xs text-emerald-600">C.I: {pacienteSeleccionado.Cedula}</p>
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
                  className="w-full border border-slate-300  text-slate-700 rounded-lg px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                />
                {busquedaCedula.length >= 3 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    {pacientesSugeridos.length > 0 ? (
                      pacientesSugeridos.map((p, index) => {
                        // Acceso dinámico a las propiedades
                        const idSeguro = p.Id || p.Id || index;
                        const cedulaSegura = p.Cedula || p.Cedula;
                        const nombreSeguro = p.Nombre || p.Nombre;
                        const apellidoSeguro = p.Apellido || p.Apellido;

                        return (
                          <div 
                            key={idSeguro} // <-- Esto elimina la advertencia de React
                            onClick={() => setPacienteSeleccionado(p)} 
                            className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                          >
                            <span className="font-semibold text-sm">{cedulaSegura}</span> - <span className="text-sm text-slate-600">{nombreSeguro} {apellidoSeguro}</span>
                          </div>
                        );
                      })
                    ) :(
                      <div className="p-4 text-center">
                        <p className="text-sm text-slate-500 mb-3">No hay pacientes con esa cédula.</p>
                        <button onClick={() => setModalPacienteAbierto(true)} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-lg text-sm font-medium">
                          + Registrar Nuevo Paciente
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PASO 2: EXÁMENES */}
          <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-opacity ${!pacienteSeleccionado ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">2. Selección de Exámenes</h3>
            <input 
              type="text" 
              placeholder="🔍 Buscar examen (ej. Hematología)..."
              value={busquedaExamen}
              onChange={(e) => setBusquedaExamen(e.target.value)}
              className="w-full border border-slate-300 text-slate-700 rounded-lg px-4 py-2 text-sm mb-4 bg-slate-50"
            />
            <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-lg">
              {examenesFiltrados.map(examen => (
                <div key={examen.Id} className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{examen.NombreExamen}</p>
                    <p className="text-xs text-slate-500">Ref: {examen.Descripcion?.substring(0,30)}...</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-emerald-600">${examen.CostoEnDivisa}</span>
                    <button onClick={() => agregarAlCarrito(examen)} className="text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs font-bold transition-colors">
                      Añadir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PASO 3: REGISTRO DE PAGOS (Se habilita cuando hay un monto a pagar) */}
          <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-opacity ${examenesCarrito.length === 0 ? 'opacity-50 pointer-events-none hidden' : ''}`}>
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">3. Distribución de Pagos</h3>
            
            <div className="flex gap-3 items-end mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Método</label>
                <select value={metodoPagoSeleccionado} onChange={(e) => setMetodoPagoSeleccionado(Number(e.target.value))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white">
                  {PagoMetodo.map(m => (
                    <option key={m.id} value={m.id}>{m.metodo}</option>
                  ))}
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
              <button onClick={agregarPago} disabled={saldoRestante <= 0} className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors h-[38px]">
                Añadir Pago
              </button>
            </div>

            {/* Lista de pagos inyectados */}
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

        {/* COLUMNA DERECHA: Carrito y Totalización */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 text-white p-5 rounded-xl shadow-lg sticky top-6">
            <h3 className="font-bold text-lg mb-4 border-b border-slate-600 pb-2">Resumen de la Orden</h3>
            
            {/* Lista de exámenes en carrito */}
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

            {/* Subtotales */}
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

            {/* Calculadora de Pagos */}
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

            {/* Botón Final */}
            <button 
              onClick={procesarOrdenFinal}
              disabled={examenesCarrito.length === 0 || !pacienteSeleccionado || saldoRestante > 0}
              className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
            >
              {saldoRestante > 0 ? 'Complete el Pago para Guardar' : 'Procesar y Guardar Orden'}
            </button>
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