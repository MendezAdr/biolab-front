import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Title } from '../layout/Title';
import { PanelPresupuestos } from '../shared/PanelPresupuesto';


export function PresupuestosPage() {
  return (
    <MainLayout>
          
          <Title></Title>
        <h2 className="text-xl font-semibold text-emerald-800">Gestión de Presupuestos</h2>
        <p className="text-slate-800 mt-2">Aquí podrás administrar los presupuestos generados en el sistema.</p>
        <PanelPresupuestos/>
    </MainLayout>
  );
}