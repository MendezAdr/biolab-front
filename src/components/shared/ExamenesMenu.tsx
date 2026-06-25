import React from 'react';
import type { Examen } from '../../types/Examen';

interface ExamenProps {
examenes: Examen[];
}

const examenesFalsos = [
    { id: 1, nombre: 'Hemograma Completo', descripcion: 'Análisis de sangre para evaluar la salud general.' },
    { id: 2, nombre: 'Perfil Lipídico', descripcion: 'Evaluación de los niveles de colesterol y triglicéridos.' },
    { id: 3, nombre: 'Prueba de Glucosa', descripcion: 'Medición de los niveles de azúcar en sangre.' },
];

export function ExamenesMenu({ /* examenes */ }: ExamenProps) {
    function Detalles() {
        alert('Función de detalles aún no implementada');
    }
    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mx-auto max-w-5xl">
            
            {/* Encabezado de la Tarjeta */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-sky-700">Exámenes Disponibles</h2>
                    <p className="text-sm text-slate-500">Lista de exámenes para el laboratorio</p>
                </div>
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                    + Agregar Examen
                </button>
            </div>

            {/* Lista de Exámenes */}
            <div className="overflow-x-auto p-5">
                <ul className="space-y-3">
                    {examenesFalsos.map((examen) => (
                        <li key={examen.id} onClick={Detalles} className="flex justify-between items-center p-3 bg-emerald-200/50 rounded-lg hover:bg-emerald-400/50 transition-colors cursor-pointer">
                            <span className="font-medium text-slate-700">{examen.nombre}</span>
                            <span className="text-sm text-slate-500">{examen.descripcion}</span>
                        </li>
                    ))}
                </ul>
            </div>




        </div>

    );
}
