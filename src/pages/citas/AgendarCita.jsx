import React from 'react';
import { CalendarPlus } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { AppointmentScheduler } from './AppointmentScheduler';

export const AgendarCita = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-blue-700">Mi atención</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900"><CalendarPlus size={25} />Agendar cita</h1>
        <p className="mt-1 text-sm text-slate-500">Busca por especialidad o elige un médico, selecciona una fecha y confirma el resumen.</p>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <AppointmentScheduler patientId={user.idUsuario} />
      </section>
    </div>
  );
};
