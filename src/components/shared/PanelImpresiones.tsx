import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 
import { ordenesService } from '../../services/ordenesService';
import { pacienteService } from '../../services/pacienteService';
import { impresionesService, type ReporteCaja, type ReportePacientes, type ReporteMorosos } from '../../services/ImpresionesService';
import { PDFViewer, PDFDownloadLink, Document, Page } from '@react-pdf/renderer';

import { ReporteCajaPDF } from '../pdf/ReporteCajaPDF';
import { ReporteMorososPDF } from '../pdf/ReporteMorososPDF';
import { PresupuestoPDF } from '../pdf/PresupuestoPDF';
import { ReportePacientesPDF } from '../pdf/ReportePacientesPDF';
import { FacturaPDF } from '../pdf/FacturaPDF'; 

import { excelExportService } from '../../services/ExcelExportService';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

type TipoReporte = 'presupuesto' | 'factura' | 'cierre_diario' | 'cierre_fechas' | 'pacientes' | 'morosos' | null;

export function PanelImpresiones() {
  const { usuario, tienePermiso } = useAuth();
  const currentUserId = usuario?.id || 1; 
  const nombreUsuarioActual = usuario?.nombre || 'Operador Desconocido';

  const location = useLocation();
  const paqueteExterno = location.state; 

  const [tipoReporteSeleccionado, setTipoReporteSeleccionado] = useState<TipoReporte>(
    paqueteExterno?.tipoDocumento === 'presupuesto' ? 'presupuesto' : 
    paqueteExterno?.tipoDocumento === 'factura' ? 'factura' : 'cierre_diario'
  );

  const vistaPreviaRef = useRef<HTMLDivElement>(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(false);

  const [reporteCaja, setReporteCaja] = useState<ReporteCaja | null>(null);
  const [reportePacientes, setReportePacientes] = useState<ReportePacientes | null>(null);
  const [reporteMorosos, setReporteMorosos] = useState<ReporteMorosos | null>(null);
  
  const datosPresupuesto = paqueteExterno?.tipoDocumento === 'presupuesto' ? paqueteExterno.datos : null;
  const datosFactura = paqueteExterno?.tipoDocumento === 'factura' ? paqueteExterno.datos : null;

  const evaluarPermisoNecesario = () => {
    if (datosPresupuesto) return tienePermiso(PERMISOS.GESTIONAR_PRESUPUESTOS);
    if (datosFactura) return tienePermiso(PERMISOS.VER_REPORTES); 
    if (tipoReporteSeleccionado === 'cierre_diario' || tipoReporteSeleccionado === 'cierre_fechas') {
      return tienePermiso(PERMISOS.TOTALIZAR);
    }
    return tienePermiso(PERMISOS.VER_REPORTES);
  };

  const tienePermisoParaReporte = evaluarPermisoNecesario();

  // ==========================================
  // LÓGICA DE VALIDACIÓN DE FECHAS EN TIEMPO REAL
  // ==========================================
  // Obtenemos la fecha de hoy en formato local (YYYY-MM-DD) para usarlo en el atributo 'max'
  const hoy = new Date();
  const fechaHoyString = new Date(hoy.getTime() - (hoy.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  // Cálculos automáticos de estado de error
  const fechasInvertidas = Boolean(fechaInicio && fechaFin && fechaInicio > fechaFin);
  const fechasFuturas = Boolean((fechaInicio && fechaInicio > fechaHoyString) || (fechaFin && fechaFin > fechaHoyString));
  const hayErrorFechas = fechasInvertidas || fechasFuturas;

  const obtenerDocumentoPDF = () => {
    if (datosFactura) return <FacturaPDF datos={datosFactura} usuarioNombre={nombreUsuarioActual} />;
    if (datosPresupuesto) return <PresupuestoPDF datos={datosPresupuesto} usuarioNombre={nombreUsuarioActual} />;
    
    if (reporteCaja && !datosPresupuesto && !datosFactura) return <ReporteCajaPDF reporte={reporteCaja} usuarioNombre={nombreUsuarioActual} />;
    if (reportePacientes) return <ReportePacientesPDF reporte={reportePacientes} usuarioNombre={nombreUsuarioActual} />;
    if (reporteMorosos) return <ReporteMorososPDF reporte={reporteMorosos} usuarioNombre={nombreUsuarioActual} />;
    return <Document><Page/></Document>; 
  };

  const manejarExportacionExcel = () => {
    if (reporteCaja) {
      excelExportService.exportarCaja(reporteCaja);
      toast.success("Documento Excel generado correctamente.");
    }
  };

  const puedeExportarExcel = !!reporteCaja || !!reporteMorosos;

  useEffect(() => {
    if (datosPresupuesto || datosFactura) {
      window.history.replaceState({}, document.title);
    }
  }, [datosPresupuesto, datosFactura]);

  useEffect(() => {
    setReporteCaja(null);
    setReportePacientes(null);
    setReporteMorosos(null);
    
    if (tipoReporteSeleccionado === 'cierre_diario') {
      const hoyStr = new Date().toISOString().split('T')[0];
      setFechaInicio(hoyStr);
      setFechaFin(hoyStr);
    } else {
      setFechaInicio('');
      setFechaFin('');
    }
  }, [tipoReporteSeleccionado]);

  const manejarGenerarReporte = async () => {
    if (!tienePermisoParaReporte) {
      toast.error("No posees los privilegios necesarios para generar este tipo de reporte.");
      return;
    }

    if ((tipoReporteSeleccionado === 'cierre_fechas' || tipoReporteSeleccionado === 'cierre_diario') && hayErrorFechas) {
      toast.error("Error, fechas invertidas o inválidas.");
      return;
    }

    setCargando(true);
    try {
      if (tipoReporteSeleccionado === 'cierre_diario' || tipoReporteSeleccionado === 'cierre_fechas') {
        
        if (!fechaInicio || !fechaFin) {
            toast.error("Por favor, seleccione una fecha de inicio y una de fin.");
            setCargando(false);
            return;
        }
        
        const inicio = new Date(fechaInicio + 'T00:00:00');
        const fin = new Date(fechaFin + 'T23:59:59');
        
        const ordenesBrutas = await ordenesService.getByFechas(inicio, fin, currentUserId);
        
        if(ordenesBrutas.length === 0) {
            toast.success("No hay registros en el rango seleccionado.");
        }

        setReporteCaja(impresionesService.generarReporteCaja(ordenesBrutas, fechaInicio, fechaFin));
      
      } else if (tipoReporteSeleccionado === 'pacientes') {
        const pacientesBrutos = await pacienteService.getAll();
        setReportePacientes(impresionesService.generarReportePacientes(pacientesBrutos));
      
      } else if (tipoReporteSeleccionado === 'morosos') {
        const [ordenesBrutas, pacientesBrutos] = await Promise.all([
          ordenesService.getAll(currentUserId), 
          pacienteService.getAll()
        ]);
        setReporteMorosos(impresionesService.generarReporteMorosos(ordenesBrutas, pacientesBrutos));
        
        setTimeout(() => {
          vistaPreviaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    } catch (err: any) {
      toast.error(err.message || "Ocurrió un error de conexión al generar el reporte.");
    } finally {
      setCargando(false);
    }
  };

  const hayReporteGenerado = reporteCaja || reportePacientes || reporteMorosos || datosPresupuesto || datosFactura;
  const mensajePermisoDenegado = "Tu rol no tiene permiso para procesar o visualizar esta categoría de reporte.";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:hidden">
        
        {/* PANEL LATERAL DE SELECCIÓN */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-sky-100 shadow-sm space-y-3">
          <h3 className="font-bold text-sky-900 mb-4 border-b border-sky-50 pb-2 flex items-center">
            <span className="mr-2">📑</span> Tipo de Reporte
          </h3>
          
          <button onClick={() => setTipoReporteSeleccionado('cierre_diario')} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${tipoReporteSeleccionado === 'cierre_diario' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-600 bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200'}`}>
            📅 Cierre de Caja Diario
          </button>
          <button onClick={() => setTipoReporteSeleccionado('cierre_fechas')} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${tipoReporteSeleccionado === 'cierre_fechas' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-600 bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200'}`}>
            📆 Reporte por Fechas
          </button>
          <button onClick={() => setTipoReporteSeleccionado('morosos')} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${tipoReporteSeleccionado === 'morosos' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-600 bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200'}`}>
            ⚠️ Órdenes Pendientes
          </button>
          <button onClick={() => setTipoReporteSeleccionado('pacientes')} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${tipoReporteSeleccionado === 'pacientes' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-600 bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200'}`}>
            👥 Directorio de Pacientes
          </button>
          
          {/* Indicadores de documentos externos */}
          {datosPresupuesto && (
            <div className="w-full text-center px-4 py-3 rounded-xl text-sm font-bold bg-sky-50 text-sky-700 border border-sky-200 mt-4 shadow-sm">
               📄 Presupuesto Activo
            </div>
          )}
          {datosFactura && (
            <div className="w-full text-center px-4 py-3 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-4 shadow-sm">
               📄 Factura Seleccionada
            </div>
          )}
        </div>

        {/* PANEL PRINCIPAL DE CONFIGURACIÓN */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-sky-100 shadow-sm flex flex-col justify-between">
          
          <div>
            <h2 className="text-xl font-bold text-sky-900 mb-2">Configuración del Documento</h2>
            <p className="text-sm text-slate-500 mb-6">Ajuste los parámetros antes de generar la vista previa del reporte.</p>
            
            {(tipoReporteSeleccionado === 'cierre_fechas' || tipoReporteSeleccionado === 'cierre_diario') && (
              <div className="mb-6">
                <div className={`flex gap-4 items-end p-5 rounded-xl border transition-colors ${hayErrorFechas && tipoReporteSeleccionado === 'cierre_fechas' ? 'bg-rose-50/50 border-rose-200' : 'bg-sky-50/50 border-sky-100'}`}>
                  <div className="flex-1">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${hayErrorFechas && tipoReporteSeleccionado === 'cierre_fechas' ? 'text-rose-700' : 'text-sky-800'}`}>Fecha de Inicio</label>
                    <input 
                      type="date" 
                      max={fechaHoyString} // Bloquea fechas futuras en el calendario nativo
                      disabled={tipoReporteSeleccionado === 'cierre_diario'} 
                      value={fechaInicio} 
                      onChange={(e) => setFechaInicio(e.target.value)} 
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 transition-shadow ${hayErrorFechas && tipoReporteSeleccionado === 'cierre_fechas' ? 'border-rose-400 text-rose-800 bg-white focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 text-slate-700 bg-white focus:border-sky-500 focus:ring-sky-500'}`} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${hayErrorFechas && tipoReporteSeleccionado === 'cierre_fechas' ? 'text-rose-700' : 'text-sky-800'}`}>Fecha de Fin</label>
                    <input 
                      type="date" 
                      max={fechaHoyString} // Bloquea fechas futuras en el calendario nativo
                      disabled={tipoReporteSeleccionado === 'cierre_diario'} 
                      value={fechaFin} 
                      onChange={(e) => setFechaFin(e.target.value)} 
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 transition-shadow ${hayErrorFechas && tipoReporteSeleccionado === 'cierre_fechas' ? 'border-rose-400 text-rose-800 bg-white focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 text-slate-700 bg-white focus:border-sky-500 focus:ring-sky-500'}`} 
                    />
                  </div>
                </div>
                {/* Mensaje de error dinámico */}
                {hayErrorFechas && tipoReporteSeleccionado === 'cierre_fechas' && (
                  <p className="text-xs text-rose-600 font-bold mt-3 ml-1 animate-pulse flex items-center">
                    <span className="mr-1 text-sm">⚠️</span> Error, fechas invertidas o inválidas (no se permiten fechas futuras).
                  </p>
                )}
              </div>
            )}
            
            {tipoReporteSeleccionado === 'pacientes' && (
              <div className="p-5 bg-sky-50 border border-sky-100 rounded-xl mb-6 shadow-sm">
                <p className="text-sm text-sky-800 font-medium flex items-center">
                  <span className="mr-2 text-lg">ℹ️</span> Se extraerá el registro completo de pacientes ordenado alfabéticamente.
                </p>
              </div>
            )}

            {tipoReporteSeleccionado === 'morosos' && (
              <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl mb-6 shadow-sm">
                <p className="text-sm text-amber-800 font-medium flex items-center">
                  <span className="mr-2 text-lg">⚠️</span> Se generará un cruce de datos con todas las órdenes que tengan saldo pendiente hasta el día de hoy.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between border-t border-sky-50 pt-5 mt-4">
            
            <div className="inline-block" title={!tienePermisoParaReporte ? mensajePermisoDenegado : ""}>
              <button 
                onClick={manejarExportacionExcel}
                disabled={!puedeExportarExcel || datosPresupuesto !== null || datosFactura !== null || !tienePermisoParaReporte || hayErrorFechas}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${(!puedeExportarExcel || datosPresupuesto !== null || datosFactura !== null || !tienePermisoParaReporte || hayErrorFechas) ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'}`}
              >
                <span>📊</span> Exportar a Excel
              </button>
            </div>

            <div className="space-x-3 flex items-center">
              
              {/* Ocultar botón de Cargar Vista Previa si estamos visualizando un documento externo */}
              {!(datosPresupuesto || datosFactura) && (
                <div className="inline-block" title={!tienePermisoParaReporte ? mensajePermisoDenegado : ""}>
                  <button 
                    onClick={manejarGenerarReporte} 
                    // BLOQUEO EN TIEMPO REAL SI HAY ERRORES DE FECHAS
                    disabled={cargando || !tienePermisoParaReporte || (tipoReporteSeleccionado === 'cierre_fechas' && hayErrorFechas)} 
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md ${(!tienePermisoParaReporte || (tipoReporteSeleccionado === 'cierre_fechas' && hayErrorFechas)) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-sky-900 hover:bg-sky-800 text-white hover:-translate-y-0.5'}`}
                  >
                    {cargando ? '⏳ Cargando...' : '👁️ Generar Vista Previa'}
                  </button>
                </div>
              )}
              
              {hayReporteGenerado ? (
                <div className="inline-block" title={!tienePermisoParaReporte ? mensajePermisoDenegado : ""}>
                  <PDFDownloadLink
                    document={obtenerDocumentoPDF()}
                    fileName={`BioLab_${tipoReporteSeleccionado}_${new Date().getTime()}.pdf`}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${!tienePermisoParaReporte ? 'bg-slate-300 text-slate-100 cursor-not-allowed pointer-events-none shadow-none' : 'bg-sky-500 hover:bg-sky-400 text-white hover:-translate-y-0.5'}`}
                  >
                    {({ loading }) => (loading ? '⏳ Preparando...' : '📥 Descargar PDF')}
                  </PDFDownloadLink>
                </div>
              ) : (
                <button 
                  disabled
                  className="bg-slate-200 text-slate-400 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-not-allowed flex items-center gap-2"
                >
                  📥 Descargar PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {hayReporteGenerado && tienePermisoParaReporte && (
        <div ref={vistaPreviaRef} className="mt-10 mb-20 animate-fade-in">
          <p className="text-center text-xs font-bold text-sky-600 uppercase tracking-widest mb-6 print:hidden">
            --- Vista Previa del Documento ---
          </p>
          
          <div className="h-[850px] w-full max-w-5xl mx-auto">
            
            {/* 6. Renderizado de la Factura */}
            {datosFactura && (
              <PDFViewer width="100%" height="100%" className="rounded-xl shadow-2xl border-4 border-slate-200">
                <FacturaPDF datos={datosFactura} usuarioNombre={nombreUsuarioActual} />
              </PDFViewer>
            )}

            {datosPresupuesto && (
              <PDFViewer width="100%" height="100%" className="rounded-xl shadow-2xl border-4 border-slate-200">
                <PresupuestoPDF datos={datosPresupuesto} usuarioNombre={nombreUsuarioActual} />
              </PDFViewer>
            )}

            {reporteCaja && !datosPresupuesto && !datosFactura && (
              <PDFViewer width="100%" height="100%" className="rounded-xl shadow-2xl border-4 border-slate-200">
                <ReporteCajaPDF reporte={reporteCaja} usuarioNombre={nombreUsuarioActual} />
              </PDFViewer>
            )}

            {reportePacientes && (
              <PDFViewer width="100%" height="100%" className="rounded-xl shadow-2xl border-4 border-slate-200">
                <ReportePacientesPDF reporte={reportePacientes} usuarioNombre={nombreUsuarioActual} />
              </PDFViewer>
            )}

            {reporteMorosos && (
              <PDFViewer width="100%" height="100%" className="rounded-xl shadow-2xl border-4 border-slate-200">
                <ReporteMorososPDF reporte={reporteMorosos} usuarioNombre={nombreUsuarioActual} />
              </PDFViewer>
            )}

          </div>
        </div>
      )}

    </div>
  );
}