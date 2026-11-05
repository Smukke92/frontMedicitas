import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

export const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Contenido Principal */}
      <main className="flex-1 md:ml-64 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};