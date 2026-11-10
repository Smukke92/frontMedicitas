import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, UserRound } from 'lucide-react';
import { cambiarEstadoCitaApi, getAgendaMedicoApi, getApiErrorMessage, getMedicosApi } from '../../services/api';

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const parseDate = (value) => new Date(`${value}T12:00:00`);
const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const addDays = (date, amount) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};
const startOfWeek = (date) => {
  const result = new Date(date);
  const offset = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - offset);
  return result;
};
const timeLabel = (value) => String(value || '').slice(0, 5);
const fullDate = (value) => new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(parseDate(value));

export const AgendaMedico = ({ user }) => {
  const [idMedico, setIdMedico] = useState('');
  const [date, setDate] = useState(today);
  const [view, setView] = useState('week');
  const [appointments, setAppointments] = useState([]);
  const [doctorNotFound, setDoctorNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let active = true;
    getMedicosApi()
      .then((data) => {
        if (!active) return;
        const doctor = (Array.isArray(data) ? data : []).find((item) => Number(item.idUsuario) === Number(user.idUsuario));
        if (doctor) setIdMedico(String(doctor.idMedico));
        else {
          setDoctorNotFound(true);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (active) {
          setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos identificar tu perfil médico.') });
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [user.idUsuario]);

  const range = useMemo(() => {
    const selected = parseDate(date);
    if (view === 'day') return { start: selected, end: selected };
    const start = startOfWeek(selected);
    return { start, end: addDays(start, 6) };
  }, [date, view]);

  const loadAppointments = useCallback(async () => {
    if (!idMedico) return;
    try {
      const data = await getAgendaMedicoApi(idMedico, formatDate(range.start), formatDate(range.end));
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos cargar la agenda para este periodo.') });
    } finally {
      setLoading(false);
    }
  }, [idMedico, range]);

  useEffect(() => {
    if (!idMedico) return undefined;
    let active = true;
    getAgendaMedicoApi(idMedico, formatDate(range.start), formatDate(range.end))
      .then((data) => {
        if (active) setAppointments(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (active) setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos cargar la agenda para este periodo.') });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [idMedico, range]);

  const updateStatus = async (appointment, idEstado) => {
    setSavingId(appointment.idCita);
    setNotice(null);
    try {
      const response = await cambiarEstadoCitaApi(appointment.idCita, idEstado);
      setNotice({ type: 'success', text: response.message || `La cita quedó marcada como ${idEstado === 2 ? 'atendida' : 'inasistencia'}.` });
      await loadAppointments();
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos actualizar el estado de la cita.') });
    } finally {
      setSavingId(null);
    }
  };

  const days = useMemo(() => {
    const count = view === 'day' ? 1 : 7;
    return Array.from({ length: count }, (_, index) => {
      const day = addDays(range.start, index);
      const key = formatDate(day);
      return { key, label: fullDate(key), appointments: appointments.filter((appointment) => String(appointment.fecha).slice(0, 10) === key) };
    });
  }, [appointments, range, view]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-blue-700">Atención médica</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Mi agenda</h1>
        <p className="mt-1 text-sm text-slate-500">Consulta un día o una semana a la vez y actualiza el resultado de cada cita.</p>
      </header>

      {notice && (
        <div role={notice.type === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-xl border p-4 text-sm ${
          notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'
        }`}>
          {notice.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{notice.text}</span>
        </div>
      )}

      {doctorNotFound ? (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-white p-5 text-sm leading-6 text-amber-900">
          No encontramos un registro de médico vinculado al usuario que inició sesión. La agenda requiere relacionar `idUsuario` con `idMedico` en el directorio.
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
            <label className="block text-sm font-medium text-slate-700">
              Fecha de referencia
              <input type="date" value={date} onChange={(event) => { setLoading(true); setDate(event.target.value); }} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:w-auto" />
            </label>
            <div className="inline-flex rounded-xl border border-slate-200 p-1">
              <button type="button" onClick={() => { setLoading(true); setView('day'); }} className={`rounded-lg px-4 py-2 text-sm font-medium ${view === 'day' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Día</button>
              <button type="button" onClick={() => { setLoading(true); setView('week'); }} className={`rounded-lg px-4 py-2 text-sm font-medium ${view === 'week' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Semana</button>
            </div>
          </section>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Cargando agenda...</div>
          ) : (
            <div className="space-y-4">
              {days.map((day) => (
                <section key={day.key} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <h2 className="flex items-center gap-2 font-semibold capitalize text-slate-900"><CalendarDays size={18} className="text-blue-700" />{day.label}</h2>
                  {day.appointments.length === 0 ? (
                    <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No tienes citas para este día.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-slate-100">
                      {day.appointments.map((appointment) => (
                        <li key={appointment.idCita} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="flex items-center gap-2 font-semibold text-slate-900"><Clock3 size={17} className="text-blue-700" />{timeLabel(appointment.horaInicio)}–{timeLabel(appointment.horaFin)} <span className="text-sm font-normal text-slate-500">· {appointment.nombreEstado}</span></p>
                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-700"><UserRound size={16} />{appointment.nombrePaciente}</p>
                            <p className="mt-1 text-sm text-slate-500">{appointment.especialidad}</p>
                          </div>
                          {appointment.idEstado === 1 && (
                            <div className="flex flex-wrap gap-2">
                              <button type="button" disabled={savingId === appointment.idCita} onClick={() => updateStatus(appointment, 2)} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">Atendida</button>
                              <button type="button" disabled={savingId === appointment.idCita} onClick={() => updateStatus(appointment, 3)} className="rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50">Inasistencia</button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
