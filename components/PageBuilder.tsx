
import React, { useState } from 'react';
import { Layout, Type, Image as ImageIcon, MousePointer2, Save, Eye, Plus, Trash2, GripVertical } from 'lucide-react';

interface Block {
  id: string;
  type: string;
  content: string;
}

const PageBuilder: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'Hero', content: 'Transform Your Digital Presence' },
    { id: '2', type: 'Features', content: 'AI Powered Lead Generation & SEO' }
  ]);

  const addBlock = (type: string) => {
    setBlocks([...blocks, { id: Date.now().toString(), type, content: `New ${type} Content` }]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 p-6">
      {/* Block Library */}
      <div className="w-72 bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Block Library</h3>
        {[
          { icon: Layout, label: 'Hero Section', type: 'Hero' },
          { icon: Type, label: 'Text Block', type: 'Text' },
          { icon: ImageIcon, label: 'Image Gallery', type: 'Image' },
          { icon: Plus, label: 'Pricing Table', type: 'Pricing' },
          { icon: MousePointer2, label: 'Call to Action', type: 'CTA' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => addBlock(item.type)}
            className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all group border border-transparent hover:border-indigo-100"
          >
            <item.icon size={18} className="text-slate-400 group-hover:text-indigo-600" />
            <span className="text-sm font-semibold">{item.label}</span>
          </button>
        ))}
        <div className="mt-auto p-4 bg-indigo-600 rounded-2xl text-white">
          <p className="text-xs font-medium opacity-80 mb-2">Need Custom Blocks?</p>
          <button className="text-xs font-bold underline">Contact Support</button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="flex-1 bg-slate-100 rounded-3xl border-4 border-dashed border-slate-200 overflow-y-auto p-8 relative group">
        <div className="flex justify-between items-center mb-8 sticky top-0 z-10 bg-slate-100/80 backdrop-blur-md py-2">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50">
              <Eye size={16} /> Preview
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-6 max-w-4xl mx-auto">
          {blocks.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <Plus size={48} className="mb-4 opacity-20" />
              <p className="font-medium">Click a block on the left to start building</p>
            </div>
          )}
          {blocks.map((block) => (
            <div key={block.id} className="relative group/block bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[100px] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <GripVertical className="text-slate-300 cursor-grab" size={20} />
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-500 tracking-tighter mb-1 block">{block.type}</span>
                  <h4 className="text-xl font-bold text-slate-800">{block.content}</h4>
                </div>
              </div>
              <button 
                onClick={() => removeBlock(block.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;
