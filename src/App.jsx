import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login } from "./pages/auth/Login.jsx";
import { Register } from "./pages/auth/Register.jsx";
import { ListaMedicos } from "./pages/medicos/ListaMedicos.jsx";

const MainApp = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState('login'); // 'login' | 'register'

  // Si el usuario está autenticado (existe en contexto), se muestra el dashboard principal
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold text-blue-600">Sistema Citas Médicas</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Usuario ID: {user.idUsuario} (Rol: {user.idRol})
            </span>
            <button
              onClick={logout}
              className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>
        <main className="p-6">
          <ListaMedicos />
        </main>
      </div>
    );
  }

  // Si no hay usuario en sesión, se alterna entre Login y Registro
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {view === 'login' ? (
        <Login onSwitchToRegister={() => setView('register')} />
      ) : (
        <Register onSwitchToLogin={() => setView('login')} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}