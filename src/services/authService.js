import API from './api';

export const authService = {
  // 1. POST /api/auth/login
  login: async (correo, contrasena) => {
    const response = await API.post('/auth/login', {
      correo,
      contrasena,
    });
    // Si la respuesta incluye un token o datos del usuario, los guardamos en sesión
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // 2. POST /api/pacientes/registro
  registroPaciente: async (datosPaciente) => {
    const response = await API.post('/pacientes/registro', datosPaciente);
    return response.data;
  },

  // 3. GET /api/medicos
  obtenerMedicos: async () => {
    const response = await API.get('/medicos');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};