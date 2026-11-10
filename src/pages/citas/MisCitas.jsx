import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, MapPin, Pencil, X } from 'lucide-react';
import { cancelarCitaApi, getApiErrorMessage, getCitasPacienteApi } from '../../services/api';
import { AppointmentScheduler } from './AppointmentScheduler';

const DAY_RANGE = 90;
const today = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
};
const toDateString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const addDays = (date, amount) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};
const dateLabel = (value) => new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date(`${value}T12:00:00`));
const timeLabel = (value) => String(value || '').slice(0, 5);
const statusClass = (idEstado) => ({
  1: 'bg-blue-50 text-blue-800',
  2: 'bg-emerald-50 text-emerald-800',
  3: 'bg-amber-50 text-amber-800',
  4: 'bg-slate-100 text-slate-600',
}[idEstado] || 'bg-slate-100 text-slate-600');

export const MisCitas = () => {
  const [view, setView] = useState('upcoming');
  const [period, setPeriod] = useState(0);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [pendingCancel, setPendingCancel] = useState(null);
  const [rescheduling, setRescheduling] = useState(null);
  const [saving, setSaving] = useState(false);

  const range = useMemo(() => {
    const now = today();
    const start = view === 'upcoming'
      ? addDays(now, period * DAY_RANGE)
      : addDays(now, -((period + 1) * DAY_RANGE));
    const end = view === 'upcoming'
      ? addDays(start, DAY_RANGE - 1)
      : addDays(now, -(period * DAY_RANGE) - 1);
    return { start: toDateString(start), end: toDateString(end) };
  }, [period, view]);

  const loadCitas = useCallback(async () => {
    try {
      const data = await getCitasPacienteApi(range.start, range.end);
      setCitas(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No pudimos cargar tus citas.'));
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    let active = true;
    getCitasPacienteApi(range.start, range.end)
      .then((data) => {
        if (active) setCitas(Array.isArray(data) ? data : []);
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError, 'No pudimos cargar tus citas.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [range]);

  const switchView = (nextView) => {
    setLoading(true);
    setError('');
    setView(nextView);
    setPeriod(0);
    setNotice(null);
    setRescheduling(null);
  };

  const navigatePeriod = (amount) => {
    setLoading(true);
    setError('');
    setPeriod((current) => current + amount);
  };

  const cancelAppointment = async () => {
    if (!pendingCancel) return;
    setSaving(true);
    setError('');
    setNotice(null);
    try {
      const response = await cancelarCitaApi(pendingCancel.idCita);
      setNotice({ type: 'success', text: response.message || 'La cita se canceló correctamente y la franja quedó liberada.' });
      setPendingCancel(null);
      await loadCitas();
    } catch (requestError) {
      setNotice({ type: 'error', text: getApiErrorMessage(requestError, 'No pudimos cancelar la cita.') });
    } finally {
      setSaving(false);
    }
  };

  const heading = view === 'upcoming' ? 'Próximas citas' : 'Historial de citas';

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-blue-700">Mi atención</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Mis citas</h1>
        <p className="mt-1 text-sm text-slate-500">Consulta tu agenda en periodos de 90 días para cargar solo los datos que necesitas.</p>
      </header>

      {notice && (
        <div role={notice.type === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-xl border p-4 text-sm ${
          notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'
        }`}>
          {notice.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button type="button" onClick={() => switchView('upcoming')} className={`rounded-lg px-4 py-2 text-sm font-medium ${view === 'upcoming' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Próximas</button>
          <button type="button" onClick={() => switchView('history')} className={`rounded-lg px-4 py-2 text-sm font-medium ${view === 'history' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Historial</button>
        </div>
        <div className="flex gap-2">
          {view === 'upcoming' && period > 0 && <button type="button" onClick={() => navigatePeriod(-1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white">Periodo anterior</button>}
          <button type="button" onClick={() => navigatePeriod(1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white">{view === 'upcoming' ? 'Más adelante' : 'Más antiguas'}</button>
        </div>
      </div>

      {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle size={19} />{error}</div>}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Cargando {heading.toLocaleLowerCase()}...</div>
      ) : citas.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <CalendarDays className="mx-auto mb-3 text-blue-700" size={28} />
          <h2 className="font-semibold text-slate-900">No hay citas en este periodo</h2>
          <p className="mt-1 text-sm text-slate-500">{view === 'upcoming' ? 'Puedes cambiar de periodo o reservar una cita nueva.' : 'Las citas de este periodo aparecerán aquí.'}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {citas.map((cita) => (
            <li key={cita.idCita} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{cita.nombreMedico}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(cita.idEstado)}`}>{cita.nombreEstado}</span>
                  </div>
                  <p className="mt-1 text-sm text-blue-700">{cita.especialidad}</p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p className="flex items-center gap-2 capitalize"><CalendarDays size={16} />{dateLabel(cita.fecha)}</p>
                    <p className="flex items-center gap-2"><Clock3 size={16} />{timeLabel(cita.horaInicio)}–{timeLabel(cita.horaFin)}</p>
                    <p className="flex items-center gap-2"><MapPin size={16} />Lugar no informado por el servicio</p>
                  </div>
                </div>
                {cita.idEstado === 1 && (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button type="button" onClick={() => setRescheduling(cita)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <Pencil size={16} /> Reprogramar
                    </button>
                    <button type="button" onClick={() => setPendingCancel(cita)} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50">
                      <X size={16} /> Cancelar
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {pendingCancel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="cancel-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="cancel-title" className="text-lg font-bold text-slate-900">¿Cancelar esta cita?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Cita con {pendingCancel.nombreMedico}, {dateLabel(pendingCancel.fecha)} a las {timeLabel(pendingCancel.horaInicio)}. Al confirmar, la franja se liberará para otros pacientes.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" disabled={saving} onClick={() => setPendingCancel(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Volver</button>
              <button type="button" disabled={saving} onClick={cancelAppointment} className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Cancelando...' : 'Sí, cancelar cita'}</button>
            </div>
          </section>
        </div>
      )}

      {rescheduling && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-6" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="reschedule-title" className="my-auto w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="reschedule-title" className="text-lg font-bold text-slate-900">Reprogramar cita</h2>
                <p className="mt-1 text-sm text-slate-500">Selecciona una nueva fecha y franja para el mismo médico.</p>
              </div>
              <button type="button" aria-label="Cerrar" onClick={() => setRescheduling(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
            </div>
            <AppointmentScheduler
              key={rescheduling.idCita}
              mode="reschedule"
              appointmentId={rescheduling.idCita}
              fixedDoctorId={rescheduling.idMedico}
              onSuccess={(result) => {
                setRescheduling(null);
                setNotice({ type: 'success', text: result.message || 'La cita se reprogramó correctamente.' });
                loadCitas();
              }}
            />
          </section>
        </div>
      )}
    </div>
  );
};
