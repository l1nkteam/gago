
import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  title: string;
  role: UserRole;
}

const DashboardHeader: React.FC<HeaderProps> = ({ title, role }) => {
  return (
    <header className="h-16 border-b bg-white px-8 flex items-center justify-between sticky top-0 z-10">
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search everything..." 
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        
        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700">John Doe</p>
            <p className="text-xs text-slate-400 capitalize">{role.toLowerCase()}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded-full font-bold">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
