import React, { useState } from 'react';
import { getApiErrorMessage } from '../../services/api';
import { useAuth } from '../../context/useAuth';

export const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.correo.trim(), formData.contrasena);
      if (!result.success) setError(result.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No pudimos iniciar sesión. Inténtalo de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-2xl text-blue-700">+</div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">MediCitas</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Bienvenido de nuevo</h1>
        <p className="mt-2 text-sm text-slate-500">Ingresa para continuar con tu atención.</p>
      </div>

      {error && (
        <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-correo" className="mb-1.5 block text-sm font-medium text-slate-700">Correo electrónico</label>
          <input
            id="login-correo"
            type="email"
            autoComplete="email"
            required
            value={formData.correo}
            onChange={(event) => setFormData({ ...formData, correo: event.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="nombre@correo.com"
          />
        </div>
        <div>
          <label htmlFor="login-contrasena" className="mb-1.5 block text-sm font-medium text-slate-700">Contraseña</label>
          <input
            id="login-contrasena"
            type="password"
            autoComplete="current-password"
            required
            value={formData.contrasena}
            onChange={(event) => setFormData({ ...formData, contrasena: event.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Tu contraseña"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-600">
        ¿Eres paciente y aún no tienes cuenta?{' '}
        <button type="button" onClick={onSwitchToRegister} className="font-semibold text-blue-700 hover:underline">
          Crear cuenta
        </button>
      </p>
    </section>
  );
};
