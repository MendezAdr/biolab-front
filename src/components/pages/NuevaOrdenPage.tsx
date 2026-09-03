import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Title } from '../layout/Title';
import { NuevaOrdenPanel } from '../shared/NuevaOrdenPanel';


export function NuevaOrdenPage() {
  return (
    <MainLayout>
          
          <Title></Title>
        <h2 className="text-xl font-semibold text-emerald-800">Creación de nueva orden</h2>
        <NuevaOrdenPanel/>
    </MainLayout>
  );
}