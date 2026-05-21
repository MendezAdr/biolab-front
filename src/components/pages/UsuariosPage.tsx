import React from 'react';
import { Title } from '../layout/Title';
import { TablaUsuarios } from '../shared/TablaUsuarios';
import type { Usuario } from '../../types/usuario';
import { MainLayout } from '../layout/MainLayout';

export function UsuariosPage() {
  
  /* ========================================================================
     ZONA DE BACKEND / INTERCÁMBIAME EN EL FUTURO
     Aquí es donde conectarás tu API de .NET.
     Por ahora, dejamos esta maqueta idéntica a lo que respondería tu base de datos.
     ========================================================================
  */
  const usuariosFicticios: Usuario[] = [  
    { id: 1, nombre: 'Adrian Blanco', correo: 'adrian@biolab.com', rol: 'Administrador', activo: true, ultimoAcceso: 'Hoy, 04:12 PM' },
    { id: 2, nombre: 'Mariana Pérez', correo: 'mariana.b@biolab.com', rol: 'Bioanalista', activo: true, ultimoAcceso: 'Ayer, 08:30 AM' },
    { id: 3, nombre: 'Carlos Mendoza', correo: 'carlos.m@biolab.com', rol: 'Recepcionista', activo: false, ultimoAcceso: '12/05/2026' },
  ];


  return (

    <MainLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Personal Técnico</h1>
        <p className="text-slate-500 text-sm">Administra las credenciales y perfiles de los empleados.</p>
      </div>

      {/* Le inyectamos los datos a la tabla a través de sus propiedades (props) */}
      <TablaUsuarios usuarios={usuariosFicticios} />
    </div>
    </MainLayout>
  );

}