// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  Users, 
  Stethoscope, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  // Mapeo de roles de la API a texto para filtrar el menú
  const roleNameMap = {
    1: 'administrador',
    2: 'paciente',
    3: 'medico',
    4: 'recepcionista'
  };

  const userRole = (roleNameMap[user.idRol] || user.role || 'paciente').toLowerCase();

  // Menús de navegación según el rol
  const menuByRole = {
    paciente: [
      { id: 'medicos', label: 'Ver Médicos', icon: Stethoscope },
      { id: 'citas', label: 'Mis Citas', icon: Calendar },
      { id: 'perfil', label: 'Mi Perfil', icon: User },
    ],
    recepcionista: [
      { id: 'pacientes', label: 'Gestión Pacientes', icon: Users },
      { id: 'citas-agendar', label: 'Agendar Cita', icon: Calendar },
    ],
    medico: [
      { id: 'agenda', label: 'Mi Agenda', icon: Clock },
      { id: 'pacientes', label: 'Pacientes', icon: Users },
    ],
    administrador: [
      { id: 'medicos', label: 'Gestión Médicos', icon: Stethoscope },
      { id: 'horarios', label: 'Horarios Atención', icon: Clock },
      { id: 'pacientes', label: 'Gestión Pacientes', icon: Users },
      { id: 'seguridad', label: 'Control Acceso', icon: ShieldAlert },
    ],
  };

  const menuItems = menuByRole[userRole] || [];

  return (
    <>
      {/* Botón flotante para dispositivos móviles */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Fondo oscuro al abrir menú en móviles */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Sidebar Layout */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header del Sidebar */}
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-blue-400">SGM Clínica</h2>
            <p className="text-xs text-slate-400 mt-1 capitalize">
              Rol: {userRole} (ID: {user.idUsuario})
            </p>
          </div>

          {/* Menú de Navegación */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sección de Sesión */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white uppercase">
              {user.correo ? user.correo[0] : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-400 truncate">{user.correo}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition font-medium text-sm"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};