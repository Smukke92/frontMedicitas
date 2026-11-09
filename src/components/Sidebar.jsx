import React, { useState } from 'react';
import {
  Calendar,
  CalendarClock,
  LogOut,
  Menu,
  Stethoscope,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';

const menuByRole = {
  paciente: [
    { id: 'medicos', label: 'Directorio médico', icon: Stethoscope },
    { id: 'disponibilidad', label: 'Disponibilidad', icon: CalendarClock },
    { id: 'perfil', label: 'Mi perfil', icon: User },
  ],
  medico: [
    { id: 'pacientes', label: 'Buscar paciente', icon: Users },
  ],
  administrador: [
    { id: 'medicos', label: 'Médicos', icon: Stethoscope },
    { id: 'horarios', label: 'Horarios', icon: Calendar },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
  ],
};

const roleLabels = {
  paciente: 'Paciente',
  medico: 'Médico',
  administrador: 'Administrador',
};

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, role, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user || !role) return null;
  const menuItems = menuByRole[role] || [];

  return (
    <>
      <button
        type="button"
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-slate-900 p-2.5 text-white shadow-lg md:hidden"
      >
        {isOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      {isOpen && <button type="button" aria-label="Cerrar menú" onClick={() => setIsOpen(false)} className="fixed inset-0 z-30 bg-slate-950/50 md:hidden" />}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 text-slate-100 transition-transform duration-300 md:w-64 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="border-b border-slate-800 px-6 py-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-xl font-bold">+</span>
            <div>
              <p className="font-bold tracking-tight">MediCitas</p>
              <p className="text-xs text-slate-400">Gestión de atención</p>
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-slate-900 px-3 py-2.5">
            <p className="text-xs text-slate-400">Sesión como</p>
            <p className="mt-0.5 text-sm font-medium">{roleLabels[role]}</p>
            <p className="truncate text-xs text-slate-400">{user.correo}</p>
          </div>
        </div>

        <nav aria-label="Navegación principal" className="flex-1 space-y-1 px-3 py-5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10">
            <LogOut size={19} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};
