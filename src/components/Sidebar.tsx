import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, X, Wand2 } from 'lucide-react';

interface SidebarProps {
  referenceImage: {data: string, mime: string} | null;
  setReferenceImage: (img: {data: string, mime: string} | null) => void;
  quantity: string;
  setQuantity: (val: string) => void;
  season: string;
  setSeason: (val: string) => void;
  holiday: string;
  setHoliday: (val: string) => void;
  action: string;
  setAction: (val: string) => void;
  scene: string;
  setScene: (val: string) => void;
  ratio: string;
  setRatio: (val: string) => void;
  promptPreview: string;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function Sidebar({
  referenceImage, setReferenceImage,
  quantity, setQuantity,
  season, setSeason,
  holiday, setHoliday,
  action, setAction,
  scene, setScene,
  ratio, setRatio,
  promptPreview,
  onGenerate,
  isGenerating
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage({
          data: reader.result as string,
          mime: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-[380px] h-full flex flex-col bg-[#121214]/80 backdrop-blur-3xl border-r border-white/5 z-10">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Wand2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white">MUDIDI POSTER ARCHITECT</h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* Reference Image */}
        <section>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 block">参考角色 (Reference)</label>
          <div 
            onClick={() => !referenceImage && fileInputRef.current?.click()}
            className={`relative w-full h-32 rounded-2xl border border-dashed transition-all duration-200 flex flex-col items-center justify-center overflow-hidden group ${
              referenceImage 
                ? 'border-white/20 bg-black/40' 
                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 cursor-pointer'
            }`}
          >
            {referenceImage ? (
              <>
                <img src={referenceImage.data} alt="Reference" className="w-full h-full object-cover opacity-60" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setReferenceImage(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 rounded-full backdrop-blur-md transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-zinc-500 mb-2 group-hover:text-zinc-300 transition-colors" />
                <span className="text-xs text-zinc-500 font-medium group-hover:text-zinc-300 transition-colors">点击上传参考图 (Click to Upload)</span>
              </>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>
        </section>

        {/* Selectors */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">数量 (Quantity)</label>
            <select 
              value={quantity} onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-200 appearance-none outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            >
              {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="bg-zinc-900">{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">季节 (Season)</label>
            <select 
              value={season} onChange={(e) => setSeason(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-200 appearance-none outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            >
              {['无 (None)', '春 (Spring)', '夏 (Summer)', '秋 (Autumn)', '冬 (Winter)'].map(s => <option key={s} value={s} className="bg-zinc-900">{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">节日 (Holiday)</label>
            <select 
              value={holiday} onChange={(e) => setHoliday(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-200 appearance-none outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            >
              {['无 (None)', '新年 (New Year)', '春节 (Spring Festival)', '圣诞 (Christmas)', '中秋 (Mid-Autumn)', '万圣节 (Halloween)'].map(h => <option key={h} value={h} className="bg-zinc-900">{h}</option>)}
            </select>
          </div>
        </div>

        {/* Text Inputs */}
        <section className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">动作 (Action)</label>
            <input 
              type="text" value={action} onChange={(e) => setAction(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
              placeholder="例如：围坐在桌旁吃点心..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">场景 (Scene)</label>
            <textarea 
              value={scene} onChange={(e) => setScene(e.target.value)} rows={2}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none placeholder:text-zinc-600"
              placeholder="例如：装饰着荷花的温馨餐厅..."
            />
          </div>
        </section>

        {/* Ratio */}
        <section>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 block">比例 (Ratio)</label>
          <div className="flex bg-black/30 p-1 rounded-xl border border-white/5">
            {['1:1', '3:4', '4:3', '9:16', '16:9'].map(r => (
              <button
                key={r}
                onClick={() => setRatio(r)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  ratio === r 
                    ? 'bg-zinc-700 text-white shadow-md' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* Prompt Preview */}
        <section>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block flex justify-between items-center">
            <span>提示词预览 (Prompt Preview)</span>
          </label>
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-xs text-zinc-500 leading-relaxed font-mono whitespace-pre-wrap">
            {promptPreview}
          </div>
        </section>

      </div>

      {/* Footer / Generate Button */}
      <div className="p-6 border-t border-white/5 bg-[#121214]/90 backdrop-blur-xl">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full relative group overflow-hidden rounded-xl bg-white text-black font-semibold py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center justify-center gap-2">
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                生成中 (Generating...)
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                立即生成 (Generate)
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
