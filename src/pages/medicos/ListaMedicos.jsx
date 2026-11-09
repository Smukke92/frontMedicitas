import React, { useEffect, useState } from 'react';
import { AlertCircle, Stethoscope } from 'lucide-react';
import { getApiErrorMessage, getMedicosApi } from '../../services/api';

export const ListaMedicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getMedicosApi()
      .then((data) => {
        if (active) setMedicos(Array.isArray(data) ? data : []);
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError, 'No pudimos cargar el directorio de médicos.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-blue-700">Atención médica</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Directorio de médicos</h1>
        <p className="mt-1 text-sm text-slate-500">Conoce a los profesionales y sus especialidades.</p>
      </header>

      {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle size={19} />{error}</div>}
      {loading ? <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Cargando médicos...</p> : (
        medicos.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            <Stethoscope className="mx-auto mb-3 text-blue-700" size={28} />
            <p>No hay médicos registrados para mostrar.</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {medicos.map((medico) => (
              <li key={medico.idMedico} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Stethoscope size={23} /></span>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900">Dr. {medico.nombre} {medico.apellido}</h2>
                    <p className="mt-1 text-sm font-medium text-blue-700">{medico.nombreEspecialidad || 'Especialidad no indicada'}</p>
                    {medico.correo && <p className="mt-3 truncate text-sm text-slate-500">{medico.correo}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
};
