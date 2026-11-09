import React, { useMemo, useState } from 'react';
import { getApiErrorMessage, loginApi } from '../services/api';

import { AuthContext } from './AuthContextValue';

const readSavedUser = () => {
  try {
    const savedUser = localStorage.getItem('sgm_user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem('sgm_user');
    return null;
  }
};

const roleById = {
  1: 'administrador',
  2: 'medico',
  3: 'paciente',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readSavedUser);

  const login = async (correo, contrasena) => {
    try {
      const data = await loginApi(correo, contrasena);
      setUser(data);
      localStorage.setItem('sgm_user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.status === 401
          ? 'El correo o la contraseña no son correctos.'
          : getApiErrorMessage(error, 'No pudimos conectar con el servicio. Inténtalo de nuevo.'),
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sgm_user');
  };

  const role = roleById[user?.idRol] || null;
  const value = useMemo(() => ({ user, role, login, logout }), [user, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
