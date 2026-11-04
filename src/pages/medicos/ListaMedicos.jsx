import React, { useEffect, useState } from 'react';
import { authService } from '../../services/authService';

export const ListaMedicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const data = await authService.obtenerMedicos();
        setMedicos(data);
      } catch (err) {
        setError('No se pudo cargar la lista de médicos');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicos();
  }, []);

  if (loading) return <div className="text-center p-6 text-gray-500">Cargando médicos...</div>;
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Directorio de Médicos</h2>
      {medicos.length === 0 && (
        <p className="text-center text-gray-500 py-10">No hay médicos registrados por el momento.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medicos.map((medico) => (
          <div key={medico.idMedico} className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Dr. {medico.nombre} {medico.apellido}
            </h3>
            <p className="text-sm text-blue-600 font-medium">{medico.especialidad}</p>
            <p className="text-xs text-gray-500 mt-1">Consultorio: {medico.consultorio}</p>
          </div>
        ))}
      </div>
    </div>
  );
};