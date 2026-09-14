import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Title } from '../layout/Title';
import { ExamenesMenu } from '../shared/ExamenesMenu';


export function ExamenesPage() {
  return (
    <MainLayout>
          
          <Title></Title>

          <h2 className="text-xl font-semibold text-emerald-800">Gestión de Exámenes</h2>
          <p className="text-slate-800 mt-2">Aquí podrás administrar los exámenes disponibles en el sistema.</p>
          <ExamenesMenu />
    </MainLayout>
  );
}