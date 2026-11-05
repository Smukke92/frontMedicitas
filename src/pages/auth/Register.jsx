import React, { useState } from 'react';
import { registrarPacienteApi } from '../../services/api';

export const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    fechaNacimiento: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        fechaNacimiento: new Date(formData.fechaNacimiento).toISOString(),
      };
      await registrarPacienteApi(payload);
      setSuccess('Paciente registrado exitosamente. Redirigiendo al login...');
      setTimeout(() => onSwitchToLogin(), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'El correo ya está registrado o los datos son inválidos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Registro de Paciente</h2>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm mb-4 border border-emerald-100">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" name="nombre" required onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input type="text" name="apellido" required onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Doc.</label>
            <select name="tipoDocumento" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="TI">TI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nro. Documento</label>
            <input type="text" name="numeroDocumento" required onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input type="email" name="correo" required onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input type="password" name="contrasena" required onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input type="tel" name="telefono" required onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Nacimiento</label>
            <input type="date" name="fechaNacimiento" required onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        ¿Ya tienes cuenta?{' '}
        <button 
          type="button"
          onClick={onSwitchToLogin} 
          className="text-blue-600 font-semibold hover:underline focus:outline-none"
        >
          Inicia sesión
        </button>
      </p>
    </div>
  );
};