import {
  getMedicosApi,
  loginApi,
  registrarPacienteApi,
} from './api';

export const authService = {
  login: async (correo, contrasena) => {
    const data = await loginApi(correo, contrasena);
    localStorage.setItem('sgm_user', JSON.stringify(data));
    return data;
  },

  registroPaciente: registrarPacienteApi,

  obtenerMedicos: getMedicosApi,

  logout: () => {
    localStorage.removeItem('sgm_user');
  },

  getCurrentUser: () => {
    try {
      const savedUser = localStorage.getItem('sgm_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('sgm_user');
      return null;
    }
  },
};
