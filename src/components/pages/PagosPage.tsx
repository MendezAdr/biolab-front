import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Title } from '../layout/Title';
import { PanelPagos } from '../shared/PanelPagos';


export function PagosPage() {
  return (
    <MainLayout>
          
          <Title></Title>

        <h2 className="text-xl font-semibold text-emerald-800">Gestión de pagos</h2>
        <p className="text-slate-800 mt-2">Aquí podrás administrar los pagos generadas en el sistema.</p>
        <PanelPagos/>
    </MainLayout>
  );
}