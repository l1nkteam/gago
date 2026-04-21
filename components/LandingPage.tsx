
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, CheckCircle2, Zap, BarChart3, 
  ShieldCheck, Globe, Mail,
  Users, RefreshCw, Lock, CreditCard, Layers, Shield
} from 'lucide-react';
import { PricingPlan, Invoice, BillingInterval } from '../types';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('1');
  const [showCheckout, setShowCheckout] = useState<PricingPlan | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'paying' | 'success'>('paying');

  const loadPlans = () => {
    const saved = localStorage.getItem('bizlink_plans');
    if (saved) {
      setPlans(JSON.parse(saved));
    } else {
      const defaults: PricingPlan[] = [
        { id: 'p1', name: 'Basic', prices: { '1': 49, '3': 129, '6': 249, '12': 449 }, features: ['100 Leads/mo', '5 Audits/mo', 'Standard Support'], limits: { leads: 100, audits: 5, socialPosts: 20, teamMembers: 1 }, isActive: true },
        { id: 'p2', name: 'Gold', prices: { '1': 149, '3': 399, '6': 749, '12': 1299 }, features: ['Unlimited Leads', '50 Audits/mo', 'AI Pitch Generator', 'White-label Portal'], limits: { leads: 9999, audits: 50, socialPosts: 200, teamMembers: 5 }, isActive: true },
        { id: 'p3', name: 'Premium', prices: { '1': 499, '3': 1299, '6': 2499, '12': 4499 }, features: ['Unlimited Everything', '24/7 Priority Support', 'Dedicated Manager'], limits: { leads: 9999, audits: 9999, socialPosts: 9999, teamMembers: 100 }, isActive: true },
      ];
      setPlans(defaults);
      localStorage.setItem('bizlink_plans', JSON.stringify(defaults));
    }
  };

  useEffect(() => {
    loadPlans();
    window.addEventListener('storage', loadPlans);
    return () => window.removeEventListener('storage', loadPlans);
  }, []);

  const handleSubscribeStart = (plan: PricingPlan) => {
    setShowCheckout(plan);
    setCheckoutStep('paying');
    
    const gateways = JSON.parse(localStorage.getItem('bizlink_gateways') || '{}');
    const hasLiveGateway = Object.values(gateways).some((g: any) => g.connected);

    setTimeout(() => {
      const savedInvoices = JSON.parse(localStorage.getItem('bizlink_admin_invoices') || '[]');
      const newInvoice: Invoice = {
        id: 'INV-' + Math.floor(1000 + Math.random() * 9000),
        agencyName: 'Agency_' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        amount: plan.prices[selectedInterval],
        date: new Date().toISOString().split('T')[0],
        status: 'Paid',
        gateway: hasLiveGateway ? 'Stripe' : 'Simulation',
        interval: selectedInterval
      };
      localStorage.setItem('bizlink_admin_invoices', JSON.stringify([newInvoice, ...savedInvoices]));

      // Save plan limits to agency session
      localStorage.setItem('bizlink_current_limits', JSON.stringify(plan.limits));
      localStorage.setItem('bizlink_role', 'AGENCY');
      localStorage.setItem('bizlink_isLoggedIn', 'true');
      localStorage.setItem('bizlink_activeTab', 'dashboard');
      
      setCheckoutStep('success');
      setTimeout(() => onLogin(), 1500);
    }, 2500);
  };

  const intervals: { label: string; value: BillingInterval }[] = [
    { label: 'Monthly', value: '1' },
    { label: '3 Months', value: '3' },
    { label: 'Semi-Annual', value: '6' },
    { label: 'Yearly', value: '12' },
  ];

  return (
    <div className="bg-white min-h-screen selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><Zap size={24} fill="white" /></div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">BizLink AI</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onLogin} className="text-sm font-bold text-slate-900 hover:text-indigo-600">Admin Login</button>
            <a href="#pricing" className="bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-black hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">Scale Now</a>
          </div>
        </div>
      </nav>

      <section className="pt-40 pb-32 px-6 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Enterprise OS is Live</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter">
              The Agency <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Market Leader.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              One platform. Unlimited growth. Automated lead acquisition and social management synced to your preferred gateway.
            </p>
          </div>
          <div className="relative group">
            <div className="relative bg-slate-900 rounded-[4rem] p-3 shadow-3xl border border-slate-800">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" className="rounded-[3.5rem] opacity-90 shadow-2xl" alt="Dashboard" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section with Multi-Interval Switch */}
      <section id="pricing" className="py-40 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter">Plan Architect</h2>
            <div className="inline-flex p-1.5 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
              {intervals.map((int) => (
                <button
                  key={int.value}
                  onClick={() => setSelectedInterval(int.value)}
                  className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedInterval === int.value ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-800'}`}
                >
                  {int.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((p, i) => (
              <div key={p.id} className="p-10 rounded-[4rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col relative group">
                <div className="flex justify-between items-start mb-10">
                   <div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-widest opacity-60 mb-2">{p.name}</h4>
                      <div className="text-5xl font-black text-slate-900 tracking-tighter">
                        ${p.prices[selectedInterval]}
                        <span className="text-[10px] font-bold opacity-30 tracking-normal ml-1">/ {selectedInterval} MO</span>
                      </div>
                   </div>
                   <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Layers size={24}/></div>
                </div>

                <div className="mb-10 grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Lead Radar</p>
                      <p className="text-sm font-black text-slate-800">{p.limits.leads === 9999 ? 'UNLIMITED' : p.limits.leads}</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Deep Audits</p>
                      <p className="text-sm font-black text-slate-800">{p.limits.audits === 9999 ? 'UNLIMITED' : p.limits.audits}</p>
                   </div>
                </div>

                <ul className="space-y-4 mb-12 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 font-black text-[10px] text-slate-500 uppercase tracking-wide">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleSubscribeStart(p)}
                  className={`w-full py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${i === 1 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  Authorize Subscription <ArrowRight size={18}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout Transition */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-6">
           <div className="bg-white rounded-[4rem] w-full max-w-lg p-16 shadow-2xl text-center">
              {checkoutStep === 'paying' ? (
                <div className="space-y-10 animate-in fade-in zoom-in-95">
                   <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                   <div>
                      <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Syncing {showCheckout.name} Tier</h3>
                      <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em]">Verifying {selectedInterval}-Month Cycle</p>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3"><CreditCard className="text-slate-400" size={20}/><span className="text-sm font-black text-slate-800 tracking-tight">**** 8821</span></div>
                      <span className="text-2xl font-black text-slate-900">${showCheckout.prices[selectedInterval]}</span>
                   </div>
                </div>
              ) : (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8">
                   <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto"><CheckCircle2 size={48} /></div>
                   <div>
                      <h3 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">License Provisioned!</h3>
                      <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em]">Redirecting to {showCheckout.name} Agency Hub</p>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-full animate-[progress_1.5s_ease-in-out]"></div></div>
                </div>
              )}
           </div>
        </div>
      )}

      <footer className="py-20 bg-white border-t border-slate-50 text-center">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">© 2024 Nexus Operations. Scalable Agency Infrastructure.</p>
      </footer>
      
      <style>{`
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
      `}</style>
    </div>
  );
};

export default LandingPage;
