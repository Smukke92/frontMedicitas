import React, { useState } from 'react';
import { getApiErrorMessage, registrarPacienteApi } from '../../services/api';

const initialForm = {
  correo: '',
  contrasena: '',
  tipoDocumento: 'CC',
  numeroDocumento: '',
  nombre: '',
  apellido: '',
  telefono: '',
  fechaNacimiento: '',
};

const localToday = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const validate = (form) => {
  const errors = {};
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const birthDate = new Date(`${form.fechaNacimiento}T00:00:00`);

  if (!form.nombre.trim()) errors.nombre = 'Escribe tu nombre.';
  if (!form.apellido.trim()) errors.apellido = 'Escribe tu apellido.';
  if (!email.test(form.correo.trim())) errors.correo = 'Ingresa un correo válido, por ejemplo nombre@correo.com.';
  if (form.contrasena.length < 6) errors.contrasena = 'La contraseña debe tener al menos 6 caracteres.';
  if (!/^\d+$/.test(form.numeroDocumento)) errors.numeroDocumento = 'Usa únicamente números en el documento.';
  if (!/^\d{7,15}$/.test(form.telefono)) errors.telefono = 'Ingresa entre 7 y 15 números, sin espacios ni símbolos.';
  if (!form.fechaNacimiento || Number.isNaN(birthDate.getTime()) || birthDate >= new Date(new Date().toDateString())) {
    errors.fechaNacimiento = 'La fecha debe ser válida y anterior a hoy.';
  }
  return errors;
};

const fieldFromServer = (field) => {
  const normalized = String(field || '').toLocaleLowerCase();
  return Object.keys(initialForm).find((key) => key.toLocaleLowerCase() === normalized) || null;
};

export const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setNotice(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setNotice(null);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await registrarPacienteApi({
        ...formData,
        correo: formData.correo.trim(),
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
      });
      setFormData(initialForm);
      setNotice({ type: 'success', text: 'Tu cuenta se creó correctamente. Ya puedes iniciar sesión.' });
    } catch (error) {
      const serverErrors = error.response?.data?.errores;
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        const mapped = {};
        serverErrors.forEach(({ campo, Campo, error: detail, Error: capitalizedDetail }) => {
          const field = fieldFromServer(campo || Campo);
          if (field) mapped[field] = detail || capitalizedDetail;
        });
        setErrors((current) => ({ ...current, ...mapped }));
      }
      setNotice({
        type: 'error',
        text: getApiErrorMessage(error, 'No pudimos crear tu cuenta. Revisa los datos e inténtalo de nuevo.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) => `w-full rounded-xl border px-3.5 py-2.5 outline-none transition focus:ring-4 ${
    errors[field]
      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
  }`;

  return (
    <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
      <header className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">MediCitas</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Crea tu cuenta de paciente</h1>
        <p className="mt-2 text-sm text-slate-500">Completa tus datos. Te indicaremos cómo corregir cualquier campo.</p>
      </header>

      {notice && (
        <div role={notice.type === 'error' ? 'alert' : 'status'} className={`mb-5 rounded-xl border p-3 text-sm ${
          notice.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-rose-200 bg-rose-50 text-rose-800'
        }`}>
          {notice.text}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Nombre
          <input name="nombre" value={formData.nombre} onChange={updateField} autoComplete="given-name" aria-invalid={Boolean(errors.nombre)} aria-describedby={errors.nombre ? 'error-nombre' : undefined} className={`${inputClass('nombre')} mt-1.5`} />
          {errors.nombre && <span id="error-nombre" className="mt-1 block text-xs font-normal text-rose-700">{errors.nombre}</span>}
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Apellido
          <input name="apellido" value={formData.apellido} onChange={updateField} autoComplete="family-name" aria-invalid={Boolean(errors.apellido)} aria-describedby={errors.apellido ? 'error-apellido' : undefined} className={`${inputClass('apellido')} mt-1.5`} />
          {errors.apellido && <span id="error-apellido" className="mt-1 block text-xs font-normal text-rose-700">{errors.apellido}</span>}
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Tipo de documento
          <select name="tipoDocumento" value={formData.tipoDocumento} onChange={updateField} className={`${inputClass('tipoDocumento')} mt-1.5 bg-white`}>
            <option value="CC">Cédula de ciudadanía (CC)</option>
            <option value="CE">Cédula de extranjería (CE)</option>
            <option value="TI">Tarjeta de identidad (TI)</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Número de documento
          <input name="numeroDocumento" value={formData.numeroDocumento} onChange={updateField} inputMode="numeric" aria-invalid={Boolean(errors.numeroDocumento)} aria-describedby={errors.numeroDocumento ? 'error-documento' : undefined} className={`${inputClass('numeroDocumento')} mt-1.5`} />
          {errors.numeroDocumento && <span id="error-documento" className="mt-1 block text-xs font-normal text-rose-700">{errors.numeroDocumento}</span>}
        </label>
        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Correo electrónico
          <input name="correo" type="email" value={formData.correo} onChange={updateField} autoComplete="email" aria-invalid={Boolean(errors.correo)} aria-describedby={errors.correo ? 'error-correo' : undefined} className={`${inputClass('correo')} mt-1.5`} />
          {errors.correo && <span id="error-correo" className="mt-1 block text-xs font-normal text-rose-700">{errors.correo}</span>}
        </label>
        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Contraseña
          <input name="contrasena" type="password" value={formData.contrasena} onChange={updateField} autoComplete="new-password" aria-invalid={Boolean(errors.contrasena)} aria-describedby={errors.contrasena ? 'error-contrasena' : 'ayuda-contrasena'} className={`${inputClass('contrasena')} mt-1.5`} />
          <span id={errors.contrasena ? 'error-contrasena' : 'ayuda-contrasena'} className={`mt-1 block text-xs font-normal ${errors.contrasena ? 'text-rose-700' : 'text-slate-500'}`}>
            {errors.contrasena || 'Debe tener al menos 6 caracteres.'}
          </span>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Teléfono
          <input name="telefono" type="tel" value={formData.telefono} onChange={updateField} autoComplete="tel" inputMode="numeric" aria-invalid={Boolean(errors.telefono)} aria-describedby={errors.telefono ? 'error-telefono' : undefined} className={`${inputClass('telefono')} mt-1.5`} />
          {errors.telefono && <span id="error-telefono" className="mt-1 block text-xs font-normal text-rose-700">{errors.telefono}</span>}
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Fecha de nacimiento
          <input name="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={updateField} max={localToday()} aria-invalid={Boolean(errors.fechaNacimiento)} aria-describedby={errors.fechaNacimiento ? 'error-fecha' : undefined} className={`${inputClass('fechaNacimiento')} mt-1.5`} />
          {errors.fechaNacimiento && <span id="error-fecha" className="mt-1 block text-xs font-normal text-rose-700">{errors.fechaNacimiento}</span>}
        </label>
        <button type="submit" disabled={loading} className="mt-2 rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-wait disabled:opacity-60 sm:col-span-2">
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={onSwitchToLogin} className="font-semibold text-blue-700 hover:underline">Inicia sesión</button>
      </p>
    </section>
  );
};
