import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { TablaPacientes } from '../shared/TablaPacientes';
import { Title } from '../layout/Title';

export function PacientesPage() {
  return (
    <MainLayout>
      
      <Title></Title>
      <TablaPacientes />
      
    </MainLayout>

  );
}