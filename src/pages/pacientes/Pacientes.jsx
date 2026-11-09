import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Search, UserRound } from 'lucide-react';
import {
  actualizarPacienteApi,
  buscarPacientePorDocumentoApi,
  buscarPacientesPorNombreApi,
  getApiErrorMessage,
  getPacientesApi,
} from '../../services/api';

const emptyProfile = {
  tipoDocumento: 'CC',
  numeroDocumento: '',
  nombre: '',
  apellido: '',
  telefono: '',
  fechaNacimiento: '',
};

const asDateInput = (value) => String(value || '').slice(0, 10);
const localToday = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const Pacientes = ({ role }) => {
  const isAdmin = role === 'administrador';
  const [pacientes, setPacientes] = useState([]);
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState('documento');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(isAdmin);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    getPacientesApi()
      .then((data) => setPacientes(Array.isArray(data) ? data : []))
      .catch((error) => setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos cargar los pacientes.') }))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const showPatient = (patient) => {
    setSelectedPatient(patient);
    setProfile({
      tipoDocumento: patient.tipoDocumento || 'CC',
      numeroDocumento: patient.numeroDocumento || '',
      nombre: patient.nombre || '',
      apellido: patient.apellido || '',
      telefono: patient.telefono || '',
      fechaNacimiento: asDateInput(patient.fechaNacimiento),
    });
    setNotice(null);
  };

  const search = async (event) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) {
      setNotice({ type: 'error', text: 'Escribe un número de documento o un nombre para buscar.' });
      return;
    }

    setNotice(null);
    setLoading(true);
    setSelectedPatient(null);
    try {
      if (searchMode === 'documento' || !isAdmin) {
        const patient = await buscarPacientePorDocumentoApi(term);
        showPatient(patient);
        setPacientes([patient]);
      } else {
        const results = await buscarPacientesPorNombreApi(term);
        const list = Array.isArray(results) ? results : [];
        setPacientes(list);
        setNotice({ type: 'success', text: list.length ? `Encontramos ${list.length} paciente(s).` : 'No encontramos pacientes con ese nombre.' });
      }
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'No fue posible encontrar al paciente.') });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!selectedPatient || !isAdmin) return;
    if (!profile.nombre.trim() || !profile.apellido.trim() || !/^\d+$/.test(profile.numeroDocumento) || !/^\d{7,15}$/.test(profile.telefono)) {
      setNotice({ type: 'error', text: 'Revisa nombre, apellido, documento (solo números) y teléfono (7 a 15 números).' });
      return;
    }
    if (!profile.fechaNacimiento || profile.fechaNacimiento >= localToday()) {
      setNotice({ type: 'error', text: 'La fecha de nacimiento debe ser anterior a hoy.' });
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      const response = await actualizarPacienteApi(selectedPatient.idPaciente, {
        ...profile,
        nombre: profile.nombre.trim(),
        apellido: profile.apellido.trim(),
      });
      const updated = { ...selectedPatient, ...profile };
      setSelectedPatient(updated);
      setPacientes((current) => current.map((patient) =>
        patient.idPaciente === updated.idPaciente ? updated : patient
      ));
      setNotice({ type: 'success', text: response.message || 'Perfil del paciente actualizado correctamente.' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'No pudimos actualizar el perfil.') });
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = 'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-blue-700">{isAdmin ? 'Administración' : 'Atención médica'}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{isAdmin ? 'Gestión de pacientes' : 'Buscar paciente'}</h1>
        <p className="mt-1 text-sm text-slate-500">{isAdmin ? 'Encuentra registros por documento o nombre y corrige su información.' : 'Consulta la ficha de un paciente usando su número de documento.'}</p>
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
        <form onSubmit={search} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            {isAdmin && (
              <label className="text-sm font-medium text-slate-700">
                Buscar por
                <select value={searchMode} onChange={(event) => setSearchMode(event.target.value)} className={fieldClass}>
                  <option value="documento">Documento</option>
                  <option value="nombre">Nombre o apellido</option>
                </select>
              </label>
            )}
            <label className={`text-sm font-medium text-slate-700 ${!isAdmin ? 'sm:col-span-2' : ''}`}>
              {searchMode === 'documento' || !isAdmin ? 'Número de documento' : 'Nombre o apellido'}
              <input value={query} onChange={(event) => setQuery(event.target.value)} required className={fieldClass} placeholder={searchMode === 'documento' ? 'Ej. 123456789' : 'Ej. Juan Pérez'} />
            </label>
          </div>
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
            <Search size={18} /> {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
        {!isAdmin && <p className="mt-3 text-xs text-slate-500">Por privacidad, el acceso a la ficha se realiza únicamente mediante documento.</p>}
      </section>

      {isAdmin && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Pacientes registrados</h2>
          {loading ? <p className="py-6 text-sm text-slate-500">Cargando pacientes...</p> : pacientes.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">No hay pacientes para mostrar.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {pacientes.map((patient) => (
                <li key={patient.idPaciente} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-700"><UserRound size={20} /></span>
                    <div>
                      <p className="font-medium text-slate-900">{patient.nombre} {patient.apellido}</p>
                      <p className="text-sm text-slate-500">{patient.tipoDocumento} {patient.numeroDocumento} · {patient.correo}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => showPatient(patient)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Editar perfil</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {selectedPatient && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Ficha de {selectedPatient.nombre} {selectedPatient.apellido}</h2>
            <p className="text-sm text-slate-500">{selectedPatient.correo}</p>
          </div>
          {isAdmin ? (
            <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Nombre<input className={fieldClass} value={profile.nombre} onChange={(event) => setProfile({ ...profile, nombre: event.target.value })} required /></label>
              <label className="text-sm font-medium text-slate-700">Apellido<input className={fieldClass} value={profile.apellido} onChange={(event) => setProfile({ ...profile, apellido: event.target.value })} required /></label>
              <label className="text-sm font-medium text-slate-700">Tipo de documento<select className={fieldClass} value={profile.tipoDocumento} onChange={(event) => setProfile({ ...profile, tipoDocumento: event.target.value })}><option>CC</option><option>CE</option><option>TI</option></select></label>
              <label className="text-sm font-medium text-slate-700">Número de documento<input className={fieldClass} inputMode="numeric" value={profile.numeroDocumento} onChange={(event) => setProfile({ ...profile, numeroDocumento: event.target.value })} required /></label>
              <label className="text-sm font-medium text-slate-700">Teléfono<input className={fieldClass} type="tel" inputMode="numeric" value={profile.telefono} onChange={(event) => setProfile({ ...profile, telefono: event.target.value })} required /></label>
              <label className="text-sm font-medium text-slate-700">Fecha de nacimiento<input className={fieldClass} type="date" max={localToday()} value={profile.fechaNacimiento} onChange={(event) => setProfile({ ...profile, fechaNacimiento: event.target.value })} required /></label>
              <button type="submit" disabled={saving} className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60 sm:col-span-2">{saving ? 'Guardando...' : 'Guardar cambios'}</button>
            </form>
          ) : (
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Documento</dt><dd className="mt-1 font-medium text-slate-900">{selectedPatient.tipoDocumento} {selectedPatient.numeroDocumento}</dd></div>
              <div><dt className="text-slate-500">Teléfono</dt><dd className="mt-1 font-medium text-slate-900">{selectedPatient.telefono}</dd></div>
              <div><dt className="text-slate-500">Fecha de nacimiento</dt><dd className="mt-1 font-medium text-slate-900">{asDateInput(selectedPatient.fechaNacimiento)}</dd></div>
              <div><dt className="text-slate-500">Correo</dt><dd className="mt-1 font-medium text-slate-900">{selectedPatient.correo}</dd></div>
            </dl>
          )}
        </section>
      )}
    </div>
  );
};
