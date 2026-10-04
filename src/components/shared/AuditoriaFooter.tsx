import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMasterData } from '../../context/MasterDataContext';
import { PERMISOS } from '../../types/AuthTypes';

interface AuditoriaProps {
  datosAuditales: any; 
}

export function AuditoriaFooter({ datosAuditales }: AuditoriaProps) {
  const { tienePermiso } = useAuth();
  const { obtenerNombreUsuario } = useMasterData();

  // DEBUG: Revisa la consola de tu navegador pulsando F12
  console.log("🔍 Datos recibidos en el Footer:", datosAuditales);
  
  const esAdmin = tienePermiso(PERMISOS.GESTIONAR_USUARIOS);
  console.log("🔍 ¿Tiene permiso de admin?", esAdmin);

  // 1. Barrera de seguridad estricta
  if (!esAdmin || !datosAuditales) {
    return null;
  }

  // 2. Extracción segura
  const creadoPorId = datosAuditales.creadoPorId ?? datosAuditales.CreadoPorId;
  const fechaCreacion = datosAuditales.fechaCreacion ?? datosAuditales.FechaCreacion;
  const modificadoPorId = datosAuditales.modificadoPorId ?? datosAuditales.ModificadoPorId;
  const fechaModificacion = datosAuditales.fechaModificacion ?? datosAuditales.FechaModificacion;

  // 3. VALIDACIÓN CORREGIDA: Solo salimos si es literalmente null o undefined. Si es 0, lo mostramos.
  if (creadoPorId === undefined || creadoPorId === null) {
    return (
      <div className="mt-6 pt-4 border-t border-rose-200 bg-rose-50 p-4 rounded-lg text-xs text-rose-600 font-mono">
        ⚠️️ Modo Admin: El componente AuditoriaFooter está activo, pero el Backend no está enviando el campo "creadoPorId" en este registro. Revisa el DTO o el mapeo en C#.
      </div>
    );
  }

  // 4. INYECCIÓN DE DATOS DESDE LA MEMORIA GLOBAL
  const creador = obtenerNombreUsuario(creadoPorId);
  const modificador = modificadoPorId ? obtenerNombreUsuario(modificadoPorId) : null;

  const formatearFecha = (fecha: any) => {
    if (!fecha) return 'Desconocida / No registrada';
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? 'Fecha inválida' : d.toLocaleString();
  };

  return (
    <div className="mt-6 pt-4 border-t border-slate-200 bg-slate-50 p-4 rounded-lg text-xs text-slate-500 font-mono shadow-inner">
      <div className="flex items-center mb-3 pb-2 border-b border-slate-200/60">
        <span className="font-bold text-slate-700 uppercase tracking-wider">
          🛡️ Control de Auditoría Interna
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="mb-1">
            Registro inicial: <span className="font-bold text-emerald-700">@{creador}</span>
          </p>
          <p className="text-[10px] text-slate-400">
            {formatearFecha(fechaCreacion)}
          </p>
        </div>

        {modificador && (
          <div>
            <p className="mb-1">
              Última edición: <span className="font-bold text-amber-600">@{modificador}</span>
            </p>
            <p className="text-[10px] text-slate-400">
              {formatearFecha(fechaModificacion)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}