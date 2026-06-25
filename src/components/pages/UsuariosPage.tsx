import React from 'react';
import { Title } from '../layout/Title';
import { TablaUsuarios } from '../shared/TablaUsuarios';
import type { Usuario } from '../../types/usuario';
import { MainLayout } from '../layout/MainLayout';

export function UsuariosPage() {
  
 
  return (

    <MainLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Personal Técnico</h1>
        <p className="text-slate-500 text-sm">Administra las credenciales y perfiles de los empleados.</p>
      </div>

      {/* Le inyectamos los datos a la tabla a través de sus propiedades (props) */}
      <TablaUsuarios/>
    </div>
    </MainLayout>
  );

}