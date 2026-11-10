import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, MapPin, Stethoscope } from 'lucide-react';
import {
  agendarCitaApi,
  getApiErrorMessage,
  getDisponibilidadMedicoApi,
  getMedicosApi,
  reprogramarCitaApi,
} from '../../services/api';

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const currentDateString = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const dateFromString = (value) => new Date(`${value}T12:00:00`);
const dateToString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const addDays = (date, amount) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};
const startOfWeek = (date) => {
  const result = new Date(date);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
};
const dateLabel = (value) => new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(dateFromString(value));
const timeLabel = (value) => String(value || '').slice(0, 5);

export const AppointmentScheduler = ({
  mode = 'book',
  appointmentId,
  fixedDoctorId,
  patientId,
  onSuccess,
}) => {
  const fixedDoctor = fixedDoctorId !== undefined && fixedDoctorId !== null;
  const [medicos, setMedicos] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const [idMedico, setIdMedico] = useState(fixedDoctor ? String(fixedDoctorId) : '');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [todayValue] = useState(currentDateString);
  const [availability, setAvailability] = useState({});
  const [calendarStatus, setCalendarStatus] = useState({ key: '', state: 'loading' });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notice, setNotice] = useState(null);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    getMedicosApi()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setMedicos(list);
        const specialties = [...new Set(list.map((doctor) => doctor.nombreEspecialidad).filter(Boolean))].sort();
        if (list.length === 0) setNotice({ type: 'error', text: 'No hay médicos disponibles para agendar en este momento.' });
        if (!fixedDoctor && specialties.length) setSpecialty(specialties[0]);
        const currentDoctor = fixedDoctor
          ? list.find((doctor) => String(doctor.idMedico) === String(fixedDoctorId))
          : list.find((doctor) => doctor.nombreEspecialidad === specialties[0]);
        if (!fixedDoctor && currentDoctor) setIdMedico(String(currentDoctor.idMedico));
        if (fixedDoctor && !currentDoctor) setNotice({ type: 'error', text: 'No encontramos el médico asociado a esta cita.' });
      })
      .catch((error) => {
        if (active) setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos cargar el directorio de médicos.') });
      })
      .finally(() => {
        if (active) setDoctorsLoading(false);
      });
    return () => { active = false; };
  }, [fixedDoctor, fixedDoctorId]);

  useEffect(() => {
    if (!idMedico) return undefined;
    const requestKey = `${idMedico}:${dateToString(weekStart)}:${retry}`;
    const weekEnd = addDays(weekStart, 6);
    const controller = new AbortController();
    let active = true;

    const loadAvailability = async () => {
      try {
        const response = await getDisponibilidadMedicoApi(
          idMedico,
          dateToString(weekStart),
          dateToString(weekEnd),
          controller.signal
        );
        if (!active || controller.signal.aborted) return;

        if (!response || typeof response !== 'object' || Array.isArray(response)) {
          throw new Error('El servicio devolvió un formato de disponibilidad no reconocido.');
        }

        const results = Object.fromEntries(
          Object.entries(response).map(([date, slots]) => [
            date.slice(0, 10),
            { slots: Array.isArray(slots) ? slots : [], error: null },
          ])
        );
        setAvailability(results);
        setCalendarStatus({ key: requestKey, state: 'ready' });
        setNotice(null);
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        setCalendarStatus({ key: requestKey, state: 'error' });
        setAvailability({});
        setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos consultar la disponibilidad del médico.') });
      }
    };

    loadAvailability();
    return () => {
      active = false;
      controller.abort();
    };
  }, [idMedico, weekStart, retry]);
  const specialties = useMemo(() => [...new Set(medicos.map((doctor) => doctor.nombreEspecialidad).filter(Boolean))].sort(), [medicos]);
  const filteredDoctors = useMemo(
    () => medicos.filter((doctor) => !specialty || doctor.nombreEspecialidad === specialty),
    [medicos, specialty]
  );
  const currentDoctor = medicos.find((doctor) => String(doctor.idMedico) === idMedico);
  const requestKey = `${idMedico}:${dateToString(weekStart)}:${retry}`;
  const calendarLoading = doctorsLoading || (Boolean(idMedico) && (calendarStatus.key !== requestKey || calendarStatus.state === 'loading'));
  const slotsForDate = availability[selectedDate]?.slots || [];
  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const weekLabel = `${new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(weekDates[0])} – ${new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(weekDates[6])}`;
  const canGoPrevious = dateToString(weekStart) <= dateToString(startOfWeek(dateFromString(todayValue)));

  const chooseDoctor = (doctorId) => {
    setIdMedico(doctorId);
    setSelectedDate('');
    setSelectedSlot('');
    setCompleted(false);
    setAvailability({});
    setCalendarStatus({ key: '', state: 'loading' });
    setNotice(null);
  };

  const moveWeek = (amount) => {
    setWeekStart((current) => addDays(current, amount * 7));
    setSelectedDate('');
    setSelectedSlot('');
    setCompleted(false);
    setAvailability({});
    setCalendarStatus({ key: '', state: 'loading' });
    setNotice(null);
  };

  const selectDate = (date) => {
    setSelectedDate(date);
    setSelectedSlot('');
    setCompleted(false);
    setNotice(null);
  };

  const confirmAppointment = async () => {
    if (!selectedDate || !selectedSlot || !currentDoctor) return;
    if (mode !== 'reschedule' && (!Number.isInteger(Number(patientId)) || Number(patientId) <= 0)) {
      setNotice({ type: 'error', text: 'No pudimos identificar tu cuenta de paciente. Cierra sesión e inicia nuevamente antes de agendar.' });
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const response = mode === 'reschedule'
        ? await reprogramarCitaApi(appointmentId, selectedDate, `${selectedSlot}:00`)
        : await agendarCitaApi({
          idMedico: Number(idMedico),
          idPaciente: Number(patientId),
          fecha: selectedDate,
          horaInicio: `${selectedSlot}:00`,
          idSede: 1,
        });
      setNotice({ type: 'success', text: response.message || (mode === 'reschedule' ? 'La cita se reprogramó correctamente.' : 'La cita quedó agendada.') });
      setCompleted(true);
      onSuccess?.({
        ...response,
        medico: currentDoctor,
        fecha: selectedDate,
        horaInicio: selectedSlot,
      });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error.response?.status === 409
          ? `${getApiErrorMessage(error, 'La franja ya no está disponible.')} Actualizamos las franjas; elige otra.`
          : getApiErrorMessage(error, 'No pudimos confirmar la cita. Inténtalo de nuevo.'),
      });
      setSelectedSlot('');
      setCompleted(false);
      setRetry((current) => current + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

  return (
    <div className="space-y-5">
      {notice && (
        <div role={notice.type === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-xl border p-3 text-sm ${
          notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'
        }`}>
          {notice.type === 'success' ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {!fixedDoctor && (
          <>
            <label className="text-sm font-medium text-slate-700">
              Especialidad
              <select
                className={inputClass}
                value={specialty}
                disabled={doctorsLoading || specialties.length === 0}
                onChange={(event) => {
                  setSpecialty(event.target.value);
                  const first = medicos.find((doctor) => doctor.nombreEspecialidad === event.target.value);
                  chooseDoctor(first ? String(first.idMedico) : '');
                }}
              >
                {specialties.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Médico
              <select
                className={inputClass}
                value={idMedico}
                disabled={doctorsLoading || filteredDoctors.length === 0}
                onChange={(event) => chooseDoctor(event.target.value)}
              >
                {filteredDoctors.map((doctor) => <option key={doctor.idMedico} value={doctor.idMedico}>{doctor.nombre} {doctor.apellido}</option>)}
              </select>
            </label>
          </>
        )}
      </div>

      {fixedDoctor && currentDoctor && (
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
          <Stethoscope size={19} />
          <span><strong>{currentDoctor.nombre} {currentDoctor.apellido}</strong> · {currentDoctor.nombreEspecialidad}</span>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(250px,0.9fr)]">
        <section className="rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <button type="button" aria-label="Semana anterior" disabled={canGoPrevious} onClick={() => moveWeek(-1)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30">
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-semibold capitalize text-slate-900">{weekLabel}</h3>
            <button type="button" aria-label="Semana siguiente" onClick={() => moveWeek(1)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((name) => <span key={name} className="py-2 text-[11px] font-semibold text-slate-500 sm:text-xs">{name}</span>)}
            {weekDates.map((day) => {
              const date = dateToString(day);
              const result = availability[date];
              const isPast = date < todayValue;
              const enabled = !calendarLoading && !isPast && Boolean(result?.slots?.length) && !result?.error;
              const selected = date === selectedDate;
              return (
                <button
                  type="button"
                  key={date}
                  disabled={!enabled}
                  aria-label={`${dateLabel(date)}${enabled ? ', disponible' : ', no disponible'}`}
                  aria-pressed={selected}
                  onClick={() => selectDate(date)}
                  className={`aspect-square rounded-xl text-xs font-medium transition sm:text-sm ${
                    selected ? 'bg-blue-700 text-white'
                      : enabled ? 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                        : 'cursor-not-allowed text-slate-300'
                  }`}
                  title={result?.error ? 'No se pudo verificar disponibilidad' : enabled ? 'Hay franjas disponibles' : 'Sin disponibilidad'}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Disponible</span>
            {calendarLoading ? <span>Consultando semana...</span> : !idMedico ? <span>Selecciona un médico</span> : calendarStatus.state === 'error' ? (
              <button type="button" onClick={() => setRetry((current) => current + 1)} className="font-semibold text-blue-700 hover:underline">Reintentar disponibilidad</button>
            ) : <span>Fechas pasadas y sin franjas deshabilitadas</span>}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 sm:p-5">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900"><Clock3 size={18} className="text-blue-700" /> Franjas disponibles</h3>
          {!selectedDate ? (
            <p className="mt-4 text-sm text-slate-500">Selecciona un día disponible en el calendario.</p>
          ) : slotsForDate.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No encontramos franjas para este día.</p>
          ) : (
            <>
              <p className="mt-2 text-sm capitalize text-slate-500">{dateLabel(selectedDate)}</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {slotsForDate.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    aria-pressed={selectedSlot === timeLabel(slot)}
                    onClick={() => setSelectedSlot(timeLabel(slot))}
                    className={`rounded-lg border px-2 py-2.5 text-sm font-semibold transition ${
                      selectedSlot === timeLabel(slot) ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {timeLabel(slot)}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {selectedDate && selectedSlot && currentDoctor && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5">
          <h3 className="font-semibold text-slate-900">{completed ? 'Cita confirmada' : mode === 'reschedule' ? 'Confirma la nueva cita' : 'Resumen de la cita'}</h3>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-2"><Stethoscope size={17} className="mt-0.5 text-blue-700" /><div><dt className="text-slate-500">Médico</dt><dd className="font-medium text-slate-900">{currentDoctor.nombre} {currentDoctor.apellido} · {currentDoctor.nombreEspecialidad}</dd></div></div>
            <div className="flex items-start gap-2"><CalendarDays size={17} className="mt-0.5 text-blue-700" /><div><dt className="text-slate-500">Fecha y hora</dt><dd className="font-medium capitalize text-slate-900">{dateLabel(selectedDate)}, {selectedSlot}</dd></div></div>
            <div className="flex items-start gap-2 sm:col-span-2"><MapPin size={17} className="mt-0.5 text-blue-700" /><div><dt className="text-slate-500">Lugar</dt><dd className="font-medium text-slate-900">Sede 1 · El servicio no informa la dirección al reservar.</dd></div></div>
          </dl>
          <button type="button" onClick={confirmAppointment} disabled={submitting || completed} className="mt-4 w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60 sm:w-auto">
            {completed ? 'Confirmada' : submitting ? 'Confirmando...' : mode === 'reschedule' ? 'Confirmar reprogramación' : 'Confirmar cita'}
          </button>
        </section>
      )}
    </div>
  );
};
