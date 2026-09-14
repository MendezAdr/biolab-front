import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Title } from '../layout/Title';
import { TablaRoles } from '../shared/TablaRoles';


export function RolesPage() {
  return (
    <MainLayout>
          
          <Title></Title>

          <h2 className="text-xl font-semibold text-emerald-800">Gestión de Roles y Permisos</h2>
          <p className="text-slate-800 mt-2">Aquí podrás administrar los roles y permisos disponibles en el sistema.</p>
          <TablaRoles />
    </MainLayout>
  );
}