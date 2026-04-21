
import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import AdminDashboard from './pages/AdminDashboard';
import AgencyDashboard from './pages/AgencyDashboard';
import ClientDashboard from './pages/ClientDashboard';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  // Initialize state from LocalStorage to persist across refreshes
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('bizlink_isLoggedIn') === 'true';
  });
  
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('bizlink_role');
    return (savedRole as UserRole) || UserRole.AGENCY;
  });
  
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('bizlink_activeTab') || 'dashboard';
  });

  // Sync state changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('bizlink_isLoggedIn', isLoggedIn.toString());
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('bizlink_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('bizlink_activeTab', activeTab);
  }, [activeTab]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('bizlink_isLoggedIn');
    localStorage.removeItem('bizlink_role');
    localStorage.removeItem('bizlink_activeTab');
    // We don't remove agency data so the "database" persists
  };

  if (!isLoggedIn) {
    return <LandingPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (role) {
      case UserRole.ADMIN:
        return <AdminDashboard tab={activeTab} />;
      case UserRole.AGENCY:
      case UserRole.TEAM:
        return <AgencyDashboard tab={activeTab} setActiveTab={setActiveTab} />;
      case UserRole.CLIENT:
        return <ClientDashboard tab={activeTab} />;
      default:
        return <div className="p-20 text-center font-black text-slate-300 text-4xl uppercase tracking-tighter">Access Denied</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Simulation Controller */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2 bg-white/90 backdrop-blur-2xl p-4 rounded-[2.5rem] shadow-3xl border border-white shadow-slate-200/50">
        <p className="text-[9px] font-black uppercase text-slate-400 text-center mb-2 tracking-[0.2em]">Identity Manager</p>
        {[UserRole.ADMIN, UserRole.AGENCY, UserRole.TEAM, UserRole.CLIENT].map((r) => (
          <button
            key={r}
            onClick={() => {
              setRole(r);
              setActiveTab('dashboard');
            }}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black transition-all ${
              role === r 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {r}
          </button>
        ))}
        <button 
          onClick={handleLogout}
          className="mt-4 px-6 py-2.5 text-[9px] font-black text-red-500 hover:bg-red-50 rounded-2xl transition-all uppercase tracking-widest border border-red-100"
        >
          End Session
        </button>
      </div>

      <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <DashboardHeader title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} role={role} />
        <div className="flex-1 w-full overflow-y-auto">
           <div className="max-w-[1600px] mx-auto">
             {renderContent()}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
