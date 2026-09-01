import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Title } from '../layout/Title';
import { HistoricoFacturas } from '../shared/HistoricoFacturas';


export function HistoricoFacturasPage() {
  return (
    <MainLayout>
          
          <Title></Title>

        <h2 className="text-xl font-semibold text-emerald-800">Gestión de Órdenes</h2>
        <p className="text-slate-800 mt-2">Aquí podrás administrar las órdenes generadas en el sistema.</p>
        <HistoricoFacturas/>
    </MainLayout>
  );
}