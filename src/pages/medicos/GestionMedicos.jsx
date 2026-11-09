import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Stethoscope } from 'lucide-react';
import { actualizarEstadoMedicoApi, crearMedicoApi, getApiErrorMessage, getMedicosApi } from '../../services/api';

const emptyDoctor = {
  correo: '',
  contrasena: '',
  idEspecialidad: '',
  tarjetaProfesional: '',
  nombre: '',
  apellido: '',
};

export const GestionMedicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [formData, setFormData] = useState(emptyDoctor);
  const [desiredStatus, setDesiredStatus] = useState({});
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadMedicos = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getMedicosApi();
      setMedicos(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos cargar el directorio de médicos.') });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getMedicosApi()
      .then((data) => {
        if (active) setMedicos(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (active) setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos cargar el directorio de médicos.') });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const submitDoctor = async (event) => {
    event.preventDefault();
    setNotice(null);
    setSaving(true);
    try {
      const response = await crearMedicoApi({
        ...formData,
        correo: formData.correo.trim(),
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        idEspecialidad: Number(formData.idEspecialidad),
      });
      setNotice({ type: 'success', text: response.message || 'Médico registrado correctamente.' });
      setFormData(emptyDoctor);
      await loadMedicos();
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos registrar al médico.') });
    } finally {
      setSaving(false);
    }
  };

  const updateDoctorStatus = async (idMedico) => {
    const estado = desiredStatus[idMedico];
    if (typeof estado !== 'boolean') return;

    setNotice(null);
    setSaving(true);
    try {
      const response = await actualizarEstadoMedicoApi(idMedico, estado);
      setNotice({ type: 'success', text: response.message || 'Estado del médico actualizado.' });
    } catch (error) {
      const message = error.response?.status === 409
        ? `${getApiErrorMessage(error)} Reasigna las citas pendientes antes de desactivar al médico.`
        : getApiErrorMessage(error, 'No pudimos actualizar el estado del médico.');
      setNotice({ type: 'error', text: message });
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = 'mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-blue-700">Administración</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Médicos</h1>
        <p className="mt-1 text-sm text-slate-500">Registra profesionales y gestiona su disponibilidad en el sistema.</p>
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
        <h2 className="text-lg font-semibold text-slate-900">Registrar médico</h2>
        <p className="mt-1 text-sm text-slate-500">El backend solicita el ID de especialidad; no hay un catálogo de especialidades disponible.</p>
        <form onSubmit={submitDoctor} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Nombre<input className={fieldClass} required value={formData.nombre} onChange={(event) => setFormData({ ...formData, nombre: event.target.value })} /></label>
          <label className="text-sm font-medium text-slate-700">Apellido<input className={fieldClass} required value={formData.apellido} onChange={(event) => setFormData({ ...formData, apellido: event.target.value })} /></label>
          <label className="text-sm font-medium text-slate-700">Correo<input className={fieldClass} type="email" autoComplete="email" required value={formData.correo} onChange={(event) => setFormData({ ...formData, correo: event.target.value })} /></label>
          <label className="text-sm font-medium text-slate-700">Contraseña temporal<input className={fieldClass} type="password" autoComplete="new-password" minLength="6" required value={formData.contrasena} onChange={(event) => setFormData({ ...formData, contrasena: event.target.value })} /></label>
          <label className="text-sm font-medium text-slate-700">ID de especialidad<input className={fieldClass} type="number" min="1" step="1" required value={formData.idEspecialidad} onChange={(event) => setFormData({ ...formData, idEspecialidad: event.target.value })} /></label>
          <label className="text-sm font-medium text-slate-700">Tarjeta profesional<input className={fieldClass} required value={formData.tarjetaProfesional} onChange={(event) => setFormData({ ...formData, tarjetaProfesional: event.target.value })} /></label>
          <button type="submit" disabled={saving} className="rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60 sm:col-span-2">
            {saving ? 'Guardando...' : 'Registrar médico'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Directorio</h2>
            <p className="mt-1 text-sm text-slate-500">El API no expone el estado actual. Selecciona explícitamente el estado que deseas establecer.</p>
          </div>
          <button type="button" onClick={() => loadMedicos(true)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Actualizar lista</button>
        </div>
        {loading ? <p className="py-8 text-center text-sm text-slate-500">Cargando médicos...</p> : medicos.length === 0 ? (
          <div className="py-10 text-center text-slate-500"><Stethoscope className="mx-auto mb-2" /><p>No hay médicos para mostrar.</p></div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {medicos.map((medico) => (
              <li key={medico.idMedico} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{medico.nombre} {medico.apellido}</p>
                  <p className="text-sm text-slate-600">{medico.nombreEspecialidad || 'Especialidad no indicada'} · {medico.correo || 'Sin correo visible'}</p>
                  <p className="text-xs text-slate-400">Médico #{medico.idMedico}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    aria-label={`Nuevo estado para ${medico.nombre} ${medico.apellido}`}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={desiredStatus[medico.idMedico] === undefined ? '' : String(desiredStatus[medico.idMedico])}
                    onChange={(event) => setDesiredStatus({ ...desiredStatus, [medico.idMedico]: event.target.value === 'true' })}
                  >
                    <option value="" disabled>Seleccionar estado</option>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                  <button type="button" disabled={saving || desiredStatus[medico.idMedico] === undefined} onClick={() => updateDoctorStatus(medico.idMedico)} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
                    Aplicar estado
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
