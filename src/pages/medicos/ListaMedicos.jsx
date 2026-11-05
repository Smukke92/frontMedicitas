import React, { useEffect, useState } from 'react';
import { getMedicosApi } from '../../services/api';

export const ListaMedicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const data = await getMedicosApi();
        setMedicos(data);
      } catch (err) {
        setError('Error al cargar la lista de médicos');
      } finally {
        setLoading(false);
      }
    };
    fetchMedicos();
  }, []);

  if (loading) return <div className="text-center py-8 text-gray-500">Cargando médicos...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Directorio de Médicos</h2>
      
      {medicos.length === 0 ? (
        <p className="text-gray-500">No hay médicos registrados en este momento.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="p-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Especialidad</th>
                <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Consultorio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {medicos.map((medico) => (
                <tr key={medico.idMedico} className="hover:bg-gray-50 transition">
                  <td className="p-3 text-sm text-gray-600">#{medico.idMedico}</td>
                  <td className="p-3 text-sm font-medium text-gray-900">
                    {medico.nombre} {medico.apellido}
                  </td>
                  <td className="p-3 text-sm text-blue-600 font-medium">
                    {medico.especialidad}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {medico.consultorio}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};