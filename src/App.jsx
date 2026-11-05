import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login } from "./pages/auth/Login.jsx";
import { Register } from "./pages/auth/Register.jsx";
import { ListaMedicos } from "./pages/medicos/ListaMedicos.jsx";
import { Sidebar } from "./components/Sidebar.jsx";

const MainApp = () => {
  const { user } = useAuth();
  const [view, setView] = useState('login'); // Estado para alternar entre login y registro cuando no está autenticado
  const [activeTab, setActiveTab] = useState('medicos'); // Pestaña activa dentro del Panel de Control

  // Si el usuario está autenticado, renderizamos la barra lateral y el contenido principal
  if (user) {
    const renderTabContent = () => {
      switch (activeTab) {
        case 'medicos':
          return <ListaMedicos />;
        case 'perfil':
          return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Mi Perfil</h2>
              <p className="text-gray-600">ID de Usuario: <span className="font-semibold">{user.idUsuario}</span></p>
              <p className="text-gray-600">Correo: <span className="font-semibold">{user.correo}</span></p>
              <p className="text-gray-600">ID de Rol: <span className="font-semibold">{user.idRol}</span></p>
            </div>
          );
        default:
          return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 capitalize mb-2">{activeTab.replace('-', ' ')}</h2>
              <p className="text-gray-500">Módulo en desarrollo para este rol.</p>
            </div>
          );
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Barra Lateral Dinámica */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Contenido Principal con margen a la izquierda para desktop (md:ml-64) */}
        <main className="flex-1 md:ml-64 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </main>
      </div>
    );
  }

  // Si no hay usuario en sesión, se muestra el Login o Registro
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