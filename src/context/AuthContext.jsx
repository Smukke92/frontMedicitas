import React, { createContext, useContext, useState } from 'react';
import { loginApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sgm_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (correo, contrasena) => {
    try {
      const data = await loginApi(correo, contrasena);
      // data devuelve: { idUsuario, correo, idRol }
      setUser(data);
      localStorage.setItem('sgm_user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      const message = error.response?.status === 401 
        ? 'Credenciales incorrectas' 
        : 'Error al conectar con el servidor';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sgm_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);