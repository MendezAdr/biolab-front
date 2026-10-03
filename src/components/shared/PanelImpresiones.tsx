import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ordenesService } from '../../services/ordenesService';
import { pacienteService } from '../../services/pacienteService';
import { impresionesService, type ReporteCaja, type ReportePacientes, type ReporteMorosos } from '../../services/ImpresionesService';

// IMPORTANTE: Cambiamos PDFViewer por BlobProvider
import { BlobProvider, PDFDownloadLink, Document, Page } from '@react-pdf/renderer';

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
      const hoy = new Date().toISOString().split('T')[0];
      setFechaInicio(hoy);
      setFechaFin(hoy);
    } else {
      setFechaInicio('');
      setFechaFin('');
    }
  }, [tipoReporteSeleccionado]);

  const manejarGenerarReporte = async () => {
    if (!tienePermisoParaReporte) {
      alert("No posees los privilegios necesarios para generar este tipo de reporte.");
      return;
    }

    setCargando(true);
    try {
      if (tipoReporteSeleccionado === 'cierre_diario' || tipoReporteSeleccionado === 'cierre_fechas') {
        if (!fechaInicio || !fechaFin) return alert("Seleccione las fechas.");
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        
        const ordenesBrutas = await ordenesService.getByFechas(inicio, fin, currentUserId);
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
    } catch (err) {
      alert("Error al generar el reporte.");
    } finally {
      setCargando(false);
    }
  };

  const hayReporteGenerado = reporteCaja || reportePacientes || reporteMorosos || datosPresupuesto || datosFactura;
  const mensajePermisoDenegado = "Tu rol no tiene permiso para procesar o visualizar esta categoría de reporte.";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:hidden">
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Tipo de Reporte</h3>
          
          <button onClick={() => setTipoReporteSeleccionado('cierre_diario')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tipoReporteSeleccionado === 'cierre_diario' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}>
            📅 Cierre de Caja Diario
          </button>
          <button onClick={() => setTipoReporteSeleccionado('cierre_fechas')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tipoReporteSeleccionado === 'cierre_fechas' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}>
            📆 Reporte por Fechas
          </button>
          <button onClick={() => setTipoReporteSeleccionado('morosos')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tipoReporteSeleccionado === 'morosos' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}>
            ⚠️ Órdenes Pendientes (Morosos)
          </button>
          <button onClick={() => setTipoReporteSeleccionado('pacientes')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tipoReporteSeleccionado === 'pacientes' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}>
            👥 Directorio de Pacientes
          </button>
          
          {datosPresupuesto && (
            <div className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium bg-sky-50 text-sky-700 border border-sky-200 mt-4">
               📄 Presupuesto Pendiente
            </div>
          )}
          {datosFactura && (
            <div className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 mt-4">
               📄 Factura Seleccionada
            </div>
          )}
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Configuración del Documento</h2>
            <p className="text-sm text-slate-500 mb-6">Ajuste los parámetros antes de generar la vista previa.</p>
            
            {(tipoReporteSeleccionado === 'cierre_fechas' || tipoReporteSeleccionado === 'cierre_diario') && (
              <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha de Inicio</label>
                  <input type="date" disabled={tipoReporteSeleccionado === 'cierre_diario'} value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-sm disabled:bg-slate-200" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha de Fin</label>
                  <input type="date" disabled={tipoReporteSeleccionado === 'cierre_diario'} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-sm disabled:bg-slate-200" />
                </div>
              </div>
            )}
            
            {tipoReporteSeleccionado === 'pacientes' && (
              <div className="p-4 bg-sky-50 border border-sky-100 rounded-lg mb-6">
                <p className="text-sm text-sky-800">Se extraerá el registro completo de pacientes ordenado alfabéticamente.</p>
              </div>
            )}

            {tipoReporteSeleccionado === 'morosos' && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg mb-6">
                <p className="text-sm text-amber-800">Se generará un cruce de datos con todas las órdenes que tengan saldo pendiente hasta el día de hoy.</p>
              </div>
            )}
          </div>

          <div className="flex justify-between border-t border-slate-100 pt-4">
            <div className="inline-block" title={!tienePermisoParaReporte ? mensajePermisoDenegado : ""}>
              <button 
                onClick={manejarExportacionExcel}
                disabled={!puedeExportarExcel || datosPresupuesto !== null || datosFactura !== null || !tienePermisoParaReporte}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${(!puedeExportarExcel || datosPresupuesto !== null || datosFactura !== null || !tienePermisoParaReporte) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'}`}
              >
                📊 Exportar a Excel
              </button>
            </div>

            <div className="space-x-3 flex items-center">
              {!(datosPresupuesto || datosFactura) && (
                <div className="inline-block" title={!tienePermisoParaReporte ? mensajePermisoDenegado : ""}>
                  <button 
                    onClick={manejarGenerarReporte} 
                    disabled={cargando || !tienePermisoParaReporte} 
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${(!tienePermisoParaReporte) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                  >
                    {cargando ? 'Cargando...' : '👁️ Cargar Vista Previa'}
                  </button>
                </div>
              )}
              
              {hayReporteGenerado ? (
                <div className="inline-block" title={!tienePermisoParaReporte ? mensajePermisoDenegado : ""}>
                  <PDFDownloadLink
                    document={obtenerDocumentoPDF()}
                    fileName={`BioLab_${tipoReporteSeleccionado}_${new Date().getTime()}.pdf`}
                    className={`px-6 py-2 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center justify-center h-[38px] ${!tienePermisoParaReporte ? 'bg-slate-300 text-slate-100 cursor-not-allowed pointer-events-none' : 'bg-sky-600 hover:bg-sky-700 text-white'}`}
                  >
                    {({ loading }) => (loading ? '⏳ Preparando...' : '📥 Descargar PDF')}
                  </PDFDownloadLink>
                </div>
              ) : (
                <button disabled className="bg-slate-300 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md transition-colors h-[38px] cursor-not-allowed">
                  📥 Descargar PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 
        -------------------------------------------------------------
        ZONA MODIFICADA: REEMPLAZO DE PDFVIEWER POR BLOBPROVIDER
        -------------------------------------------------------------
      */}
      {hayReporteGenerado && tienePermisoParaReporte && (
        <div ref={vistaPreviaRef} className="mt-8 mb-20">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 print:hidden">
            --- Vista Previa del Documento ---
          </p>
          
          <div className="h-[800px] w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-300 relative shadow-2xl">
            <BlobProvider document={obtenerDocumentoPDF()}>
              {({ url, loading, error }) => {
                
                if (loading) {
                  return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                      <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                      <h3 className="text-slate-700 font-bold text-lg">Construyendo Documento</h3>
                      <p className="text-slate-500 text-sm">Procesando diseño institucional...</p>
                    </div>
                  );
                }

                if (error) {
                  return (
                    <div className="absolute inset-0 flex items-center justify-center bg-rose-50 text-rose-600 p-6 text-center">
                      <p className="font-bold">Error de Renderizado</p>
                      <p className="text-sm mt-2">Ocurrió un problema al generar el PDF. Verifica que los datos sean correctos.</p>
                    </div>
                  );
                }

                return (
                  <iframe 
                    src={url ?? ''} 
                    className="w-full h-full border-0" 
                    title="Visor PDF Institucional"
                  />
                );
              }}
            </BlobProvider>
          </div>
        </div>
      )}

    </div>
  );
}