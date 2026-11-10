import React, { useEffect, useState } from 'react';
import { AlertCircle, CalendarClock, CheckCircle2 } from 'lucide-react';
import {
  getApiErrorMessage,
  getDisponibilidadMedicoApi,
  getHorariosMedicoApi,
  getMedicosApi,
  guardarHorarioMedicoApi,
} from '../../services/api';

const days = [
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' },
  { id: 6, name: 'Sábado' },
  { id: 7, name: 'Domingo' },
];

const today = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};
const timeLabel = (time) => String(time || '').slice(0, 5);

export const Horarios = ({ mode = 'admin' }) => {
  const isAvailability = mode === 'availability';
  const [medicos, setMedicos] = useState([]);
  const [idMedico, setIdMedico] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [fecha, setFecha] = useState(today());
  const [franjas, setFranjas] = useState([]);
  const [formData, setFormData] = useState({ idDia: '1', horaInicio: '08:00', horaFin: '12:00', intervaloMinutos: '30' });
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getMedicosApi()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setMedicos(list);
        if (list.length > 0) setIdMedico(String(list[0].idMedico));
      })
      .catch((error) => {
        if (active) setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos cargar los médicos.') });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!idMedico || isAvailability) return undefined;
    let active = true;
    getHorariosMedicoApi(idMedico)
      .then((data) => {
        if (active) setHorarios(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (active) setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos cargar los horarios configurados.') });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [idMedico, isAvailability]);

  const submitSchedule = async (event) => {
    event.preventDefault();
    setNotice(null);
    const { horaInicio, horaFin, intervaloMinutos } = formData;
    if (horaInicio >= horaFin) {
      setNotice({ type: 'error', text: 'La hora de inicio debe ser anterior a la hora de fin.' });
      return;
    }
    if (Number(intervaloMinutos) <= 0) {
      setNotice({ type: 'error', text: 'El intervalo debe ser mayor a cero minutos.' });
      return;
    }

    setSaving(true);
    try {
      const response = await guardarHorarioMedicoApi(idMedico, {
        idDia: Number(formData.idDia),
        horaInicio: `${horaInicio}:00`,
        horaFin: `${horaFin}:00`,
        intervaloMinutos: Number(intervaloMinutos),
      });
      setNotice({ type: 'success', text: response.message || 'Horario configurado correctamente.' });
      const updated = await getHorariosMedicoApi(idMedico);
      setHorarios(Array.isArray(updated) ? updated : []);
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos guardar el horario.') });
    } finally {
      setSaving(false);
    }
  };

  const checkAvailability = async (event) => {
    event.preventDefault();
    setNotice(null);
    setSaving(true);
    setFranjas([]);
    try {
      const data = await getDisponibilidadMedicoApi(idMedico, fecha, fecha);
      const availableSlots = Array.isArray(data?.[fecha]) ? data[fecha] : [];
      setFranjas(availableSlots);
      setNotice({ type: 'success', text: availableSlots.length ? 'Estas son las franjas disponibles para la fecha elegida.' : 'No hay franjas disponibles para esa fecha.' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos consultar la disponibilidad.') });
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = 'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-blue-700">{isAvailability ? 'Agenda' : 'Administración'}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{isAvailability ? 'Disponibilidad de atención' : 'Horarios médicos'}</h1>
        <p className="mt-1 text-sm text-slate-500">{isAvailability ? 'Consulta las franjas libres que ofrece el servicio para un médico y una fecha.' : 'Define los días, horas e intervalos de atención de cada médico.'}</p>
      </header>

      {notice && (
        <div role={notice.type === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-xl border p-4 text-sm ${
          notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'
        }`}>
          {notice.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{notice.text}</span>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <label className="block max-w-xl text-sm font-medium text-slate-700">
          Médico
          <select className={fieldClass} value={idMedico} onChange={(event) => { setLoading(true); setHorarios([]); setIdMedico(event.target.value); setFranjas([]); }} disabled={loading || medicos.length === 0}>
            {medicos.length === 0 && <option value="">No hay médicos disponibles</option>}
            {medicos.map((medico) => <option key={medico.idMedico} value={medico.idMedico}>{medico.nombre} {medico.apellido} · {medico.nombreEspecialidad}</option>)}
          </select>
        </label>

        {isAvailability ? (
          <form onSubmit={checkAvailability} className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="block text-sm font-medium text-slate-700">
              Fecha
              <input type="date" min={today()} value={fecha} onChange={(event) => setFecha(event.target.value)} required className={fieldClass} />
            </label>
            <button type="submit" disabled={saving || !idMedico} className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
              {saving ? 'Consultando...' : 'Consultar franjas'}
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={submitSchedule} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-medium text-slate-700">Día<select className={fieldClass} value={formData.idDia} onChange={(event) => setFormData({ ...formData, idDia: event.target.value })}>{days.map((day) => <option key={day.id} value={day.id}>{day.name}</option>)}</select></label>
              <label className="text-sm font-medium text-slate-700">Desde<input type="time" required value={formData.horaInicio} onChange={(event) => setFormData({ ...formData, horaInicio: event.target.value })} className={fieldClass} /></label>
              <label className="text-sm font-medium text-slate-700">Hasta<input type="time" required value={formData.horaFin} onChange={(event) => setFormData({ ...formData, horaFin: event.target.value })} className={fieldClass} /></label>
              <label className="text-sm font-medium text-slate-700">Intervalo (minutos)<input type="number" min="1" step="1" required value={formData.intervaloMinutos} onChange={(event) => setFormData({ ...formData, intervaloMinutos: event.target.value })} className={fieldClass} /></label>
              <button type="submit" disabled={saving || !idMedico} className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60 sm:col-span-2 lg:col-span-4">
                {saving ? 'Guardando...' : 'Guardar horario'}
              </button>
            </form>
            <div className="mt-7 border-t border-slate-100 pt-5">
              <h2 className="font-semibold text-slate-900">Horarios configurados</h2>
              {loading ? <p className="py-4 text-sm text-slate-500">Cargando horarios...</p> : horarios.length === 0 ? (
                <p className="py-4 text-sm text-slate-500">Este médico todavía no tiene horarios configurados.</p>
              ) : (
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {horarios.map((horario) => (
                    <li key={horario.idHorario} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                      <CalendarClock className="shrink-0 text-blue-700" size={20} />
                      <div>
                        <p className="font-medium text-slate-900">{horario.nombreDia || days.find((day) => day.id === horario.idDia)?.name}</p>
                        <p className="text-sm text-slate-600">{timeLabel(horario.horaInicio)}–{timeLabel(horario.horaFin)} · cada {horario.intervaloMinutos} min</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {isAvailability && franjas.length > 0 && (
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {franjas.map((franja) => <li key={franja} className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-3 text-center font-semibold text-blue-800">{timeLabel(franja)}</li>)}
          </ul>
        )}
      </section>
    </div>
  );
};
