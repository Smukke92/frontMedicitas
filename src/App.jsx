import React, { useState } from 'react';
import { AlertCircle, LogOut, UserRound } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { Sidebar } from './components/Sidebar.jsx';
import { Login } from './pages/auth/Login.jsx';
import { Register } from './pages/auth/Register.jsx';
import { GestionMedicos } from './pages/medicos/GestionMedicos.jsx';
import { ListaMedicos } from './pages/medicos/ListaMedicos.jsx';
import { Horarios } from './pages/horarios/Horarios.jsx';
import { Pacientes } from './pages/pacientes/Pacientes.jsx';
import { AgendarCita } from './pages/citas/AgendarCita.jsx';
import { MisCitas } from './pages/citas/MisCitas.jsx';
import { AgendaMedico } from './pages/citas/AgendaMedico.jsx';

const tabsByRole = {
  paciente: ['agendar-cita', 'mis-citas', 'medicos', 'perfil'],
  medico: ['agenda-medico', 'pacientes'],
  administrador: ['medicos', 'horarios', 'pacientes'],
};

const MainApp = () => {
  const { user, role, logout } = useAuth();
  const [view, setView] = useState('login');
  const [activeTab, setActiveTab] = useState('medicos');

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-8">
        {view === 'login'
          ? <Login onSwitchToRegister={() => setView('register')} />
          : <Register onSwitchToLogin={() => setView('login')} />}
      </main>
    );
  }

  if (!role) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <section className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-7 shadow-sm">
          <div className="mb-4 flex items-center gap-3 text-amber-700"><AlertCircle /><h1 className="text-xl font-bold">Rol sin acceso configurado</h1></div>
          <p className="text-sm leading-6 text-slate-600">El backend no asigna a esta cuenta un rol reconocido por la aplicación. No se mostrarán secciones protegidas.</p>
          <button type="button" onClick={logout} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"><LogOut size={17} /> Cerrar sesión</button>
        </section>
      </main>
    );
  }

  const allowedTabs = tabsByRole[role] || [];
  const selectedTab = allowedTabs.includes(activeTab) ? activeTab : allowedTabs[0];
  const renderTab = () => {
    if (!allowedTabs.includes(selectedTab)) return null;

    switch (selectedTab) {
      case 'medicos':
        return role === 'administrador' ? <GestionMedicos /> : <ListaMedicos />;
      case 'horarios':
        return role === 'administrador' ? <Horarios /> : null;
      case 'disponibilidad':
        return role === 'paciente' ? <Horarios mode="availability" /> : null;
      case 'agendar-cita':
        return role === 'paciente' ? <AgendarCita /> : null;
      case 'mis-citas':
        return role === 'paciente' ? <MisCitas /> : null;
      case 'agenda-medico':
        return role === 'medico' ? <AgendaMedico user={user} /> : null;
      case 'pacientes':
        return role === 'administrador' || role === 'medico' ? <Pacientes role={role} /> : null;
      case 'perfil':
        return role === 'paciente' ? (
          <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-3 text-amber-700"><UserRound /><h1 className="text-xl font-bold">Mi perfil</h1></div>
            <p className="text-sm leading-6 text-slate-600">El servicio actual permite actualizar un paciente por ID, pero no ofrece una operación para consultar el perfil del paciente autenticado ni devuelve su ID de paciente al iniciar sesión. Para evitar mostrar o modificar el registro de otra persona, esta pantalla no habilita cambios hasta que el API exponga esa asociación.</p>
          </section>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar activeTab={selectedTab} setActiveTab={setActiveTab} />
      <main className="min-h-screen min-w-0 flex-1 px-4 pb-8 pt-20 md:ml-64 md:px-8 md:pt-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 hidden items-center justify-between border-b border-slate-200 pb-5 md:flex">
            <div>
              <p className="text-sm text-slate-500">Portal de atención médica</p>
              <p className="mt-0.5 font-semibold text-slate-900">Hola, {user.correo}</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium capitalize text-slate-600">{role}</span>
          </div>
          {renderTab()}
        </div>
      </main>
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
