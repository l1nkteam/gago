
import React, { useState } from 'react';
import { generateSocialPost } from '../services/geminiService';
import { PenTool, CheckCircle2, Clock, MessageSquare, Download, Share2, Wand2 } from 'lucide-react';

const ClientDashboard: React.FC<{ tab: string }> = ({ tab }) => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    const result = await generateSocialPost(topic, platform);
    setContent(result || '');
    setLoading(false);
  };

  if (tab === 'ai-content') {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">AI Content Generator</h2>
            <p className="text-slate-500">Generate high-quality social posts instantly for your business.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">What's the post about?</label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. New collection launch, Year-end sale announcement..."
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none min-h-[120px]"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {['Instagram', 'LinkedIn', 'Twitter', 'Facebook'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-6 py-2 rounded-full font-bold transition-all text-sm border-2 ${
                    platform === p 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'border-slate-100 text-slate-500 hover:border-indigo-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin w-6 h-6 border-4 border-white/20 border-t-white rounded-full" />
              ) : (
                <>
                  <Wand2 size={24} />
                  Generate Post
                </>
              )}
            </button>
          </div>
        </div>

        {content && (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-md animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">Generated Post</span>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50">
                  <Download size={20} />
                </button>
                <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 whitespace-pre-wrap leading-relaxed">
              {content}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (tab === 'dashboard') {
    return (
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100">
            <h4 className="text-white/70 text-sm font-medium mb-1">Overall SEO Health</h4>
            <p className="text-3xl font-bold">84%</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">+4% from last month</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="text-slate-400 text-sm font-medium mb-1">Open Tasks</h4>
            <p className="text-3xl font-bold text-slate-800">12</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="text-slate-400 text-sm font-medium mb-1">Unread Alerts</h4>
            <p className="text-3xl font-bold text-slate-800">5</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="text-slate-400 text-sm font-medium mb-1">Total Audits</h4>
            <p className="text-3xl font-bold text-slate-800">28</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Project Progress</h3>
              <button className="p-2 bg-slate-50 rounded-full"><Clock size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-6">
              {[
                { name: 'Website Optimization', status: 'In Progress', icon: Clock, color: 'text-orange-500' },
                { name: 'Keyword Research', status: 'Completed', icon: CheckCircle2, color: 'text-emerald-500' },
                { name: 'Backlink Campaign', status: 'In Progress', icon: Clock, color: 'text-orange-500' },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${task.color}`}>
                    <task.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-700">{task.name}</p>
                    <p className="text-xs text-slate-400 font-semibold uppercase">{task.status}</p>
                  </div>
                  <button className="text-indigo-600"><MessageSquare size={18} /></button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Need a Boost?</h3>
              <p className="text-white/60 mb-6 max-w-[200px]">Unlock Advanced AI Tools and 24/7 Support with Pro.</p>
              <button className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-all">
                Upgrade Now
              </button>
            </div>
            <PenTool size={120} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
          </div>
        </div>
      </div>
    );
  }

  return <div className="p-8 text-center text-slate-400">Section Under Construction</div>;
};

export default ClientDashboard;
