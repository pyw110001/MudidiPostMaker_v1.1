import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, AlertCircle, Sparkles, Download, DownloadCloud } from 'lucide-react';
import { HistoryItem } from '../App';

interface PreviewProps {
  isGenerating: boolean;
  generatedImage: string | null;
  error: string | null;
  ratio: string;
  history: HistoryItem[];
  onSelectHistory: (url: string) => void;
}

export function Preview({ isGenerating, generatedImage, error, ratio, history, onSelectHistory }: PreviewProps) {
  // Calculate aspect ratio for the container
  const [w, h] = ratio.split(':').map(Number);
  const aspectRatio = w / h;

  const handleBatchExport = () => {
    if (history.length === 0) return;
    
    // Quick toast/alert could go here, but a simple delay download loop works well
    history.forEach((item, index) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = item.url;
        a.download = `mudidi-poster-${item.timestamp}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 400); // 400ms delay to prevent browser ad-blockers from stopping multiple downloads
    });
  };

  return (
    <div className="w-full lg:flex-1 h-[45dvh] lg:h-auto relative flex flex-col p-4 lg:p-8 bg-[#0a0a0c] overflow-hidden shrink-0">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] lg:w-[800px] lg:h-[800px] bg-indigo-500/5 rounded-full blur-[80px] lg:blur-[120px]" />
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 relative w-full h-full flex items-center justify-center min-h-0 mb-4 lg:mb-6">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-red-400 max-w-md text-center p-8 bg-red-500/5 rounded-3xl border border-red-500/10"
            >
              <AlertCircle className="w-12 h-12 mb-4 opacity-80" />
              <p className="font-medium">{error}</p>
            </motion.div>
          ) : isGenerating ? (
            <motion.div 
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-16 h-16 lg:w-24 lg:h-24 mb-4 lg:mb-6">
                <div className="absolute inset-0 border-2 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-2 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 lg:w-6 lg:h-6 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <p className="text-xs lg:text-sm font-medium text-zinc-400 tracking-widest uppercase">正在绘制海报...<br className="lg:hidden"/>(Crafting your poster...)</p>
            </motion.div>
          ) : generatedImage ? (
            <motion.div 
              key="image"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="relative max-h-full max-w-full flex items-center justify-center"
              style={{ aspectRatio }}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group">
                <img 
                  src={generatedImage} 
                  alt="Generated Poster" 
                  className="w-full h-full object-contain bg-black/50"
                />
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                  <a 
                    href={generatedImage} 
                    download={`poster-${Date.now()}.png`}
                    className="px-6 py-3 bg-white text-black rounded-full font-medium hover:scale-105 transition-transform shadow-xl"
                  >
                    下载高清大图 (Download High-Res)
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-zinc-600"
            >
              <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl border border-dashed border-zinc-700 flex items-center justify-center mb-4 lg:mb-6 bg-zinc-900/50">
                <ImageIcon className="w-6 h-6 lg:w-8 lg:h-8 opacity-50" />
              </div>
              <p className="text-xs lg:text-sm font-medium tracking-wide">等待生成 (Ready to create)</p>
              <p className="text-[10px] lg:text-xs mt-1 lg:mt-2 opacity-50">MUDIDI ARCHITECT × GEMINI 3.1 PRO</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History Ribbon */}
      <div className="h-20 lg:h-28 shrink-0 flex items-center gap-2 lg:gap-4 bg-black/40 border border-white/5 rounded-xl lg:rounded-2xl p-2 lg:p-4 backdrop-blur-md z-10 w-full overflow-hidden">
        
        {/* Batch Export Button */}
        <div className="shrink-0 flex flex-col h-full border-r border-white/10 pr-2 lg:pr-4 mr-1 lg:mr-2">
          <button
            onClick={handleBatchExport}
            disabled={history.length === 0}
            className="flex-1 px-3 lg:px-4 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg lg:rounded-xl flex flex-col items-center justify-center gap-1 lg:gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-indigo-500/20"
          >
            <DownloadCloud className="w-4 h-4 lg:w-6 lg:h-6" />
            <span className="text-[8px] lg:text-[10px] font-semibold uppercase tracking-wider text-center leading-tight">一键导出<br className="hidden lg:block"/>({history.length})</span>
          </button>
        </div>

        {/* History Items */}
        {history.length === 0 ? (
          <div className="flex-1 h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-zinc-600 text-xs font-medium">
             暂无历史记录 (No history yet)
          </div>
        ) : (
          <div className="flex-1 h-full flex gap-3 overflow-x-auto custom-scrollbar items-center px-2 pb-1">
            <AnimatePresence>
              {history.map((item) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  layout
                  onClick={() => onSelectHistory(item.url)}
                  className={`relative shrink-0 h-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    generatedImage === item.url 
                      ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                      : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={item.url} alt="History thumbnail" className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
