import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-medicitas-legacy.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  try {
    const savedUser = localStorage.getItem('sgm_user');
    const token = savedUser ? JSON.parse(savedUser)?.token : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    localStorage.removeItem('sgm_user');
  }

  return config;
});

export const getApiErrorMessage = (error, fallback = 'No fue posible completar la solicitud.') => {
  const data = error.response?.data;
  const validationErrors = data?.errores;

  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors.map(({ campo, Campo, error: detail, Error: capitalizedDetail }) =>
      `${campo || Campo}: ${detail || capitalizedDetail}`
    ).join(' ');
  }

  return data?.error || data?.message || fallback;
};

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

export const crearMedicoApi = async (datosMedico) => {
  const response = await api.post('/medicos', datosMedico);
  return response.data;
};

export const actualizarEstadoMedicoApi = async (idMedico, estado) => {
  const response = await api.put(`/medicos/${idMedico}/estado`, { estado });
  return response.data;
};

export const getHorariosMedicoApi = async (idMedico) => {
  const response = await api.get(`/medicos/${idMedico}/horarios`);
  return response.data;
};

export const guardarHorarioMedicoApi = async (idMedico, horario) => {
  const response = await api.post(`/medicos/${idMedico}/horarios`, horario);
  return response.data;
};

export const getDisponibilidadMedicoApi = async (idMedico, fecha) => {
  const response = await api.get(`/medicos/${idMedico}/disponibilidad`, { params: { fecha } });
  return response.data;
};

export const getPacientesApi = async () => {
  const response = await api.get('/pacientes');
  return response.data;
};

export const buscarPacientesPorNombreApi = async (nombre) => {
  const response = await api.get('/pacientes/buscar', { params: { nombre } });
  return response.data;
};

export const buscarPacientePorDocumentoApi = async (documento) => {
  const response = await api.get(`/pacientes/${encodeURIComponent(documento)}`);
  return response.data;
};

export const actualizarPacienteApi = async (idPaciente, datosPaciente) => {
  const response = await api.put(`/pacientes/${idPaciente}`, datosPaciente);
  return response.data;
};

export default api;
