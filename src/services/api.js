import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginApi = async (correo, contrasena) => {
  const response = await api.post('/auth/login', { correo, contrasena });
  return response.data;
};

export const registrarPacienteApi = async (datosPaciente) => {
  const response = await api.post('/pacientes/registro', datosPaciente);
  return response.data;
};

export const getMedicosApi = async () => {
  const response = await api.get('/medicos');
  return response.data;
};

export default api;