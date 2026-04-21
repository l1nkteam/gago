
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Search, 
  ClipboardCheck, 
  KanbanSquare, 
  PenTool, 
  CreditCard, 
  Settings, 
  LogOut,
  Briefcase,
  Bell,
  Zap,
  Share2
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab }) => {
  const adminLinks = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'agencies', label: 'Agencies', icon: Briefcase },
    { id: 'billing', label: 'Financials', icon: CreditCard },
    { id: 'editor', label: 'Page Builder', icon: PenTool },
  ];

  const agencyLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Lead Radar', icon: Search },
    { id: 'audits', label: 'SEO Audits', icon: ClipboardCheck },
    { id: 'pipeline', label: 'Sales Pipeline', icon: KanbanSquare },
    { id: 'clients', label: 'Client Portfolio', icon: Users },
    { id: 'integrations', label: 'Social Sync', icon: Share2 },
    { id: 'team', label: 'My Team', icon: Users },
  ];

  const clientLinks = [
    { id: 'dashboard', label: 'My Projects', icon: LayoutDashboard },
    { id: 'audits', label: 'Reports', icon: ClipboardCheck },
    { id: 'ai-content', label: 'Content AI', icon: PenTool },
    { id: 'notifications', label: 'Alerts', icon: Bell },
  ];

  const links = role === UserRole.ADMIN ? adminLinks : role === UserRole.AGENCY ? agencyLinks : clientLinks;

  return (
    <div className="w-72 bg-white border-r h-screen flex flex-col sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Zap size={18} fill="white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">BizLink AI</h1>
        </div>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{role} PORTAL</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.id)}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-[1.25rem] transition-all group ${
              activeTab === link.id 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 font-bold' 
                : 'text-slate-500 hover:bg-slate-50 font-semibold'
            }`}
          >
            <link.icon size={22} className={activeTab === link.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} />
            {link.label}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all font-bold text-sm">
          <Settings size={20} />
          Settings
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
