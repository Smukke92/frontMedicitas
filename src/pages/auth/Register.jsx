import React, { useState } from 'react';
import { authService } from '../../services/authService';

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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Ajuste de formato ISO para fechaNacimiento
      const payload = {
        ...formData,
        fechaNacimiento: new Date(formData.fechaNacimiento).toISOString(),
      };

      const res = await authService.registroPaciente(payload);
      alert(res.message || 'Paciente registrado exitosamente');
      onSwitchToLogin();
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'El correo ya está registrado o los datos son inválidos');
      } else {
        setError('Problema al guardar en la base de datos');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Registro de Paciente</h2>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombre"
              required
              className="w-full p-2 border rounded-lg text-sm"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Apellido</label>
            <input
              type="text"
              name="apellido"
              required
              className="w-full p-2 border rounded-lg text-sm"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700">Tipo Doc.</label>
            <select
              name="tipoDocumento"
              className="w-full p-2 border rounded-lg text-sm"
              value={formData.tipoDocumento}
              onChange={handleChange}
            >
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="TI">TI</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Num. Documento</label>
            <input
              type="text"
              name="numeroDocumento"
              required
              className="w-full p-2 border rounded-lg text-sm"
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Correo Electrónico</label>
          <input
            type="email"
            name="correo"
            required
            className="w-full p-2 border rounded-lg text-sm"
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            name="contrasena"
            required
            className="w-full p-2 border rounded-lg text-sm"
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              required
              className="w-full p-2 border rounded-lg text-sm"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Fecha Nacimiento</label>
            <input
              type="date"
              name="fechaNacimiento"
              required
              className="w-full p-2 border rounded-lg text-sm"
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 mt-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {loading ? 'Registrando...' : 'Completar Registro'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <button onClick={onSwitchToLogin} className="text-blue-600 font-medium hover:underline">
          Inicia Sesión
        </button>
      </p>
    </div>
  );
};