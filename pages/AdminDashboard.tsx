
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  DollarSign, Briefcase, CreditCard, 
  Download, Plus, Settings2,
  Lock, Globe, Coins, Receipt, X, Save, Trash2, 
  CheckCircle2, RefreshCw, ArrowUpRight, ShieldCheck,
  LogIn, Activity, Mail, Key,
  Database, Zap, Check, Clock, Layers, Shield,
  Package, CalendarDays, TrendingUp
} from 'lucide-react';
import PageBuilder from '../components/PageBuilder';
import { Invoice, PricingPlan, BillingInterval } from '../types';

const revenueData = [
  { name: 'Jan', revenue: 42000 },
  { name: 'Feb', revenue: 48000 },
  { name: 'Mar', revenue: 55000 },
  { name: 'Apr', revenue: 52000 },
  { name: 'May', revenue: 68000 },
  { name: 'Jun', revenue: 84000 },
];

const AdminDashboard: React.FC<{ tab: string }> = ({ tab }) => {
  // --- Data Persistence ---
  const [plans, setPlans] = useState<PricingPlan[]>(() => {
    const saved = localStorage.getItem('bizlink_plans');
    return saved ? JSON.parse(saved) : [
      { id: 'p1', name: 'Basic', prices: { '1': 49, '3': 129, '6': 249, '12': 449 }, features: ['100 Leads/mo', '5 Audits/mo', 'Email Support'], limits: { leads: 100, audits: 5, socialPosts: 20, teamMembers: 1 }, isActive: true },
      { id: 'p2', name: 'Gold', prices: { '1': 149, '3': 399, '6': 749, '12': 1299 }, features: ['Unlimited Leads', '50 Audits/mo', 'White-label Portal', 'Priority AI'], limits: { leads: 9999, audits: 50, socialPosts: 200, teamMembers: 5 }, isActive: true },
      { id: 'p3', name: 'Premium', prices: { '1': 499, '3': 1299, '6': 2499, '12': 4499 }, features: ['Unlimited Everything', 'Custom AI Training', 'Dedicated Manager'], limits: { leads: 9999, audits: 9999, socialPosts: 9999, teamMembers: 100 }, isActive: true },
    ];
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('bizlink_admin_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [gateways, setGateways] = useState(() => {
    const saved = localStorage.getItem('bizlink_gateways');
    return saved ? JSON.parse(saved) : {
      stripe: { connected: false, user: null, lastSync: null, plansSynced: 0 },
      paypal: { connected: false, user: null, lastSync: null, plansSynced: 0 },
      binance: { connected: false, user: null, lastSync: null, plansSynced: 0 }
    };
  });

  // --- UI States ---
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [authGateway, setAuthGateway] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSyncingGlobal, setIsSyncingGlobal] = useState(false);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [newFeature, setNewFeature] = useState('');
  
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');

  // --- Reactive Sync Engine ---
  useEffect(() => {
    localStorage.setItem('bizlink_plans', JSON.stringify(plans));
    window.dispatchEvent(new Event('storage'));

    const hasConnectedGateways = Object.values(gateways).some((g: any) => g.connected);
    if (hasConnectedGateways) {
      setIsSyncingGlobal(true);
      const timer = setTimeout(() => {
        setGateways((prev: any) => {
          const next = { ...prev };
          Object.keys(next).forEach(key => {
            if (next[key].connected) {
              next[key] = { ...next[key], plansSynced: plans.length, lastSync: new Date().toLocaleTimeString() };
            }
          });
          return next;
        });
        setIsSyncingGlobal(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('bizlink_gateways', JSON.stringify(gateways));
    window.dispatchEvent(new Event('storage'));
  }, [gateways]);

  const handleSavePlan = () => {
    if (!editingPlan) return;
    const updatedPlans = plans.find(p => p.id === editingPlan.id)
      ? plans.map(p => p.id === editingPlan.id ? editingPlan : p)
      : [...plans, editingPlan];
    setPlans(updatedPlans);
    setEditingPlan(null);
  };

  const handleDeletePlan = (id: string) => {
    if(confirm('Delete this tier? All merchant gateways will be updated instantly.')) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  const handleGatewayAuth = (id: string) => {
    if (!authEmail || !authPass) return alert("Credentials required.");
    setIsAuthenticating(true);
    setSyncProgress('Verifying Secure Credentials...');
    
    setTimeout(() => {
      setSyncProgress(`Pushing ${plans.length} Tiers to ${id.toUpperCase()} Production...`);
      setTimeout(() => {
        setSyncProgress(`Mapping Multi-Interval Pricing (1-12mo)...`);
        setTimeout(() => {
          setGateways((prev: any) => ({
            ...prev,
            [id]: { connected: true, user: authEmail, lastSync: new Date().toLocaleTimeString(), plansSynced: plans.length }
          }));
          setIsAuthenticating(false);
          setAuthGateway(null);
          setAuthEmail('');
          setAuthPass('');
          setSyncProgress('');
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleDisconnect = (id: string) => {
    setGateways((prev: any) => ({ ...prev, [id]: { connected: false, user: null, lastSync: null, plansSynced: 0 } }));
  };

  if (tab === 'editor') return <PageBuilder />;

  const GatewayCard = ({ id, name, icon: Icon, color }: any) => {
    const g = gateways[id];
    const isConnected = g.connected;
    return (
      <div className={`bg-white p-8 rounded-[3rem] border shadow-sm relative group hover:shadow-xl transition-all duration-300 ${isConnected ? 'border-emerald-100' : 'border-slate-100'}`}>
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-2xl bg-slate-50 ${color}`}><Icon size={28} /></div>
          {isConnected ? (
            <div className="flex flex-col items-end gap-1">
               <span className={`text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 ${isSyncingGlobal ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
                {isSyncingGlobal ? <RefreshCw size={10} className="animate-spin" /> : <Check size={10} />}
                {isSyncingGlobal ? 'SYNCING...' : 'LIVE'}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">UNLINKED</span>
          )}
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-1">{name} Hub</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 truncate">
          {isConnected ? `Synced to ${g.user}` : 'Sign in to link architect'}
        </p>
        <button 
          onClick={() => isConnected ? handleDisconnect(id) : setAuthGateway(id)}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            isConnected ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100' : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {isConnected ? 'Disconnect' : 'Connect Profile'}
        </button>
      </div>
    );
  };

  if (tab === 'billing') {
    return (
      <div className="p-8 space-y-12 animate-in fade-in">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-xl shadow-indigo-100"><TrendingUp size={20} /></div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Gateway Architect</h2>
            </div>
            <p className="text-slate-500 font-medium">Automatic cloud-sync between Tier Limitations and merchant profiles.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GatewayCard id="stripe" name="Stripe" icon={CreditCard} color="text-indigo-600" />
          <GatewayCard id="paypal" name="PayPal" icon={Globe} color="text-blue-500" />
          <GatewayCard id="binance" name="Binance" icon={Coins} color="text-yellow-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12 overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black text-slate-800">Subscription History</h3>
                 <button className="text-slate-400 font-black text-[10px] uppercase tracking-widest border border-slate-100 px-4 py-2 rounded-xl">Ledger Sync: OK</button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                       <tr><th className="py-4 text-left">INVOICE</th><th className="py-4 text-left">AGENCY</th><th className="py-4 text-left">PLAN</th><th className="py-4 text-left">CYCLE</th><th className="py-4 text-right">TOTAL</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {invoices.map(inv => (
                         <tr key={inv.id} className="hover:bg-slate-50 transition-all">
                            <td className="py-5 font-black text-slate-800 text-sm">{inv.id}</td>
                            <td className="py-5 font-bold text-slate-500 text-sm">{inv.agencyName}</td>
                            <td className="py-5"><span className="text-[9px] font-black px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg uppercase">TIER ACTIVE</span></td>
                            <td className="py-5 font-black text-slate-400 text-[10px]">{inv.interval} MONTHS</td>
                            <td className="py-5 text-right font-black text-slate-800">${inv.amount}</td>
                         </tr>
                       ))}
                       {invoices.length === 0 && <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase text-xs">Waiting for market subscriptions</td></tr>}
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[4rem] p-12 text-white flex flex-col border border-white/5 shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-3">
                    <Package className="text-indigo-500" size={24}/>
                    <h3 className="text-2xl font-black">Tier Architect</h3>
                 </div>
                 <button 
                  onClick={() => setEditingPlan({ id: 'p'+Date.now(), name: 'Custom', prices: { '1': 0, '3': 0, '6': 0, '12': 0 }, features: [], limits: { leads: 0, audits: 0, socialPosts: 0, teamMembers: 0 }, isActive: true })}
                  className="p-3 bg-indigo-600 rounded-2xl"
                 ><Plus size={20}/></button>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                 {plans.map(p => (
                   <div key={p.id} className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] group hover:bg-white/10 transition-all">
                      <div className="flex justify-between items-start">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.name}</p>
                            <h4 className="text-2xl font-black">${p.prices['1']} <span className="text-[10px] opacity-30">/MO</span></h4>
                         </div>
                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => setEditingPlan(p)} className="p-2 bg-indigo-600 rounded-xl"><Settings2 size={16}/></button>
                            <button onClick={() => handleDeletePlan(p.id)} className="p-2 bg-red-600/20 text-red-400 rounded-xl"><Trash2 size={16}/></button>
                         </div>
                      </div>
                      <div className="mt-4 flex gap-4">
                         <div className="flex items-center gap-1">
                            <Shield size={10} className="text-indigo-500" />
                            <span className="text-[8px] font-black text-slate-500 uppercase">{p.limits.leads} Leads</span>
                         </div>
                         <div className="flex items-center gap-1">
                            <Layers size={10} className="text-indigo-500" />
                            <span className="text-[8px] font-black text-slate-500 uppercase">{p.limits.audits} Audits</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Plan Architect Editor Modal */}
        {editingPlan && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[250] flex items-center justify-center p-6">
             <div className="bg-white rounded-[4rem] w-full max-w-4xl p-12 shadow-2xl relative overflow-y-auto max-h-[95vh] custom-scrollbar animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                     <Settings2 className="text-indigo-600" size={32} />
                     Tier Configuration
                   </h3>
                   <button onClick={() => setEditingPlan(null)} className="p-4 bg-slate-50 text-slate-400 rounded-3xl hover:bg-slate-100"><X /></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tier Name</label>
                        <select 
                           value={editingPlan.name} 
                           onChange={e => setEditingPlan({...editingPlan, name: e.target.value})}
                           className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-indigo-600 font-black"
                        >
                           <option value="Basic">Basic</option>
                           <option value="Gold">Gold</option>
                           <option value="Premium">Premium</option>
                           <option value="Enterprise">Enterprise</option>
                           <option value="Custom">Custom</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center gap-2 mb-2">
                            <CalendarDays size={14} className="text-indigo-600" />
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Multi-Interval Pricing (USD)</label>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            {(['1', '3', '6', '12'] as BillingInterval[]).map(cycle => (
                              <div key={cycle} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                 <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{cycle} Month Term</p>
                                 <div className="flex items-center gap-2">
                                    <span className="font-black text-slate-800">$</span>
                                    <input 
                                       type="number" 
                                       value={editingPlan.prices[cycle]} 
                                       onChange={e => setEditingPlan({
                                          ...editingPlan, 
                                          prices: { ...editingPlan.prices, [cycle]: Number(e.target.value) }
                                       })}
                                       className="w-full bg-transparent font-black text-xl outline-none"
                                    />
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 mb-2">
                            <Activity size={14} className="text-indigo-600" />
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Usage Quotas (Monthly)</label>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            {[
                               { label: 'Lead Credits', key: 'leads' },
                               { label: 'SEO Audits', key: 'audits' },
                               { label: 'Social Posts', key: 'socialPosts' },
                               { label: 'Team Seats', key: 'teamMembers' },
                            ].map(limit => (
                               <div key={limit.key} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">{limit.label}</p>
                                  <input 
                                     type="number" 
                                     value={(editingPlan.limits as any)[limit.key]} 
                                     onChange={e => setEditingPlan({
                                        ...editingPlan, 
                                        limits: { ...editingPlan.limits, [limit.key]: Number(e.target.value) }
                                     })}
                                     className="w-full bg-transparent font-black text-xl text-indigo-600 outline-none"
                                  />
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Included Modules</label>
                         <div className="flex gap-2">
                            <input 
                               value={newFeature} 
                               onChange={e => setNewFeature(e.target.value)} 
                               placeholder="e.g. Dedicated Support"
                               className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" 
                            />
                            <button 
                               onClick={() => { if(newFeature) setEditingPlan({...editingPlan, features: [...editingPlan.features, newFeature]}); setNewFeature(''); }}
                               className="bg-indigo-600 text-white px-6 rounded-2xl font-black text-xs"
                            >Add</button>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {editingPlan.features.map((f, i) => (
                              <span key={i} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase flex items-center gap-2">
                                 {f} <X size={12} className="cursor-pointer" onClick={() => setEditingPlan({...editingPlan, features: editingPlan.features.filter((_, idx) => idx !== i)})} />
                              </span>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-12 pt-10 border-t border-slate-50">
                   <button onClick={handleSavePlan} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-2xl hover:bg-indigo-600 transition-all">
                      <Save size={24}/> Update & Deploy Tier Live
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Merchant Login Modal */}
        {authGateway && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-6">
             <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="h-24 flex items-center justify-center relative border-b border-slate-50 bg-slate-50">
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="text-indigo-600" size={24} />
                       <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Secure {authGateway.toUpperCase()} Gateway</span>
                    </div>
                    <button onClick={() => setAuthGateway(null)} className="absolute right-6 p-2 text-slate-300 hover:text-slate-900"><X/></button>
                </div>
                <div className="p-12 text-center space-y-8">
                   {isAuthenticating ? (
                     <div className="py-10 space-y-6">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-slate-500 font-bold text-sm h-6">{syncProgress}</p>
                     </div>
                   ) : (
                     <>
                        <div className="space-y-4 text-left">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Merchant Profile Email</label>
                              <input 
                                 type="email" 
                                 value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                                 placeholder="billing@nexus-agency.com" 
                                 className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Profile Password</label>
                              <input 
                                 type="password" 
                                 value={authPass} onChange={(e) => setAuthPass(e.target.value)}
                                 placeholder="••••••••" 
                                 className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" 
                              />
                           </div>
                        </div>
                        <button 
                           onClick={() => handleGatewayAuth(authGateway!)}
                           className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all"
                        >Authorize & Link Profile</button>
                     </>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'System MRR', value: '$142,400', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%' },
          { label: 'Active Instances', value: '842', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+4.2%' },
          { label: 'Live Invoices', value: invoices.length.toString(), icon: Receipt, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Sync: OK' },
          { label: 'Gateway Status', value: Object.values(gateways).filter((g: any) => g.connected).length + '/3', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Online' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}><stat.icon size={24} /></div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">{stat.trend}</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-800 mt-1 tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm h-[400px]">
            <h3 className="text-xl font-black text-slate-800 mb-8">Revenue Projection</h3>
            <ResponsiveContainer width="100%" height="80%">
               <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none'}} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
               </BarChart>
            </ResponsiveContainer>
         </div>

         <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
            <h3 className="text-xl font-black text-slate-800 mb-8">Architect Tiers</h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
               {plans.map(p => (
                 <div key={p.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{p.name} / Cycle 1</p>
                       <p className="text-xl font-black text-slate-800">${p.prices['1']}/mo</p>
                    </div>
                    <button onClick={() => setEditingPlan(p)} className="p-2 text-slate-300 hover:text-indigo-600 transition-all"><Settings2 size={18}/></button>
                 </div>
               ))}
            </div>
            <button onClick={() => setEditingPlan({ id: 'p'+Date.now(), name: 'Custom', prices: { '1': 0, '3': 0, '6': 0, '12': 0 }, features: [], limits: { leads: 0, audits: 0, socialPosts: 0, teamMembers: 0 }, isActive: true })} className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200">New Tier</button>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
