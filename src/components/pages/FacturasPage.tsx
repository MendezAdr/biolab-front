import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Title } from '../layout/Title';


export function FacturasPage() {
  return (
    <MainLayout>
          
          <Title></Title>

        <h2 className="text-xl font-semibold text-emerald-800">Gestión de Facturas</h2>
        <p className="text-slate-800 mt-2">Aquí podrás administrar las facturas generadas en el sistema.</p>
    </MainLayout>
  );
}