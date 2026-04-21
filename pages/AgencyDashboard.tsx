
import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Mail, Phone, Globe, Send, Plus, 
  CheckCircle2, AlertCircle, FileText, Wand2, 
  ArrowRight, Filter, Download, Activity, 
  Bookmark, BookmarkCheck, Loader2, BarChart4,
  Cpu, Users, Info, Trash2, UserPlus, Briefcase,
  ChevronRight, MoreVertical, Clock, Shield, Key,
  KanbanSquare, X, Lock, ExternalLink, Zap,
  Facebook, Instagram, Linkedin, Share2, RefreshCw,
  Calendar, Settings2, Play, ClipboardCheck, Server,
  Wifi, WifiOff
} from 'lucide-react';
import { Lead, Client, Deal, TeamMember, SocialConnection, ScheduledPost, ClientWithQueue } from '../types';
import { searchLeadsAI, generateLeadPitch, performDeepAudit, generateWeeklySocialBatch } from '../services/geminiService';

const AgencyDashboard: React.FC<{ tab: string; setActiveTab: (tab: string) => void }> = ({ tab, setActiveTab }) => {
  // --- Centralized Persistence States ---
  const [leads, setLeads] = useState<Lead[]>([]);
  const [aiStatus, setAiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  const [clients, setClients] = useState<ClientWithQueue[]>(() => {
    const saved = localStorage.getItem('bizlink_clients');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'c1', 
        name: 'Nexus Digital', 
        email: 'ops@nexus.io', 
        website: 'nexusdigital.io', 
        status: 'active', 
        projectsCount: 2, 
        joinedDate: '2024-01-10',
        socialConnections: [
          { platform: 'LinkedIn', status: 'connected', accountName: 'Nexus Global', lastSync: '1h ago' }
        ],
        autoPilot: { isEnabled: true, strategy: 'educational', frequency: 'daily', useLocalAI: false },
        queue: []
      }
    ];
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem('bizlink_deals');
    return saved ? JSON.parse(saved) : [
      { id: 'd1', clientName: 'Nexus Digital', niche: 'SaaS', value: '$4,500/mo', stage: 'Proposal', lastActivity: '2h ago' }
    ];
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('bizlink_team');
    return saved ? JSON.parse(saved) : [
      { id: 'tm1', name: 'Jordan Vance', email: 'jordan@bizlink.ai', role: 'Manager', status: 'online', joinedDate: '2023-11-01' }
    ];
  });

  // Check Local AI Health on mount
  useEffect(() => {
    const checkAI = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setAiStatus(data.local_ai === 'online' ? 'online' : 'offline');
        
        // If online but model might be missing, we could log it or show a hint
        if (data.local_ai === 'online' && data.available_models) {
          const modelExists = data.available_models.some((m: any) => m.name.includes(data.model));
          if (!modelExists && data.available_models.length > 0) {
            console.warn(`Model ${data.model} not found on server. Available:`, data.available_models.map((m: any) => m.name));
          }
        }
      } catch (e) {
        setAiStatus('offline');
      }
    };
    checkAI();
    const interval = setInterval(checkAI, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Persist all agency data
  useEffect(() => {
    localStorage.setItem('bizlink_clients', JSON.stringify(clients));
    localStorage.setItem('bizlink_deals', JSON.stringify(deals));
    localStorage.setItem('bizlink_team', JSON.stringify(team));
  }, [clients, deals, team]);

  // UI Local States
  const [niche, setNiche] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditReport, setAuditReport] = useState<{report: string, sources: any[]} | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  
  // Integration & AutoPilot States
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [generatingBatch, setGeneratingBatch] = useState(false);

  // --- Handlers ---

  const handleSearchLeads = async () => {
    if (!niche || !country) return;
    setLoading(true);
    setError(null);
    try {
      const results = await searchLeadsAI(niche, country);
      if (results.length === 0) {
        setError("The AI returned no results. This might be a connection issue or the model is still loading.");
      }
      setLeads(results);
    } catch (e: any) { 
      console.error(e); 
      setError(e.message || "An unexpected error occurred while contacting the AI.");
    }
    finally { setLoading(false); }
  };

  const handleRunAudit = async (lead: Lead) => {
    setSelectedLead(lead);
    setScanning(true);
    setError(null);
    try {
      const result = await performDeepAudit(lead.name, lead.niche || niche, lead.website);
      setAuditReport(result);
    } catch (e: any) { 
      console.error(e); 
      setError(`Audit Failed: ${e.message || "Unknown error"}`);
    }
    finally { setScanning(false); }
  };

  const handleOnboardLead = (lead: Lead) => {
    const newClientId = 'client-' + Math.random().toString(36).substr(2, 9);
    
    const newClient: ClientWithQueue = {
      id: newClientId,
      name: lead.name,
      email: lead.email,
      website: lead.website,
      status: 'onboarding',
      projectsCount: 1,
      joinedDate: new Date().toISOString().split('T')[0],
      socialConnections: [],
      autoPilot: { isEnabled: false, strategy: 'educational', frequency: 'daily', useLocalAI: false },
      queue: []
    };

    const newDeal: Deal = {
      id: 'deal-' + newClientId,
      clientName: lead.name,
      niche: lead.niche || niche,
      value: '$Pending',
      stage: 'Discovery',
      lastActivity: 'Just Onboarded'
    };

    setClients((prev: ClientWithQueue[]) => [...prev, newClient]);
    setDeals((prev: Deal[]) => [...prev, newDeal]);
    setLeads((prev: Lead[]) => prev.filter(l => l.id !== lead.id));
    setActiveTab('pipeline');
  };

  // --- Tab Views ---

  const renderDashboard = () => (
    <div className="p-8 space-y-8 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Clients', val: clients.length, icon: Users, color: 'indigo' },
          { label: 'Pipeline Deals', val: deals.length, icon: KanbanSquare, color: 'emerald' },
          { label: 'Market Leads', val: leads.length, icon: Search, color: 'blue' },
          { label: 'Social Syncs', val: clients.reduce((acc, c) => acc + (c.socialConnections?.length || 0), 0), icon: Share2, color: 'orange' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4`}><stat.icon size={24} /></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
             <h3 className="text-4xl font-black text-slate-800 mt-1">{stat.val}</h3>
          </div>
        ))}
      </div>
      
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl">
               <div className="flex items-center gap-3 mb-4">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-lg transition-all ${
                    aiStatus === 'online' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                    aiStatus === 'offline' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                    'bg-slate-500/20 text-slate-400 border-slate-500/30'
                  }`}>
                    {aiStatus === 'online' ? <Wifi size={12} /> : aiStatus === 'offline' ? <WifiOff size={12} /> : <RefreshCw size={12} className="animate-spin" />}
                    {aiStatus === 'online' ? 'LinkTeam AI: Connected' : aiStatus === 'offline' ? 'LinkTeam AI: Offline' : 'Verifying Socket...'}
                  </div>
               </div>
               <h3 className="text-4xl font-black mb-6 tracking-tight">Your Agency, on Private AI Autopilot.</h3>
               <p className="text-slate-400 font-medium text-lg leading-relaxed mb-8">
                  Bridge your SaaS with Ollama capabilities running directly on linkteam.us. Scale your client's social presence and lead radar without API costs or data leaks.
               </p>
               <div className="flex gap-4">
                  <button onClick={() => setActiveTab('integrations')} className="bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black hover:bg-indigo-50 transition-all">Configure Master Sync</button>
                  <button className="bg-slate-800 text-white px-8 py-5 rounded-[2rem] font-black border border-white/10 flex items-center gap-2">
                    <Activity size={18} className="text-indigo-400" />
                    Local Socket: 11434
                  </button>
               </div>
            </div>
            <div className="relative flex items-center justify-center">
               <div className="absolute w-48 h-48 bg-indigo-500 rounded-full animate-ping opacity-10"></div>
               <div className="w-32 h-32 bg-indigo-600 rounded-[3rem] flex items-center justify-center shadow-3xl shadow-indigo-900/50">
                  <Play size={40} fill="white" className="ml-2"/>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderLeads = () => (
    <div className="p-8 space-y-8 animate-in fade-in">
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">BizLink Radar</h2>
            <p className="text-slate-500 font-medium mt-1">Discover high-intent business leads globally via LinkTeam Local Engine.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 border transition-all ${
              aiStatus === 'online' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
               {aiStatus === 'online' ? <Cpu size={18} className="animate-pulse" /> : <AlertCircle size={18} />}
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                 {aiStatus === 'online' ? 'Local AI Active' : 'AI Service Unavailable'}
               </span>
            </div>
            <span className="text-[9px] font-black text-slate-300 uppercase">Provider: Ollama @ linkteam.us:11434</span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            value={niche} onChange={(e) => setNiche(e.target.value)}
            placeholder="Niche (e.g. Solar, SaaS)" 
            className="flex-1 px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black outline-none focus:border-indigo-500 transition-all"
          />
          <input 
            value={country} onChange={(e) => setCountry(e.target.value)}
            placeholder="Location" 
            className="flex-1 px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black outline-none focus:border-indigo-500 transition-all"
          />
          <button 
            onClick={handleSearchLeads} disabled={loading || aiStatus !== 'online'}
            className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search />} {aiStatus !== 'online' ? 'Service Offline' : 'Scan Market'}
          </button>
        </div>
        {aiStatus === 'offline' && (
          <p className="mt-4 text-xs font-bold text-red-500 flex items-center gap-2">
            <AlertCircle size={14} /> Connection to the AI engine failed. Please ensure Ollama is running and accessible on the server.
          </p>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle size={16} />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-lg"><X size={14}/></button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {leads.map(lead => (
          <div key={lead.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl mb-6">{lead.name[0]}</div>
            <h4 className="text-2xl font-black text-slate-800 mb-1">{lead.name}</h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 truncate">{lead.website}</p>
            
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-500"><Mail size={16} className="text-slate-300"/> {lead.email}</div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-500"><Phone size={16} className="text-slate-300"/> {lead.phone}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleRunAudit(lead)} className="py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs hover:bg-indigo-100 transition-all">Audit</button>
              <button onClick={() => handleOnboardLead(lead)} className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-100">Onboard</button>
            </div>
          </div>
        ))}
      </div>

      {scanning && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center">
           <div className="bg-white p-12 rounded-[3rem] text-center max-w-sm shadow-2xl">
              <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-6" />
              <h3 className="text-xl font-black mb-2">Deep Scanning...</h3>
              <p className="text-slate-500 font-medium">Extracting competitor data and SEO metrics via Private Local AI.</p>
           </div>
        </div>
      )}

      {auditReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
             <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                <h3 className="text-2xl font-black">Audit: {selectedLead?.name}</h3>
                <button onClick={() => setAuditReport(null)} className="p-2 hover:bg-white/10 rounded-xl"><X /></button>
             </div>
             <div className="p-10 overflow-y-auto bg-slate-50 flex-1 whitespace-pre-wrap font-medium text-slate-700 leading-relaxed">
                {auditReport.report}
             </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPipeline = () => {
    const stages = ['Discovery', 'Contacted', 'Proposal', 'Closed Won'];
    return (
      <div className="p-8 space-y-8 animate-in fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Revenue Pipeline</h2>
            <p className="text-slate-500 font-medium">Visualizing {deals.length} active opportunities.</p>
          </div>
          <button onClick={() => setActiveTab('leads')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-105 transition-all">
            + New Opportunity
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-10">
          {stages.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage);
            return (
              <div key={stage} className="min-w-[320px] bg-slate-100/50 rounded-[2.5rem] p-6 border border-slate-200/50 h-[700px] flex flex-col">
                 <div className="flex justify-between items-center mb-6 px-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{stage}</h4>
                    <span className="bg-white text-indigo-600 font-black text-[10px] px-2 py-0.5 rounded-lg">{stageDeals.length}</span>
                 </div>
                 <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                    {stageDeals.map(deal => (
                      <div key={deal.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:border-indigo-300 transition-all">
                         <div className="flex justify-between mb-4">
                            <span className="text-[9px] font-black px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg uppercase">{deal.niche}</span>
                            <MoreVertical size={14} className="text-slate-200" />
                         </div>
                         <h5 className="font-black text-slate-800 mb-1">{deal.clientName}</h5>
                         <p className="text-xs font-bold text-slate-400 mb-6">{deal.value}</p>
                         <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                            <Clock size={12} className="text-slate-300" />
                            <span className="text-[9px] font-black text-slate-300 uppercase">{deal.lastActivity}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderIntegrations = () => {
    const selectedClient = clients.find(c => c.id === selectedClientId);
    const platforms = [
      { id: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
      { id: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
      { id: 'TikTok', icon: Share2, color: 'text-black', bg: 'bg-slate-100' },
      { id: 'LinkedIn', icon: Linkedin, color: 'text-sky-700', bg: 'bg-sky-50' },
    ];

    const toggleSocialConnection = (clientId: string, platform: any) => {
      setSyncingPlatform(platform);
      setTimeout(() => {
        setClients((prev: ClientWithQueue[]) => prev.map(c => {
          if (c.id === clientId) {
            const socials = c.socialConnections || [];
            const existing = socials.find(s => s.platform === platform);
            if (existing) return { ...c, socialConnections: socials.filter(s => s.platform !== platform) };
            return { ...c, socialConnections: [...socials, { platform, status: 'connected', accountName: `${c.name} ${platform}`, lastSync: 'Now' }] };
          }
          return c;
        }));
        setSyncingPlatform(null);
      }, 1000);
    };

    const handleGenerateBatch = async () => {
      if (!selectedClient) return;
      setGeneratingBatch(true);
      setError(null);
      try {
        const platformsList = selectedClient.socialConnections?.map(s => s.platform) || ['LinkedIn'];
        const batch = await generateWeeklySocialBatch(selectedClient.name, selectedClient.website, selectedClient.autoPilot?.strategy || 'educational', platformsList);
        if (batch.length === 0) {
          setError("The AI failed to generate a content batch. Please try again.");
        }
        setClients((prev: ClientWithQueue[]) => prev.map(c => c.id === selectedClientId ? { ...c, queue: batch } : c));
      } catch (e: any) { 
        console.error(e); 
        setError(`Batch Generation Failed: ${e.message || "Unknown error"}`);
      }
      finally { setGeneratingBatch(false); }
    };

    return (
      <div className="p-8 space-y-10 animate-in fade-in max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
           <div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Social Sync Hub</h2>
              <p className="text-slate-500 font-medium">Manage cross-platform automation for your portfolio.</p>
           </div>
           <select 
              value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-6 py-4 bg-white border-2 border-slate-100 rounded-3xl font-black text-sm outline-none"
           >
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </select>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle size={16} />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-lg"><X size={14}/></button>
          </div>
        )}

        {selectedClient && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-black text-slate-800 mb-8">Account Links</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {platforms.map(p => {
                      const conn = selectedClient.socialConnections?.find(s => s.platform === p.id);
                      return (
                        <div key={p.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`${p.bg} ${p.color} p-4 rounded-2xl`}><p.icon size={24}/></div>
                            <div>
                               <p className="font-black text-slate-800">{p.id}</p>
                               <p className="text-[10px] text-slate-400 font-black uppercase">{conn ? 'Active' : 'Offline'}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => toggleSocialConnection(selectedClient.id, p.id as any)}
                            className={`p-3 rounded-2xl transition-all ${conn ? 'text-red-500 bg-red-50' : 'text-indigo-600 bg-indigo-50'}`}
                          >
                             {syncingPlatform === p.id ? <RefreshCw className="animate-spin" size={18}/> : conn ? <Trash2 size={18}/> : <Plus size={18}/>}
                          </button>
                        </div>
                      )
                    })}
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-slate-800">Content Queue</h3>
                    <button onClick={handleGenerateBatch} disabled={generatingBatch || aiStatus !== 'online'} className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black text-xs">
                      {generatingBatch ? 'AI Thinking...' : 'Refill Queue'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(selectedClient.queue || []).map((post, i) => (
                      <div key={i} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4 items-start">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm"><Share2 size={16}/></div>
                         <div className="flex-1">
                            <p className="text-[9px] font-black text-indigo-600 uppercase mb-1">Posted on {post.scheduledTime}</p>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">"{post.content}"</p>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <div className={`p-10 rounded-[3rem] border transition-all ${selectedClient.autoPilot?.isEnabled ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800 border-slate-100'}`}>
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black">Auto-Pilot</h3>
                    <button 
                      onClick={() => setClients((prev: ClientWithQueue[]) => prev.map(c => c.id === selectedClientId ? { ...c, autoPilot: { ...c.autoPilot!, isEnabled: !c.autoPilot!.isEnabled } } : c))}
                      className={`w-14 h-8 rounded-full relative transition-all ${selectedClient.autoPilot?.isEnabled ? 'bg-white/20' : 'bg-slate-100'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 rounded-full shadow-md transition-all ${selectedClient.autoPilot?.isEnabled ? 'right-1 bg-white' : 'left-1 bg-slate-400'}`}></div>
                    </button>
                  </div>
                  <div className="space-y-6">
                     {['educational', 'promotional', 'engagement'].map(s => (
                        <button 
                          key={s}
                          onClick={() => setClients((prev: ClientWithQueue[]) => prev.map(c => c.id === selectedClientId ? { ...c, autoPilot: { ...c.autoPilot!, strategy: s as any } } : c))}
                          className={`w-full py-4 rounded-2xl font-black text-xs capitalize border-2 ${selectedClient.autoPilot?.strategy === s ? 'bg-white text-indigo-600 border-white' : 'border-white/10'}`}
                        >
                           {s} Strategy
                        </button>
                     ))}
                     <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                        <span className="text-xs font-black uppercase">Ollama Local AI</span>
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${aiStatus === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {aiStatus === 'online' ? <Wifi size={12} /> : <WifiOff size={12} />}
                          <span className="text-[8px] font-black">{aiStatus === 'online' ? 'LINKED' : 'DISCONNECTED'}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderClients = () => (
    <div className="p-8 space-y-8 animate-in fade-in">
       <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Client Portfolio</h2>
            <p className="text-slate-500 font-medium">Tracking {clients.length} active agency accounts.</p>
          </div>
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black">+ New Client</button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clients.map(client => (
            <div key={client.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-start">
               <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center font-black text-3xl shrink-0">{client.name[0]}</div>
               <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h4 className="text-2xl font-black text-slate-800 truncate">{client.name}</h4>
                        <p className="text-xs font-bold text-slate-400 truncate">{client.website}</p>
                     </div>
                     <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase">{client.status}</span>
                  </div>
                  <button onClick={() => { setSelectedClientId(client.id); setActiveTab('integrations'); }} className="text-indigo-600 font-black text-xs uppercase flex items-center gap-2">Manage Sync <ArrowRight size={14}/></button>
               </div>
            </div>
          ))}
       </div>
    </div>
  );

  const renderTeam = () => (
    <div className="p-8 space-y-8 animate-in fade-in">
       <div className="flex justify-between items-center">
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">My Team</h2>
          <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2">
             <UserPlus size={18}/> Invite Staff
          </button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map(member => (
            <div key={member.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
               <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl mb-6">{member.name[0]}</div>
               <h4 className="font-black text-slate-800 mb-1">{member.name}</h4>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{member.role}</p>
            </div>
          ))}
       </div>
    </div>
  );

  const getContent = () => {
    switch(tab) {
      case 'dashboard': return renderDashboard();
      case 'leads': return renderLeads();
      case 'pipeline': return renderPipeline();
      case 'integrations': return renderIntegrations();
      case 'clients': return renderClients();
      case 'team': return renderTeam();
      case 'audits': return <div className="p-20 text-center"><ClipboardCheck size={80} className="mx-auto text-slate-100 mb-4"/><p className="font-black text-slate-300 uppercase tracking-widest">Reports Module Linked to Leads Radar</p></div>;
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {getContent()}
    </div>
  );
};

export default AgencyDashboard;
