import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Title } from '../layout/Title';
import { PanelImpresiones } from './PanelImpresiones';


export function ImpresionesPage() {
  return (
    <MainLayout>
          
          <Title></Title>
    <h2 className="text-xl font-semibold text-emerald-800">Gestión de Impresiones</h2>
    <p className="text-slate-800 mt-2">Aquí podrás administrar las impresiones generadas en el sistema.</p>
    <PanelImpresiones/>
    </MainLayout>
  );
}